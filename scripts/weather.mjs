// Weather engine: picks the backdrop variant of a scene from the Dolmenwood calendar (time of day, season) and the weather table,
// and switches FXMaster presets. Runs on the active GM only. Works on scenes created by this module (flag hexcrawl-backdrops.scene).
import { MOD, t } from "./constants.mjs";

// Rules: the first matching rule wins. fx = FXMaster preset (null = clear), opts = preset options, bild = preferred variant (null = by season/time).
// Patterns cover the English weather tables and German weather texts.
const RULES = [
  { re: /blizzard|snow ?storm|schneesturm/i,                                       fx: "blizzard",     bild: "winter" },
  { re: /freezing rain|sleet|eisregen/i,                                           fx: "sleet",        bild: "regen" },
  { re: /snow|schneefall|schnee/i,                                                 fx: "snow",         bild: "winter" },
  { re: /thunder|gewitter|donner/i,                                                fx: "thunderstorm", bild: "gewitter" },
  { re: /torrential|pouring|driving rain|downpour|sintflut|strömend|peitschend/i,  fx: "rain",         opts: { density: "high" }, bild: "regen" },
  { re: /drizzle|gentle rain|\brain\b|nieselregen|sanfter regen|regen/i,           fx: "drizzle",      bild: "regen" },
  { re: /violet|purple|violett/i,                                                  fx: "rolling-fog",  opts: { color: "#9b6bd6" }, bild: "regen" },
  { re: /green fog|grün/i,                                                         fx: "rolling-fog",  opts: { color: "#6fbf5a" }, bild: "regen" },
  { re: /yellow|gelb/i,                                                            fx: "rolling-fog",  opts: { color: "#d8c35a" }, bild: "regen" },
  { re: /freezing fog|icy mist|frigid mist|chill mist|gefrierend|eisiger nebel|eisiger dunst/i, fx: "fog", opts: { color: "#dfefff" }, bild: "winter" },
  { re: /fog|nebel|neblig/i,                                                       fx: "fog",          bild: "nebel" },
  { re: /mist|dew|damp|hazy|dunst|tau tropft|schatten tropfen/i,                   fx: "mist",         bild: "nebel", ersatz: [] },
  { re: /hoarfrost|frost|frigid|icy|bitter|deep freeze|raureif|eisig|bitterkalt/i, fx: null,           bild: "winter" },
  { re: /wind|blustery|bracing|breeze|böig/i,                                      fx: "windy",        bild: null },
  { re: /overcast|cloud|gloomy|brooding|muggy|bedeckt|bewölkt|wolken|trüb/i,       fx: "overcast",     bild: null },
  { re: /.*/,                                                                      fx: null,           bild: null }
];
// Scene darkening per variant (only for scenes flagged "light")
const DARKNESS = { tag: 0, winter: 0, morgen: 0, regen: 0.15, daemmerung: 0.3, nacht: 0.5, sturm: 0.5, lager_abend: 0.3, lager_nacht: 0.55, gewitter: 0.35, nebel: 0.1, herbst: 0, fruehling: 0 };
const ERSATZ = { gewitter: ["regen"], nebel: ["regen"] };
const SAISON = { winter: "winter", autumn: "herbst", spring: "fruehling" };

const flagOf = scene => scene?.getFlag(MOD, "scene");
const ruleFor = text => RULES.find(r => r.re.test(text ?? ""));
const isInterior = f => !!f?.interior;

let cal = null;
async function calendar() {
  if (!cal) { try { cal = await import("/systems/dolmenwood/module/calendar/calendar-time.js"); } catch (e) { cal = {}; } }
  if (!cal.worldTimeToCalendar) return null;
  const c = cal.worldTimeToCalendar(game.time.worldTime);
  const d = cal.getDaylightHours?.(c.monthKey) ?? { sunrise: 6, sunset: 18 };
  return { season: cal.getSeason?.(c.monthKey), hour: c.hour + c.minute / 60, sunrise: d.sunrise, sunset: d.sunset };
}

/** Which variant fits? Priority: night > weather picture (storm/mist/rain/winter) > dusk > season > day. */
function pickVariant(f, rule, c) {
  const has = k => k === "tag" || !!f.variants?.[k];
  const wetterBild = () => {
    if (!rule?.bild) return null;
    for (const k of [rule.bild, ...(rule.ersatz ?? ERSATZ[rule.bild] ?? [])]) if (has(k)) return k;
    return null;
  };
  if (c && game.settings.get(MOD, "timeOfDay")) {
    const { hour, sunrise, sunset } = c;
    const night = hour < sunrise - 1 || hour >= sunset + 1;
    const dusk = !night && (Math.abs(hour - sunset) < 1 || Math.abs(hour - sunrise) < 1);
    if (night && has("nacht")) return "nacht";
    const wb = wetterBild(); if (wb) return wb;
    if (dusk && has("daemmerung")) return "daemmerung";
  } else { const wb = wetterBild(); if (wb) return wb; }
  const saison = SAISON[c?.season];
  if (saison && game.settings.get(MOD, "seasons") && has(saison)) return saison;
  return "tag";
}

