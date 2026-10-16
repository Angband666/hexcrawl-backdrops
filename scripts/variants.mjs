// Switching the backdrop variant of a scene by hand (dialog, macros, chat command). Nothing is switched automatically.
import { MOD, t } from "./constants.mjs";

export const ORDER = ["tag", "nacht", "daemmerung", "regen", "gewitter", "nebel", "winter", "herbst", "fruehling", "sturm", "morgen", "lager_abend", "lager_nacht"];
const flagOf = scene => scene?.getFlag(MOD, "scene");
const label = k => t(`HCB.variant.${k}`);

/** Light sources that only belong to certain variants (campfire only in the camp variants). */
async function syncLights(scene, key) {
  const upd = scene.lights.filter(l => Array.isArray(l.getFlag(MOD, "atmo")))
    .map(l => ({ _id: l.id, hidden: !l.getFlag(MOD, "atmo").includes(key), cur: l.hidden }))
    .filter(u => u.hidden !== u.cur).map(({ _id, hidden }) => ({ _id, hidden }));
  if (upd.length) await scene.updateEmbeddedDocuments("AmbientLight", upd);
}

/** Show a variant ("tag" = the plain day image) on a scene of this module. */
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

/** Dialog: choose a variant for the current scene. */
export async function chooseVariant(scene = canvas?.scene) {
  const f = flagOf(scene);
  if (!f) return ui.notifications.warn(t("HCB.warn.notModuleScene"));
  const keys = ORDER.filter(k => k === "tag" || f.variants?.[k]);
  const options = keys.map(k => `<option value="${k}" ${k === (f.current ?? "tag") ? "selected" : ""}>${label(k)}</option>`).join("");
  const choice = await foundry.applications.api.DialogV2.prompt({
    window: { title: t("HCB.variant.title") }, rejectClose: false,
    content: `<div class="form-group"><label>${t("HCB.variant.label")}</label><select name="variant">${options}</select></div>`,
    ok: { label: t("HCB.ok"), callback: (ev, button) => button.form.elements.variant.value }
  });
  if (choice) return setVariant(scene, choice);
}
