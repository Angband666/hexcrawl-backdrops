// World macros, created once (and on request):
//   Weather…   Backdrop variant…                       (dialogs, in the main folder)
//   Weather: Rain, …                                   (one quick macro per weather, folder "Weather")
//   Backdrop: Automatic, Day, Night, Dusk, Autumn, Spring, Winter, Camp at dusk, Camp at night   (folder "Backdrop")
import { MOD, PATH } from "./constants.mjs";
import { IDS } from "./ownweather.mjs";

export const MACROS_VERSION = 2;   // raise when macros are added, existing worlds then get the new ones on the next start
const API = `game.modules.get("${MOD}").api`;
const WL = { clear: ["Clear", "Klar"], cloudy: ["Cloudy", "Bewölkt"], windy: ["Windy", "Windig"], mist: ["Mist", "Dunst"], fog: ["Fog", "Nebel"],
  drizzle: ["Drizzle", "Nieselregen"], rain: ["Rain", "Regen"], storm: ["Thunderstorm", "Gewitter"], snow: ["Snow", "Schnee"], blizzard: ["Blizzard", "Schneesturm"] };
// variant key -> [icon, English, Deutsch]; "auto" returns to automatic selection
const VL = { auto: ["v-auto", "Automatic", "Automatisch"], tag: ["v-tag", "Day", "Tag"], nacht: ["v-nacht", "Night", "Nacht"], daemmerung: ["v-daemmerung", "Dusk", "Dämmerung"],
  herbst: ["v-herbst", "Autumn", "Herbst"], fruehling: ["v-fruehling", "Spring", "Frühling"], winter: ["v-winter", "Winter", "Winter"],
  lager_abend: ["v-lager_abend", "Camp at dusk", "Lager am Abend"], lager_nacht: ["v-lager_nacht", "Camp at night", "Lager bei Nacht"] };
const icon = n => `${PATH}assets/icons/${n}.png`;
const FOLDERS = { macros: { en: "Hexcrawl Backdrops", de: "Hexcrawl Backdrops" }, "macros-weather": { en: "Weather", de: "Wetter" }, "macros-backdrop": { en: "Backdrop", de: "Bild" } };

export function macroDefs(lang) {
  const de = lang === "de", i = de ? 1 : 0, j = de ? 2 : 1;
  const defs = [
    { key: "weather", folder: "macros", name: de ? "Wetter…" : "Weather…", img: icon("weather"), command: `${API}.chooseWeather();` },
    { key: "variant", folder: "macros", name: de ? "Bildvariante…" : "Backdrop variant…", img: icon("variant"), command: `${API}.chooseVariant();` }
  ];
  for (const id of IDS) defs.push({ key: `w-${id}`, folder: "macros-weather", name: `${de ? "Wetter" : "Weather"}: ${WL[id][i]}`, img: icon(id), command: `${API}.setWeather("${id}");` });
  for (const [k, v] of Object.entries(VL)) defs.push({ key: `v-${k}`, folder: "macros-backdrop", name: `${de ? "Bild" : "Backdrop"}: ${v[j]}`, img: icon(v[0]), command: `${API}.setVariant(canvas.scene, "${k}");` });
  return defs;
}

async function toHotbar(macro) {
  try {
    const hb = game.user.hotbar ?? {};
    if (Object.values(hb).some(id => game.macros.get(id)?.getFlag(MOD, "macro"))) return;
    for (let slot = 1; slot <= 10; slot++) if (!hb[slot]) { await game.user.assignHotbarMacro(macro, slot); return; }
  } catch (e) { console.warn(`${MOD} | hotbar`, e); }
}

async function folderFor(key, lang, update) {
  const name = FOLDERS[key][lang === "de" ? "de" : "en"];
  let f = game.folders.find(x => x.type === "Macro" && x.getFlag(MOD, "key") === key);
  if (f) { if (update && f.name !== name) await f.update({ name }); return f; }
  const parent = key === "macros" ? null : await folderFor("macros", lang, update);
  return Folder.create({ name, type: "Macro", folder: parent?.id ?? null, sorting: "m", flags: { [MOD]: { key } } });
}

/** Creates missing macros; with update=true renames and re-links existing ones to the chosen language. */
export async function ensureMacros({ lang, update = false } = {}) {
  if (!game.user.isGM) return { created: 0, updated: 0 };
  lang ??= game.settings.get(MOD, "language");
  const folders = {};
  let created = 0, updated = 0;
  for (const m of macroDefs(lang)) {
    folders[m.folder] ??= await folderFor(m.folder, lang, update);
    const ex = game.macros.find(x => x.getFlag(MOD, "macro") === m.key);
    if (ex) { if (update) { await ex.update({ name: m.name, img: m.img, command: m.command, folder: folders[m.folder].id }); updated++; } continue; }
    const doc = await Macro.create({ name: m.name, type: "script", img: m.img, command: m.command, folder: folders[m.folder].id, flags: { [MOD]: { macro: m.key } } });
    created++;
    if (m.key === "weather") await toHotbar(doc);
  }
  await game.settings.set(MOD, "macrosVersion", MACROS_VERSION);
  return { created, updated };
}
