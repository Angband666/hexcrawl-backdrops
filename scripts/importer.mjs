// Creates the scenes of a pack from data/scenes.json in the chosen language. Idempotent: already imported scenes are skipped
// (or re-linked and renamed when "update" is on). The images stay in the module folder.
import { MOD, PATH, PACKS, t } from "./constants.mjs";

let DATA = null;
export async function loadData() {
  if (!DATA) { const r = await fetch(`${PATH}data/scenes.json`); DATA = await r.json(); }
  return DATA;
}

const scenesOf = (pack) => game.scenes.filter(s => s.getFlag(MOD, "scene")?.pack === pack);

/** Count per pack: total in the data and already imported. */
export async function packStatus() {
  const d = await loadData();
  return Object.fromEntries(PACKS.map(p => [p, { total: d.scenes.filter(s => s.pack === p).length, done: scenesOf(p).length }]));
}

async function ensureFolder(key, name, parent, update) {
  let f = game.folders.find(x => x.type === "Scene" && x.getFlag(MOD, "key") === key);
  if (f) { if (update && f.name !== name) await f.update({ name }); return f; }
  return Folder.create({ name, type: "Scene", folder: parent?.id ?? null, sorting: "m", flags: { [MOD]: { key } } });
}

function regionData(rec, lang, azm) {
  if (!azm || !rec.regions?.length) return [];
  const VIS = CONST.REGION_VISIBILITY?.LAYER ?? 0;
  return rec.regions.map(r => ({
    name: r.name[lang] ?? r.name.en, color: r.color || "#4a8f3c",
    shapes: [{ type: "polygon", points: r.points }], visibility: VIS,
    behaviors: [{ type: "alternate-zone-movement.zone", name: t("HCB.zone"), system: { cost: r.cost, priority: r.priority } }]
  }));
}

function lightData(rec) {
  const anims = CONFIG.Canvas?.lightAnimations ?? {};
  return (rec.lights ?? []).map(l => {
    const c = l.config; const a = c.animation ?? {};
    return {
      x: l.x, y: l.y, hidden: l.atmo ? !l.atmo.includes("tag") : !!l.hidden,
      config: { dim: c.dim, bright: c.bright, color: c.color, alpha: c.alpha, negative: c.negative, darkness: c.darkness,
        animation: a.type && anims[a.type] ? { type: a.type, speed: a.speed, intensity: a.intensity } : { type: null } },
      flags: { [MOD]: l.atmo ? { atmo: l.atmo } : {} }
    };
  });
}

async function setBackground(scene, src) {
  const lvl = scene.levels?.contents?.[0];
  if (lvl) { if (lvl.background?.src !== src) await lvl.update({ "background.src": src }); }
  else if (scene.background?.src !== src) await scene.update({ "background.src": src });
}

/** Import one pack. Returns { created, updated, skipped }. */
export async function importPack(pack, { lang, update = false, progress } = {}) {
  const data = await loadData();
  lang ??= game.settings.get(MOD, "language");
  const azm = !!game.modules.get("alternate-zone-movement")?.active;
  const F = data.folders;
  const root = await ensureFolder("root", F.root[lang], null, update);
  const packFolder = await ensureFolder(pack, F[pack][lang], root, update);
  const groupFolders = {};
  const recs = data.scenes.filter(s => s.pack === pack);
  let created = 0, updated = 0, skipped = 0, n = 0;
  for (const rec of recs) {
    n++;
    let folder = packFolder;
    if (rec.group) {
      groupFolders[rec.group] ??= await ensureFolder(`${pack}-${rec.group}`, F[rec.group][lang], packFolder, update);
      folder = groupFolders[rec.group];
    }
    const dir = pack;   // assets/<pack>/
    const base = `${PATH}${rec.tag}`;
    const variants = Object.fromEntries(rec.variants.map(k => [k, `${PATH}assets/${dir}/var/${rec.id}__${k}.webp`]));
    const flag = { id: rec.id, pack, tag: base, variants, current: "tag", manual: false, light: rec.light, interior: rec.interior, noFx: rec.noFx };
    const name = rec.name[lang] ?? rec.name.en;
    const existing = scenesOf(pack).find(s => s.getFlag(MOD, "scene")?.id === rec.id);
    if (existing) {
      if (!update) { skipped++; continue; }
      await existing.unsetFlag(MOD, "scene");
      await existing.update({ name, folder: folder.id, [`flags.${MOD}.scene`]: flag });
      await setBackground(existing, base);
      updated++;
    } else {
      const scene = await Scene.create({
        name, folder: folder.id, width: rec.w, height: rec.h, padding: rec.padding,
        grid: { type: rec.grid.type, size: rec.grid.size, distance: rec.grid.distance, units: rec.grid.units },
        background: { src: base }, tokenVision: false, navigation: false, flags: { [MOD]: { scene: flag } }
      });
      await setBackground(scene, base);
      const regions = regionData(rec, lang, azm);
      if (regions.length) await scene.createEmbeddedDocuments("Region", regions);
      const lights = lightData(rec);
      if (lights.length) await scene.createEmbeddedDocuments("AmbientLight", lights);
      created++;
    }
    if (progress && n % 10 === 0) progress(n, recs.length);
  }
  return { created, updated, skipped, total: recs.length };
}
