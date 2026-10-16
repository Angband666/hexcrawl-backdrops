import { MOD } from "./constants.mjs";
import { registerSettings } from "./settings.mjs";
import { openManager } from "./manager.mjs";
import { importPack, repairThumbs } from "./importer.mjs";
import { apply, chooseVariant, setVariant, initWeather } from "./weather.mjs";
import { registerChatCommand } from "./commands.mjs";
import { chooseWeather, setWeather } from "./ownweather.mjs";
import { ensureMacros, MACROS_VERSION } from "./macros.mjs";
import { t } from "./constants.mjs";

Hooks.once("init", () => { registerSettings(); });

Hooks.once("ready", () => {
  game.modules.get(MOD).api = { openManager, importPack, chooseVariant, setVariant, apply, chooseWeather, setWeather, ensureMacros };
  initWeather();
  console.log(`${MOD} | chat command /backdrop registered via ${registerChatCommand()}`);
  repairThumbs().then(n => { if (n) console.log(`${MOD} | preview images set for ${n} scenes`); }).catch(e => console.warn(`${MOD} | thumbnails`, e));
  if (game.user.isGM && game.settings.get(MOD, "macrosVersion") < MACROS_VERSION && game.settings.get(MOD, "setupDone"))
    ensureMacros({ hotbar: true }).then(r => ui.notifications.info(t("HCB.notify.macros", { n: r.created }))).catch(e => console.warn(`${MOD} | macros`, e));
  if (game.user.isGM && !game.settings.get(MOD, "setupDone")) openManager({ firstRun: true });
});
