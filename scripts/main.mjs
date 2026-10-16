import { MOD, t } from "./constants.mjs";
import { registerSettings } from "./settings.mjs";
import { openManager } from "./manager.mjs";
import { importPack, repairThumbs } from "./importer.mjs";
import { apply, chooseVariant, setVariant, initWeather } from "./weather.mjs";
import { IDS, chooseWeather, setWeather } from "./ownweather.mjs";

Hooks.once("init", () => registerSettings());

// Chat command:  /backdrop            choose a variant for the current scene (dialog)
//                /backdrop <name>     set it directly, e.g. night, dusk, rain, storm, mist, winter, autumn, spring, camp, auto
//                /backdrop weather    choose the weather (dialog) or /backdrop weather rain
//                /backdrop import     open the import dialog         /backdrop help   list the names
const ALIAS = {
  tag: ["day", "tag"], nacht: ["night", "nacht"], daemmerung: ["dusk", "daemmerung", "dämmerung"], regen: ["rain", "regen"], gewitter: ["storm", "thunderstorm", "gewitter"],
  nebel: ["mist", "fog", "nebel"], winter: ["winter"], herbst: ["autumn", "fall", "herbst"], fruehling: ["spring", "fruehling", "frühling"], sturm: ["stormynight", "sturmnacht", "sturm"],
  morgen: ["morning", "morgen"], lager_abend: ["campdusk", "lagerabend", "camp-dusk"], lager_nacht: ["camp", "campnight", "lager", "lagernacht", "camp-night"], auto: ["auto", "automatic", "automatisch"]
};
const WALIAS = {
  clear: ["clear", "klar", "sunny", "sonnig"], cloudy: ["cloudy", "overcast", "bewölkt", "bewoelkt", "bedeckt"], windy: ["windy", "wind", "windig"], mist: ["mist", "dunst"], fog: ["fog", "nebel"],
  drizzle: ["drizzle", "niesel", "nieselregen"], rain: ["rain", "regen"], storm: ["storm", "thunderstorm", "gewitter"], snow: ["snow", "schnee"], blizzard: ["blizzard", "schneesturm"]
};
const wlookup = word => IDS.find(k => WALIAS[k].includes(word.replace(/\s+/g, "").toLowerCase()));
function lookup(word) { word = word.replace(/\s+/g, "").toLowerCase(); return Object.keys(ALIAS).find(k => ALIAS[k].includes(word) || k === word); }

async function command(arg) {
  const scene = canvas?.scene;
  if (arg === "help") return ChatMessage.create({ whisper: [game.user.id], speaker: { alias: "Hexcrawl Backdrops" }, content: `<p>/backdrop &nbsp;·&nbsp; /backdrop import &nbsp;·&nbsp; /backdrop weather [${IDS.join(" | ")}] &nbsp;·&nbsp; /backdrop &lt;${Object.values(ALIAS).map(a => a[0]).join(" | ")}&gt;</p>` });
  if (arg === "import" || arg === "setup") return openManager();
  if (arg === "weather" || arg === "wetter") return chooseWeather();
  const wm = arg.match(/^(?:weather|wetter)\s+(.+)$/);
  if (wm) { const id = wlookup(wm[1]); if (!id) return ui.notifications.warn(t("HCB.warn.unknownWeather", { word: wm[1] })); await setWeather(id); return ui.notifications.info(t("HCB.weather.set", { weather: t(`HCB.weather.${id}`) })); }
  if (!arg) return chooseVariant(scene);
  const key = lookup(arg);
  if (!key) return ui.notifications.warn(t("HCB.warn.unknownVariant", { word: arg }));
  return setVariant(scene, key);
}

Hooks.once("ready", () => {
  game.modules.get(MOD).api = { openManager, importPack, chooseVariant, setVariant, apply };
  initWeather();
  repairThumbs().then(n => { if (n) console.log(`${MOD} | preview images set for ${n} scenes`); }).catch(e => console.warn(`${MOD} | thumbnails`, e));
  if (game.user.isGM && !game.settings.get(MOD, "setupDone")) openManager({ firstRun: true });
});

Hooks.on("chatMessage", (log, message) => {
  const m = String(message).trim().match(/^\/(?:backdrop|hcb)(?:\s+(.*))?$/i);
  if (!m) return;
  if (!game.user.isGM) { ui.notifications.warn(t("HCB.warn.gmOnly")); return false; }
  command((m[1] ?? "").trim().toLowerCase());
  return false;
});
