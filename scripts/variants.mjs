// Switching the backdrop variant of a scene by hand (browser window, macros, chat command). Nothing is switched automatically.
import { MOD, t } from "./constants.mjs";

export const ORDER = ["tag", "nacht", "daemmerung", "regen", "gewitter", "nebel", "winter", "herbst", "fruehling", "sturm", "morgen", "lager_abend", "lager_nacht"];
export const flagOf = scene => scene?.getFlag(MOD, "scene");
const label = k => t(`HCB.variant.${k}`);

/** The variants a scene offers, in the fixed order ("tag" = the plain day image is always there). */
export function variantKeys(scene) {
  const f = flagOf(scene);
  return f ? ORDER.filter(k => k === "tag" || f.variants?.[k]) : [];
}

/** All scenes of this module in the world, sorted by name. */
export function moduleScenes() {
  return game.scenes.filter(s => flagOf(s)).sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
}

/** Light sources that only belong to certain variants (campfire only in the camp variants). */
async function syncLights(scene, key) {
  const upd = scene.lights.filter(l => Array.isArray(l.getFlag(MOD, "atmo")))
    .map(l => ({ _id: l.id, hidden: !l.getFlag(MOD, "atmo").includes(key), cur: l.hidden }))
    .filter(u => u.hidden !== u.cur).map(({ _id, hidden }) => ({ _id, hidden }));
  if (upd.length) await scene.updateEmbeddedDocuments("AmbientLight", upd);
}

/** Show a variant ("tag" = the plain day image) on a scene of this module. The scene does not have to be open or active:
 *  the background is stored in the scene, so it is already right when the scene is activated later. */
export async function setVariant(scene, key) {
  const f = flagOf(scene);
  if (!f) return ui.notifications.warn(t("HCB.warn.notModuleScene"));
  if (!game.user.isGM) return ui.notifications.warn(t("HCB.warn.gmOnly"));
  if (key !== "tag" && !f.variants?.[key]) return ui.notifications.warn(t("HCB.warn.noVariant", { variant: label(key) }));
  const img = key === "tag" ? f.tag : f.variants[key];
  const lvl = scene.levels?.contents?.[0];
  if (lvl) await lvl.update({ "background.src": img }); else await scene.update({ "background.src": img });
  await scene.update({ [`flags.${MOD}.scene.current`]: key });
  await syncLights(scene, key);
}

/** Next (step = 1) or previous (step = -1) variant of a scene, wrapping around. Returns the key that is now shown. */
export async function cycleVariant(scene = canvas?.scene, step = 1) {
  const f = flagOf(scene);
  if (!f) return ui.notifications.warn(t("HCB.warn.notModuleScene"));
  const keys = variantKeys(scene);
  const i = Math.max(0, keys.indexOf(f.current ?? "tag"));
  const key = keys[(i + step + keys.length) % keys.length];
  await setVariant(scene, key);
  return key;
}

/** Opens the variant window for a scene (kept for macros of version 0.1). */
export async function chooseVariant(scene = canvas?.scene) {
  const { openBrowser } = await import("./browser.mjs");
  return openBrowser(scene);
}
