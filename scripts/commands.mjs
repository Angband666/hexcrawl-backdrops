import { MOD, t } from "./constants.mjs";
import { openManager } from "./manager.mjs";
import { chooseVariant, setVariant } from "./weather.mjs";
import { IDS, chooseWeather, setWeather } from "./ownweather.mjs";
import { ensureMacros } from "./macros.mjs";

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

export async function command(arg) {
  const scene = canvas?.scene;
  if (arg === "help") return ChatMessage.create({ whisper: [game.user.id], speaker: { alias: "Hexcrawl Backdrops" }, content: `<p>/backdrop &nbsp;·&nbsp; /backdrop import &nbsp;·&nbsp; /backdrop macros &nbsp;·&nbsp; /backdrop weather [${IDS.join(" | ")}] &nbsp;·&nbsp; /backdrop &lt;${Object.values(ALIAS).map(a => a[0]).join(" | ")}&gt;</p>` });
  if (arg === "import" || arg === "setup") return openManager();
  if (arg === "macros" || arg === "makros") { const r = await ensureMacros({ update: true }); return ui.notifications.info(t("HCB.notify.macros", { n: r.created + r.updated })); }
  if (arg === "weather" || arg === "wetter") return chooseWeather();
  const wm = arg.match(/^(?:weather|wetter)\s+(.+)$/);
  if (wm) { const id = wlookup(wm[1]); if (!id) return ui.notifications.warn(t("HCB.warn.unknownWeather", { word: wm[1] })); return setWeather(id); }
  if (!arg) return chooseVariant(scene);
  const key = lookup(arg);
  if (!key) return ui.notifications.warn(t("HCB.warn.unknownVariant", { word: arg }));
  return setVariant(scene, key);
}


const PATTERN = /^\/(?:backdrop|hcb)(?:\s+([^]*))?$/i;

/** Registers /backdrop (and /hcb) in the chat. Foundry v13/v14 keep the chat commands in ChatLog.CHAT_COMMANDS; our entry must come
 *  before the catch-all entry for unknown commands, so that one is moved to the end. Falls back to the chatMessage hook. */
export function registerChatCommand(ChatLog = foundry.applications?.sidebar?.tabs?.ChatLog) {
  const run = (m) => {
    if (!game.user.isGM) { ui.notifications.warn(t("HCB.warn.gmOnly")); return false; }
    command((m ?? "").trim().toLowerCase());
    return false;
  };
  const cmds = ChatLog?.CHAT_COMMANDS;
  if (cmds && typeof cmds === "object") {
    try {
      const catchAll = Object.entries(cmds).find(([, v]) => v?.rgx?.test?.("/hcb-unknown-command-probe"));
      const entry = { rgx: PATTERN, fn: function (cmd, match) { return run(Array.isArray(match) ? match[1] : match?.[1]); } };
      let saved = null;
      if (catchAll) { saved = catchAll; delete cmds[catchAll[0]]; }
      cmds.hexcrawlBackdrops = entry;
      if (saved) cmds[saved[0]] = saved[1];
      return "registry";
    } catch (e) { console.warn(`${MOD} | could not register in ChatLog.CHAT_COMMANDS`, e); }
  }
  Hooks.on("chatMessage", (log, message) => { const m = String(message).trim().match(PATTERN); if (!m) return; return run(m[1]); });
  return "hook";
}
