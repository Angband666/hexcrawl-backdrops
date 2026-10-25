import { MOD, t } from "./constants.mjs";
import { registerSettings } from "./settings.mjs";
import { openManager } from "./manager.mjs";
import { importPack, repairThumbs } from "./importer.mjs";
import { chooseVariant, setVariant, cycleVariant } from "./variants.mjs";
import { openBrowser, registerDirectoryHooks } from "./browser.mjs";
import { registerChatCommand } from "./commands.mjs";
import { ensureMacros, helpHtml, MACROS_VERSION } from "./macros.mjs";

Hooks.once("init", () => { registerSettings(); });

registerDirectoryHooks();

Hooks.once("ready", () => {
  game.modules.get(MOD).api = { openManager, importPack, chooseVariant, setVariant, cycleVariant, openBrowser, ensureMacros };
  console.log(`${MOD} | chat command /backdrop registered via ${registerChatCommand()}`);
  repairThumbs().then(n => { if (n) console.log(`${MOD} | preview images set for ${n} scenes`); }).catch(e => console.warn(`${MOD} | thumbnails`, e));
  // New macro version (0.2): refresh the macros once and tell the GM where everything is.
  if (game.user.isGM && game.settings.get(MOD, "macrosVersion") < MACROS_VERSION && game.settings.get(MOD, "setupDone"))
    ensureMacros({ update: true, hotbar: true }).then(r => {
      ui.notifications.info(t("HCB.notify.macros"));
      ChatMessage.create({ whisper: [game.user.id], speaker: { alias: "Hexcrawl Backdrops" }, content: helpHtml(r?.slot) });
    }).catch(e => console.warn(`${MOD} | macros`, e));
  if (game.user.isGM && !game.settings.get(MOD, "setupDone")) openManager({ firstRun: true });
});
