import { MOD, t } from "./constants.mjs";
import { registerSettings } from "./settings.mjs";
import { openManager } from "./manager.mjs";
import { importPack } from "./importer.mjs";
import { apply, chooseVariant, setVariant, initWeather } from "./weather.mjs";

Hooks.once("init", () => registerSettings());

// Chat command:  /backdrop            choose a variant for the current scene (dialog)
//                /backdrop <name>     set it directly, e.g. night, dusk, rain, storm, mist, winter, autumn, spring, camp, auto
//                /backdrop import     open the import dialog         /backdrop help   list the names
const ALIAS = {
  tag: ["day", "tag"], nacht: ["night", "nacht"], daemmerung: ["dusk", "daemmerung", "dämmerung"], regen: ["rain", "regen"], gewitter: ["storm", "thunderstorm", "gewitter"],
  nebel: ["mist", "fog", "nebel"], winter: ["winter"], herbst: ["autumn", "fall", "herbst"], fruehling: ["spring", "fruehling", "frühling"], sturm: ["stormynight", "sturmnacht", "sturm"],
  morgen: ["morning", "morgen"], lager_abend: ["campdusk", "lagerabend", "camp-dusk"], lager_nacht: ["camp", "campnight", "lager", "lagernacht", "camp-night"], auto: ["auto", "automatic", "automatisch"]
};
function lookup(word) { word = word.replace(/\s+/g, "").toLowerCase(); return Object.keys(ALIAS).find(k => ALIAS[k].includes(word) || k === word); }

async function command(arg) {
  const scene = canvas?.scene;
  if (arg === "help") return ChatMessage.create({ whisper: [game.user.id], speaker: { alias: "Hexcrawl Backdrops" }, content: `<p>/backdrop &nbsp;·&nbsp; /backdrop import &nbsp;·&nbsp; /backdrop &lt;${Object.values(ALIAS).map(a => a[0]).join(" | ")}&gt;</p>` });
  if (arg === "import" || arg === "setup") return openManager();
  if (!arg) return chooseVariant(scene);
  const key = lookup(arg);
  if (!key) return ui.notifications.warn(t("HCB.warn.unknownVariant", { word: arg }));
  return setVariant(scene, key);
}

Hooks.once("ready", () => {
  game.modules.get(MOD).api = { openManager, importPack, chooseVariant, setVariant, apply };
  initWeather();
  if (game.user.isGM && !game.settings.get(MOD, "setupDone")) openManager({ firstRun: true });
});

Hooks.on("chatMessage", (log, message) => {
  const m = String(message).trim().match(/^\/(?:backdrop|hcb)(?:\s+(.*))?$/i);
  if (!m) return;
  if (!game.user.isGM) { ui.notifications.warn(t("HCB.warn.gmOnly")); return false; }
  command((m[1] ?? "").trim().toLowerCase());
  return false;
});
