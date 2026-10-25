// Variant window: stays open, one click on a picture switches the scene at once. Also the entry in the Scenes list.
import { MOD, t } from "./constants.mjs";
import { setVariant, cycleVariant, variantKeys, moduleScenes, flagOf } from "./variants.mjs";

const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" }[c]));
const label = k => t(`HCB.variant.${k}`);

const STYLE = `<style>
.hcb-browser .hcb-bar{display:flex;gap:.4rem;align-items:center;margin-bottom:.4rem}
.hcb-browser .hcb-bar select{flex:1}
.hcb-browser .hcb-sub{display:flex;gap:.4rem;align-items:center;justify-content:space-between;margin-bottom:.4rem}
.hcb-browser .hcb-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:.5rem}
.hcb-browser .hcb-cell{margin:0;cursor:pointer;border:2px solid transparent;border-radius:4px;overflow:hidden;background:#000}
.hcb-browser .hcb-cell img{display:block;width:100%;aspect-ratio:16/9;object-fit:cover}
.hcb-browser .hcb-cell figcaption{padding:.15rem .3rem;text-align:center;font-size:.85em;color:#fff;background:#222}
.hcb-browser .hcb-cell:hover,.hcb-browser .hcb-cell:focus{border-color:#c9a227}
.hcb-browser .hcb-cell.current{border-color:#4a8f3c}
.hcb-browser .hcb-cell.current figcaption{background:#2f5d26}
.hcb-browser .hcb-hint{opacity:.7;font-size:.85em;margin-top:.5rem}
</style>`;

let instance = null;

class VariantBrowser extends foundry.applications.api.ApplicationV2 {
  static DEFAULT_OPTIONS = {
    id: "hcb-variant-browser", tag: "div", classes: ["hcb-browser"],
    window: { title: "HCB.browser.title", icon: "fa-solid fa-images", resizable: true },
    position: { width: 800, height: 640 }
  };

  sceneId = null;
  get scene() { return game.scenes.get(this.sceneId); }

  async _prepareContext() { return {}; }

  async _renderHTML() {
    const scenes = moduleScenes();
    if (!scenes.length) return `<p>${t("HCB.browser.none")}</p>`;
    if (!this.scene || !flagOf(this.scene)) this.sceneId = scenes[0].id;
    const scene = this.scene, f = flagOf(scene);
    const groups = {};
    for (const s of scenes) (groups[flagOf(s).pack] ??= []).push(s);
    const options = Object.entries(groups).map(([pack, list]) =>
      `<optgroup label="${esc(t(`HCB.pack.${pack}`))}">${list.map(s => `<option value="${s.id}" ${s.id === scene.id ? "selected" : ""}>${esc(s.name)}</option>`).join("")}</optgroup>`).join("");
    const cells = variantKeys(scene).map(k => {
      const src = k === "tag" ? f.tag : f.variants[k];
      return `<figure class="hcb-cell ${k === (f.current ?? "tag") ? "current" : ""}" data-key="${k}" tabindex="0"><img loading="lazy" src="${esc(src)}" alt=""><figcaption>${esc(label(k))}</figcaption></figure>`;
    }).join("");
    return `${STYLE}
      <div class="hcb-bar">
        <button type="button" data-hcb="prevScene" title="${esc(t("HCB.browser.prevScene"))}"><i class="fa-solid fa-chevron-left"></i></button>
        <select data-hcb="scene">${options}</select>
        <button type="button" data-hcb="nextScene" title="${esc(t("HCB.browser.nextScene"))}"><i class="fa-solid fa-chevron-right"></i></button>
      </div>
      <div class="hcb-sub">
        <button type="button" data-hcb="prevVar"><i class="fa-solid fa-backward-step"></i> ${esc(t("HCB.browser.prevVar"))}</button>
        <span>${esc(t("HCB.browser.current", { variant: label(f.current ?? "tag") }))}</span>
        <button type="button" data-hcb="nextVar">${esc(t("HCB.browser.nextVar"))} <i class="fa-solid fa-forward-step"></i></button>
      </div>
      <div class="hcb-grid">${cells}</div>
      <p class="hcb-hint">${esc(t("HCB.browser.hint"))}</p>`;
  }

