import { MOD } from "./constants.mjs";
import { openManager } from "./manager.mjs";

/** Settings menu button: opens the import/language dialog. */
class ManagerLauncher extends foundry.applications.api.ApplicationV2 {
  async render() { openManager(); return this; }
}

export function registerSettings() {
  const guess = (game.i18n?.lang ?? "en").startsWith("de") ? "de" : "en";
  game.settings.register(MOD, "language", {
    name: "HCB.settings.language.name", hint: "HCB.settings.language.hint", scope: "world", config: true, type: String, default: guess,
    choices: { en: "English", de: "Deutsch" }
  });
  game.settings.register(MOD, "macrosVersion", { scope: "world", config: false, type: Number, default: 0 });
  game.settings.register(MOD, "setupDone", { scope: "world", config: false, type: Boolean, default: false });
  game.settings.registerMenu(MOD, "manager", {
    name: "HCB.settings.manager.name", label: "HCB.settings.manager.label", hint: "HCB.settings.manager.hint",
    icon: "fa-solid fa-map", type: ManagerLauncher, restricted: true
  });
}
