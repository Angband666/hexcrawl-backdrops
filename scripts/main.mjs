import { MOD } from "./constants.mjs";
import { registerSettings } from "./settings.mjs";
import { openManager } from "./manager.mjs";
import { importPack, repairThumbs } from "./importer.mjs";
import { apply, chooseVariant, setVariant, initWeather } from "./weather.mjs";
import { registerChatCommand } from "./commands.mjs";

Hooks.once("init", () => { registerSettings(); });

Hooks.once("ready", () => {
  game.modules.get(MOD).api = { openManager, importPack, chooseVariant, setVariant, apply };
  initWeather();
  console.log(`${MOD} | chat command /backdrop registered via ${registerChatCommand()}`);
  repairThumbs().then(n => { if (n) console.log(`${MOD} | preview images set for ${n} scenes`); }).catch(e => console.warn(`${MOD} | thumbnails`, e));
  if (game.user.isGM && !game.settings.get(MOD, "setupDone")) openManager({ firstRun: true });
});