  _replaceHTML(result, content) {
    content.innerHTML = result;
    const on = (sel, fn) => content.querySelectorAll(sel).forEach(el => el.addEventListener("click", fn));
    content.querySelector("[data-hcb=scene]")?.addEventListener("change", ev => this.go(ev.target.value));
    on("[data-hcb=prevScene]", () => this.stepScene(-1));
    on("[data-hcb=nextScene]", () => this.stepScene(1));
    on("[data-hcb=prevVar]", () => this.stepVariant(-1));
    on("[data-hcb=nextVar]", () => this.stepVariant(1));
    on(".hcb-cell", ev => this.pick(ev.currentTarget.dataset.key));
    content.tabIndex = 0;
    content.onkeydown = ev => {
      const map = { ArrowRight: () => this.stepVariant(1), ArrowLeft: () => this.stepVariant(-1), ArrowDown: () => this.stepScene(1), ArrowUp: () => this.stepScene(-1) };
      if (ev.target?.tagName === "SELECT" || !map[ev.key]) return;
      ev.preventDefault(); map[ev.key]();
    };
    content.focus({ preventScroll: true });
  }

  async go(sceneId) { this.sceneId = sceneId; await this.render(); }
  async stepScene(step) {
    const list = moduleScenes(); if (!list.length) return;
    const i = Math.max(0, list.findIndex(s => s.id === this.sceneId));
    await this.go(list[(i + step + list.length) % list.length].id);
  }
  async pick(key) { if (this.scene) { await setVariant(this.scene, key); await this.render(); } }
  async stepVariant(step) { if (this.scene) { await cycleVariant(this.scene, step); await this.render(); } }
}

/** Opens the variant window, on the given scene, else on the scene you are looking at, else on the last one used. */
export async function openBrowser(scene) {
  if (!game.user.isGM) return ui.notifications.warn(t("HCB.warn.gmOnly"));
  if (!moduleScenes().length) return ui.notifications.warn(t("HCB.browser.none"));
  instance ??= new VariantBrowser();
  const pick = [scene, canvas?.scene].find(s => s && flagOf(s));
  if (pick) instance.sceneId = pick.id;
  return instance.render({ force: true });
}

const entryId = li => { const el = li?.dataset ? li : li?.[0]; return el?.dataset?.entryId ?? el?.dataset?.documentId; };

/** Right-click entry on a scene in the Scenes list, and a button in the list header. Several hook names, because they differ between versions. */
export function registerDirectoryHooks() {
  const addEntry = (app, options) => {
    try {
      if (!Array.isArray(options) || options.some(o => o.hcb)) return;
      options.push({
        hcb: true, name: t("HCB.ctx.name"), icon: "<i class=\"fa-solid fa-images\"></i>",
        condition: li => game.user.isGM && !!flagOf(game.scenes.get(entryId(li))),
        callback: li => openBrowser(game.scenes.get(entryId(li)))
      });
    } catch (e) { console.warn(`${MOD} | scene context entry`, e); }
  };
  for (const h of ["getSceneContextOptions", "getSceneDirectoryEntryContext"]) Hooks.on(h, addEntry);
  Hooks.on("renderSceneDirectory", (app, html) => {
    try {
      if (!game.user.isGM) return;
      const root = html instanceof HTMLElement ? html : html?.[0];
      if (!root || root.querySelector(".hcb-open")) return;
      const host = root.querySelector(".header-actions") ?? root.querySelector(".directory-header");
      if (!host) return;
      const b = document.createElement("button");
      b.type = "button"; b.className = "hcb-open";
      b.innerHTML = `<i class="fa-solid fa-images"></i> ${esc(t("HCB.btn.header"))}`;
      b.addEventListener("click", () => openBrowser());
      host.appendChild(b);
    } catch (e) { console.warn(`${MOD} | scene list button`, e); }
  });
}

export const browserInstance = () => instance;
