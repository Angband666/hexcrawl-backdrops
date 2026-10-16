import { MOD } from "./constants.mjs";
import { registerSettings } from "./settings.mjs";
import { openManager } from "./manager.mjs";
import { importPack } from "./importer.mjs";
import { apply, chooseVariant, initWeather } from "./weather.mjs";

Hooks.once("init", () => registerSettings());

Hooks.once("ready", () => {
  game.modules.get(MOD).api = { openManager, importPack, chooseVariant, apply };
  initWeather();
  if (game.user.isGM && !game.settings.get(MOD, "setupDone")) openManager({ firstRun: true });
});
