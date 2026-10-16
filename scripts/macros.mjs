// World macros, created once (and on request):
//   Backdrop variant…            (dialog, in the main folder, also put on the hotbar)
//   Backdrop: Day, Night, Dusk, Rain & mist, Thunderstorm, Light mist, Winter, Autumn, Spring, Stormy night, Morning, Camp at dusk, Camp at night
//                                (one quick macro per variant, folder "Backdrop")
// Older versions also created weather macros; those are removed again.
import { MOD, PATH } from "./constants.mjs";
import { ORDER } from "./variants.mjs";

export const MACROS_VERSION = 4;   // raise when macros change, existing worlds then get the update on the next start
const API = `game.modules.get("${MOD}").api`;
// variant key -> [icon, English, Deutsch]
const VL = {
  tag: ["v-tag", "Day", "Tag"], nacht: ["v-nacht", "Night", "Nacht"], daemmerung: ["v-daemmerung", "Dusk", "Dämmerung"], regen: ["rain", "Rain & mist", "Regen & Nebel"],
  gewitter: ["storm", "Thunderstorm", "Gewitter"], nebel: ["mist", "Light mist", "Leichter Nebel"], winter: ["v-winter", "Winter", "Winter"], herbst: ["v-herbst", "Autumn", "Herbst"],
  fruehling: ["v-fruehling", "Spring", "Frühling"], sturm: ["storm", "Stormy night", "Sturmnacht"], morgen: ["clear", "Morning", "Morgen"],
  lager_abend: ["v-lager_abend", "Camp at dusk", "Lager am Abend"], lager_nacht: ["v-lager_nacht", "Camp at night", "Lager bei Nacht"]
};
const icon = n => `${PATH}assets/icons/${n}.png`;
const FOLDERS = { macros: { en: "Hexcrawl Backdrops", de: "Hexcrawl Backdrops" }, "macros-backdrop": { en: "Backdrop", de: "Bild" } };

export function macroDefs(lang) {
  const de = lang === "de", j = de ? 2 : 1;
  const defs = [{ key: "variant", folder: "macros", name: de ? "Bildvariante…" : "Backdrop variant…", img: icon("variant"), command: `${API}.chooseVariant();` }];
  for (const k of ORDER) defs.push({ key: `v-${k}`, folder: "macros-backdrop", name: `${de ? "Bild" : "Backdrop"}: ${VL[k][j]}`, img: icon(VL[k][0]), command: `${API}.setVariant(canvas.scene, "${k}");` });
  return defs;
}

/** Puts a macro on the first free slot of the first hotbar page, unless it is already on the bar. */
async function toHotbar(macro) {
  try {
    const hb = game.user.hotbar ?? {};
    if (Object.values(hb).includes(macro.id)) return;
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

/** Removes macros that earlier versions created (weather macros, "automatic"), including their hotbar slots and folder. */
async function removeObsolete() {
  const wanted = new Set(macroDefs("en").map(d => d.key));
  for (const m of game.macros.filter(x => { const k = x.getFlag(MOD, "macro"); return k && !wanted.has(k); })) {
    try {
      for (const [slot, id] of Object.entries(game.user.hotbar ?? {})) if (id === m.id) await game.user.assignHotbarMacro(null, Number(slot));
    } catch (e) { /* the slot is cleaned up by Foundry anyway */ }
    await m.delete();
  }
  const old = game.folders.find(x => x.type === "Macro" && x.getFlag(MOD, "key") === "macros-weather");
  if (old) await old.delete();
}

/** Creates missing macros; with update=true renames and re-links existing ones to the chosen language;
 *  with hotbar=true the dialog macro is put on the hotbar. */
export async function ensureMacros({ lang, update = false, hotbar = false } = {}) {
  if (!game.user.isGM) return { created: 0, updated: 0 };
  lang ??= game.settings.get(MOD, "language");
  await removeObsolete();
  const folders = {};
  let created = 0, updated = 0;
  for (const m of macroDefs(lang)) {
    folders[m.folder] ??= await folderFor(m.folder, lang, update);
    const ex = game.macros.find(x => x.getFlag(MOD, "macro") === m.key);
    const bar = m.key === "variant";
    if (ex) {
      if (update) { await ex.update({ name: m.name, img: m.img, command: m.command, folder: folders[m.folder].id }); updated++; }
      if (hotbar && bar) await toHotbar(ex);
      continue;
    }
    const doc = await Macro.create({ name: m.name, type: "script", img: m.img, command: m.command, folder: folders[m.folder].id, flags: { [MOD]: { macro: m.key } } });
    created++;
    if (bar) await toHotbar(doc);
  }
  await game.settings.set(MOD, "macrosVersion", MACROS_VERSION);
  return { created, updated };
}
