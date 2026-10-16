// World macros: "Weather…", "Backdrop variant…" and one quick macro per weather, in a macro folder. Created once (and on request).
import { MOD, PATH } from "./constants.mjs";
import { IDS } from "./ownweather.mjs";

const API = `game.modules.get("${MOD}").api`;
const WL = { clear: ["Clear", "Klar"], cloudy: ["Cloudy", "Bewölkt"], windy: ["Windy", "Windig"], mist: ["Mist", "Dunst"], fog: ["Fog", "Nebel"],
  drizzle: ["Drizzle", "Nieselregen"], rain: ["Rain", "Regen"], storm: ["Thunderstorm", "Gewitter"], snow: ["Snow", "Schnee"], blizzard: ["Blizzard", "Schneesturm"] };
const icon = n => `${PATH}assets/icons/${n}.png`;

export function macroDefs(lang) {
  const de = lang === "de", i = de ? 1 : 0;
  const defs = [
    { key: "weather", name: de ? "Wetter…" : "Weather…", img: icon("weather"), command: `${API}.chooseWeather();` },
    { key: "variant", name: de ? "Bildvariante…" : "Backdrop variant…", img: icon("variant"), command: `${API}.chooseVariant();` }
  ];
  for (const id of IDS) defs.push({ key: `w-${id}`, name: `${de ? "Wetter" : "Weather"}: ${WL[id][i]}`, img: icon(id), command: `${API}.setWeather("${id}");` });
  return defs;
}

async function toHotbar(macro) {
  try {
    const hb = game.user.hotbar ?? {};
    if (Object.values(hb).some(id => game.macros.get(id)?.getFlag(MOD, "macro"))) return;
    for (let slot = 1; slot <= 10; slot++) if (!hb[slot]) { await game.user.assignHotbarMacro(macro, slot); return; }
  } catch (e) { console.warn(`${MOD} | hotbar`, e); }
}

/** Creates missing macros; with update=true renames and re-links existing ones to the chosen language. */
export async function ensureMacros({ lang, update = false } = {}) {
  if (!game.user.isGM) return { created: 0, updated: 0 };
  lang ??= game.settings.get(MOD, "language");
  let folder = game.folders.find(f => f.type === "Macro" && f.getFlag(MOD, "key") === "macros");
  if (!folder) folder = await Folder.create({ name: "Hexcrawl Backdrops", type: "Macro", sorting: "m", flags: { [MOD]: { key: "macros" } } });
  let created = 0, updated = 0;
  for (const m of macroDefs(lang)) {
    const ex = game.macros.find(x => x.getFlag(MOD, "macro") === m.key);
    if (ex) { if (update) { await ex.update({ name: m.name, img: m.img, command: m.command, folder: folder.id }); updated++; } continue; }
    const doc = await Macro.create({ name: m.name, type: "script", img: m.img, command: m.command, folder: folder.id, flags: { [MOD]: { macro: m.key } } });
    created++;
    if (m.key === "weather") await toHotbar(doc);
  }
  await game.settings.set(MOD, "macrosDone", true);
  return { created, updated };
}
