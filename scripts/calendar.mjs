// Reads the Dolmenwood system calendar (time of day, season, daylight hours). Returns null if the system has no calendar.
let cal = null;
export async function calendar() {
  if (!cal) {
    try { cal = globalThis.__hcbCalendar ?? await import("/systems/dolmenwood/module/calendar/calendar-time.js"); } catch (e) { cal = {}; }
  }
  if (!cal.worldTimeToCalendar) return null;
  const c = cal.worldTimeToCalendar(game.time.worldTime);
  const d = cal.getDaylightHours?.(c.monthKey) ?? { sunrise: 6, sunset: 18 };
  return { season: cal.getSeason?.(c.monthKey), hour: c.hour + c.minute / 60, sunrise: d.sunrise, sunset: d.sunset, day: `${c.year}-${c.monthKey}-${c.day}` };
}
/** A key that changes once per game day (also works without a system calendar). */
export const dayKey = c => c?.day ?? `t${Math.floor(game.time.worldTime / 86400)}`;