/** Light sources that only belong to certain variants (campfire only in the camp variants). */
async function syncLights(scene, key) {
  if (!game.user.isActiveGM || !scene) return;
  const upd = scene.lights.filter(l => Array.isArray(l.getFlag(MOD, "atmo")))
    .map(l => ({ _id: l.id, hidden: !l.getFlag(MOD, "atmo").includes(key), cur: l.hidden }))
    .filter(u => u.hidden !== u.cur).map(({ _id, hidden }) => ({ _id, hidden }));
  if (upd.length) await scene.updateEmbeddedDocuments("AmbientLight", upd);
}

async function syncDarkness(scene, f, key) {
  if (!f.light || DARKNESS[key] === undefined) return;
  const dl = Math.round(DARKNESS[key] * (typeof f.light === "number" ? f.light : 1) * 100) / 100;
  if (scene.environment?.darknessLevel !== dl) await scene.update({ "environment.darknessLevel": dl }, { animateDarkness: 2000 });
}

export async function apply(scene, force = false) {
  if (!game.user.isActiveGM || !scene || !game.settings.get(MOD, "auto")) return;
  const f = flagOf(scene);
  if (!f) return;
  const weather = game.settings.get("dolmenwood", "currentWeather") ?? {};
  const rule = ruleFor(weather.text);
  const c = await calendar();
  let key = f.current ?? "tag";
  if (!f.manual || force) {
    key = pickVariant(f, rule, c);
    if (key !== f.current || force) {
      const img = key === "tag" ? f.tag : f.variants[key];
      const lvl = scene.levels?.contents?.[0];
      if (lvl) await lvl.update({ "background.src": img }); else await scene.update({ "background.src": img });
      await scene.update({ [`flags.${MOD}.scene.current`]: key, [`flags.${MOD}.scene.manual`]: false });
    }
  }
  await syncDarkness(scene, f, key);
  await syncLights(scene, key);
  // FXMaster
  const fxOk = globalThis.FXMASTER?.api?.presets && game.settings.get(MOD, "fxScope") === "module" && !f.noFx;
  if (fxOk) {
    const fx = isInterior(f) ? null : (rule?.fx || null);   // no rain indoors
    try { await FXMASTER.api.presets.switch(fx, { scene, silent: true, ...(fx ? (rule.opts ?? {}) : {}) }); } catch (e) { console.warn(`${MOD} | FXMaster`, e); }
  }
  console.log(`${MOD} | "${weather.text ?? ""}", ${c?.season ?? "?"} ${c ? c.hour.toFixed(1) + "h" : ""} -> ${key} (${scene.name})`);
}

/** Dialog: set a variant by hand for the current scene (or go back to automatic). */
export async function chooseVariant(scene = canvas?.scene) {
  const f = flagOf(scene);
  if (!f) return ui.notifications.warn(t("HCB.warn.notModuleScene"));
  const keys = ["tag", ...Object.keys(f.variants ?? {})];
  const label = k => (k === "tag" ? t("HCB.variant.tag") : t(`HCB.variant.${k}`));
  const options = [`<option value="auto">${t("HCB.variant.auto")}</option>`, ...keys.map(k => `<option value="${k}" ${!f.manual ? "" : f.current === k ? "selected" : ""}>${label(k)}</option>`)].join("");
  const choice = await foundry.applications.api.DialogV2.prompt({
    window: { title: t("HCB.variant.title") }, rejectClose: false,
    content: `<div class="form-group"><label>${t("HCB.variant.label")}</label><select name="variant">${options}</select></div>`,
    ok: { label: t("HCB.ok"), callback: (ev, button) => button.form.elements.variant.value }
  });
  if (!choice) return;
  return setVariant(scene, choice);
}

/** Set a variant by key ("tag", "nacht", ...) or "auto" for the scene. */
export async function setVariant(scene, choice) {
  const f = flagOf(scene);
  if (!f) return ui.notifications.warn(t("HCB.warn.notModuleScene"));
  if (choice === "auto") { await scene.update({ [`flags.${MOD}.scene.manual`]: false }); return apply(scene, true); }
  if (choice !== "tag" && !f.variants?.[choice]) return ui.notifications.warn(t("HCB.warn.noVariant", { variant: t(`HCB.variant.${choice}`) }));
  await scene.update({ [`flags.${MOD}.scene.manual`]: true, [`flags.${MOD}.scene.current`]: choice });
  const img = choice === "tag" ? f.tag : f.variants[choice];
  const lvl = scene.levels?.contents?.[0];
  if (lvl) await lvl.update({ "background.src": img }); else await scene.update({ "background.src": img });
  await syncLights(scene, choice);
  await syncDarkness(scene, f, choice);
}

export function initWeather() {
  Hooks.on("updateScene", (scene, diff) => {
    const k = foundry.utils.getProperty(diff, `flags.${MOD}.scene.current`);
    if (k) { syncLights(scene, k); }
  });
  Hooks.on("updateSetting", setting => { if (setting.key === "dolmenwood.currentWeather") apply(canvas.scene); });
  Hooks.on("canvasReady", canvas => apply(canvas.scene));
  let tmr; Hooks.on("updateWorldTime", () => { clearTimeout(tmr); tmr = setTimeout(() => apply(canvas.scene), 500); });
}
