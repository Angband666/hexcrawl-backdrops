export const MOD = "hexcrawl-backdrops";
export const PATH = `modules/${MOD}/`;
export const PACKS = ["encounters", "hexes", "fairy"];
export const t = (key, data) => (data ? game.i18n.format(key, data) : game.i18n.localize(key));
export const sceneLang = () => game.settings.get(MOD, "language");
