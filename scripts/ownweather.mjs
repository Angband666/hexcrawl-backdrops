// Manual weather. When the Dolmenwood system has no weather of its own, the GM picks the current weather here
// (dialog, settings button or chat command /backdrop weather). Nothing is rolled or decided by the module.
import { MOD, t } from "./constants.mjs";

export const IDS = ["clear", "cloudy", "windy", "mist", "fog", "drizzle", "rain", "storm", "snow", "blizzard"];
// fx = FXMaster preset, bild = preferred backdrop variant
export const RULE = {
  clear: { fx: null, bild: null }, cloudy: { fx: "overcast", bild: null }, windy: { fx: "windy", bild: null },
  mist: { fx: "mist", bild: "nebel", ersatz: [] }, fog: { fx: "fog", bild: "nebel" }, drizzle: { fx: "drizzle", bild: "regen" },
  rain: { fx: "rain", bild: "regen" }, storm: { fx: "thunderstorm", bild: "gewitter" }, snow: { fx: "snow", bild: "winter" }, blizzard: { fx: "blizzard", bild: "winter" }
};

export const systemWeatherText = () => { try { return game.settings.get("dolmenwood", "currentWeather")?.text || ""; } catch (e) { return ""; } };
export const currentOwn = () => { const id = game.settings.get(MOD, "weather")?.id; return IDS.includes(id) ? id : "clear"; };

/** Is the official weather (when present) the one in use? */
export function systemWeatherActive() {
  return game.settings.get(MOD, "weatherSource") === "auto" && !!systemWeatherText();
}

export async function setWeather(id) {
  if (!game.user.isGM) return;
  await game.settings.set(MOD, "weather", { id });
  if (systemWeatherActive()) ui.notifications.warn(t("HCB.warn.systemWeather"));
}

/** Dialog: choose the current weather. */
export async function chooseWeather() {
  if (!game.user.isGM) return ui.notifications.warn(t("HCB.warn.gmOnly"));
  const cur = currentOwn();
  const options = IDS.map(id => `<option value="${id}" ${id === cur ? "selected" : ""}>${t(`HCB.weather.${id}`)}</option>`).join("");
  const note = systemWeatherActive() ? `<p class="notes">${t("HCB.warn.systemWeather")}</p>` : "";
  const choice = await foundry.applications.api.DialogV2.prompt({
    window: { title: t("HCB.weather.title") }, rejectClose: false,
    content: `<div class="form-group"><label>${t("HCB.weather.label")}</label><select name="weather">${options}</select></div>${note}`,
    ok: { label: t("HCB.ok"), callback: (ev, button) => button.form.elements.weather.value }
  });
  if (choice) await setWeather(choice);
}
