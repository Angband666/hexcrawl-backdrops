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
  game.settings.register(MOD, "auto", {
    name: "HCB.settings.auto.name", hint: "HCB.settings.auto.hint", scope: "world", config: true, type: Boolean, default: true
  });
  game.settings.register(MOD, "fxScope", {
    name: "HCB.settings.fx.name", hint: "HCB.settings.fx.hint", scope: "world", config: true, type: String, default: "module",
    choices: { module: "HCB.settings.fx.module", none: "HCB.settings.fx.none" }
  });
  game.settings.register(MOD, "seasons", {
    name: "HCB.settings.seasons.name", hint: "HCB.settings.seasons.hint", scope: "world", config: true, type: Boolean, default: true
  });
  game.settings.register(MOD, "timeOfDay", {
    name: "HCB.settings.time.name", hint: "HCB.settings.time.hint", scope: "world", config: true, type: Boolean, default: true
  });
  game.settings.register(MOD, "setupDone", { scope: "world", config: false, type: Boolean, default: false });
  game.settings.registerMenu(MOD, "manager", {
    name: "HCB.settings.manager.name", label: "HCB.settings.manager.label", hint: "HCB.settings.manager.hint",
    icon: "fa-solid fa-map", type: ManagerLauncher, restricted: true
  });
}
