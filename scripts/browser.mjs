// Variant window: stays open, one click on a picture switches the scene at once. Also the entry in the Scenes list and the scene controls.
import { MOD, t } from "./constants.mjs";
import { setVariant, cycleVariant, variantKeys, moduleScenes, flagOf, showToPlayers } from "./variants.mjs";

const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" }[c]));
const label = k => t(`HCB.variant.${k}`);
const norm = s => String(s).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const ARROWS = ["ArrowRight", "ArrowLeft", "ArrowDown", "ArrowUp"];

const STYLE = `<style>
.hcb-browser .hcb-bar{display:flex;gap:.4rem;align-items:center;margin-bottom:.4rem}
.hcb-browser .hcb-bar select{flex:2}
.hcb-browser .hcb-bar input[type=search]{flex:1;min-width:8rem}
.hcb-browser .hcb-sub{display:flex;gap:.4rem;align-items:center;justify-content:space-between;margin-bottom:.4rem}
.hcb-browser .hcb-state{display:flex;gap:.4rem;align-items:center;justify-content:space-between;margin-bottom:.4rem;padding:.3rem .5rem;border-radius:4px;background:rgba(0,0,0,.25)}
.hcb-browser .hcb-state.live{background:#7a2e1a;color:#fff}
.hcb-browser .hcb-state .hcb-actions{display:flex;gap:.3rem;flex:none}
.hcb-browser .hcb-state button{width:auto;white-space:nowrap}
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
    position: { width: 800, height: 700 }
  };

  sceneId = null;
  query = "";
  get scene() { return game.scenes.get(this.sceneId); }

  /** The scenes of the module that match the search field (all of them when it is empty). */
  matches() {
    const q = norm(this.query.trim());
    const all = moduleScenes();
    return q ? all.filter(s => norm(s.name).includes(q)) : all;
  }

  /** The <option> list of the scene menu, grouped by pack; the scene shown is always in it, even if it does not match the search. */
  optionsHtml() {
    const scene = this.scene;
    const list = this.matches();
    if (scene && !list.includes(scene)) list.unshift(scene);
    const groups = {};
    for (const s of list) (groups[flagOf(s).pack] ??= []).push(s);
    return Object.entries(groups).map(([pack, l]) =>
      `<optgroup label="${esc(t(`HCB.pack.${pack}`))}">${l.map(s => `<option value="${s.id}" ${s.id === scene?.id ? "selected" : ""}>${esc(s.name)}</option>`).join("")}</optgroup>`).join("");
  }

  stateHtml() {
    const scene = this.scene;
    const viewed = canvas?.scene?.id === scene.id;
    const text = scene.active ? t("HCB.browser.stateActive") : t("HCB.browser.stateInactive");
    return `<span><i class="fa-solid ${scene.active ? "fa-eye" : "fa-eye-slash"}"></i> ${esc(text)}</span>
      <span class="hcb-actions">
        <button type="button" data-hcb="show" title="${esc(t("HCB.browser.showHint"))}"><i class="fa-solid fa-image"></i> ${esc(t("HCB.browser.show"))}</button>
        <button type="button" data-hcb="view" ${viewed ? "disabled" : ""} title="${esc(t("HCB.browser.viewHint"))}"><i class="fa-solid fa-magnifying-glass"></i> ${esc(t("HCB.browser.view"))}</button>
        <button type="button" data-hcb="activate" ${scene.active ? "disabled" : ""} title="${esc(t("HCB.browser.activateHint"))}"><i class="fa-solid fa-bullseye"></i> ${esc(t("HCB.browser.activate"))}</button>
      </span>`;
  }

  async _prepareContext() { return {}; }

  async _renderHTML() {
    const scenes = moduleScenes();
    if (!scenes.length) return `<p>${t("HCB.browser.none")}</p>`;
    if (!this.scene || !flagOf(this.scene)) this.sceneId = scenes[0].id;
    const scene = this.scene, f = flagOf(scene);
    const cells = variantKeys(scene).map(k => {
      const src = k === "tag" ? f.tag : f.variants[k];
      return `<figure class="hcb-cell ${k === (f.current ?? "tag") ? "current" : ""}" data-key="${k}" tabindex="0"><img loading="lazy" src="${esc(src)}" alt=""><figcaption>${esc(label(k))}</figcaption></figure>`;
    }).join("");
    return `${STYLE}
      <div class="hcb-bar">
        <button type="button" data-hcb="prevScene" title="${esc(t("HCB.browser.prevScene"))}"><i class="fa-solid fa-chevron-left"></i></button>
        <input type="search" data-hcb="search" value="${esc(this.query)}" placeholder="${esc(t("HCB.browser.search"))}" title="${esc(t("HCB.browser.searchHint"))}">
        <select data-hcb="scene">${this.optionsHtml()}</select>
        <button type="button" data-hcb="nextScene" title="${esc(t("HCB.browser.nextScene"))}"><i class="fa-solid fa-chevron-right"></i></button>
      </div>
      <div class="hcb-state ${scene.active ? "live" : ""}">${this.stateHtml()}</div>
      <div class="hcb-sub">
        <button type="button" data-hcb="prevVar"><i class="fa-solid fa-backward-step"></i> ${esc(t("HCB.browser.prevVar"))}</button>
        <span data-hcb="current">${esc(t("HCB.browser.current", { variant: label(f.current ?? "tag") }))}</span>
        <button type="button" data-hcb="nextVar">${esc(t("HCB.browser.nextVar"))} <i class="fa-solid fa-forward-step"></i></button>
      </div>
      <div class="hcb-grid">${cells}</div>
      <p class="hcb-hint">${esc(t("HCB.browser.hint"))}</p>`;
  }

  _replaceHTML(result, content) {
    const searching = content.contains(document.activeElement) && document.activeElement?.dataset?.hcb === "search";
    content.innerHTML = result;
    const on = (sel, fn, type = "click") => content.querySelectorAll(sel).forEach(el => el.addEventListener(type, fn));
    content.querySelector("[data-hcb=scene]")?.addEventListener("change", ev => this.go(ev.target.value));
    on("[data-hcb=prevScene]", () => this.stepScene(-1));
    on("[data-hcb=nextScene]", () => this.stepScene(1));
    on("[data-hcb=prevVar]", () => this.stepVariant(-1));
    on("[data-hcb=nextVar]", () => this.stepVariant(1));
    on("[data-hcb=show]", () => showToPlayers(this.scene));
    on("[data-hcb=view]", () => this.scene?.view());
    on("[data-hcb=activate]", () => this.scene?.activate());
    on(".hcb-cell", ev => this.pick(ev.currentTarget.dataset.key));
    on(".hcb-cell", ev => this.pickAndActivate(ev.currentTarget.dataset.key), "dblclick");

    const search = content.querySelector("[data-hcb=search]");
    search?.addEventListener("input", () => {
      this.query = search.value;
      const sel = content.querySelector("[data-hcb=scene]");
      if (sel) sel.innerHTML = this.optionsHtml();
    });
    search?.addEventListener("keydown", ev => {
      if (ev.key === "Enter") {
        ev.preventDefault();
        const first = this.matches()[0];
        if (first) this.go(first.id);
      } else if (ev.key === "Escape" && search.value) {
        ev.preventDefault(); ev.stopPropagation();
        search.value = ""; search.dispatchEvent(new Event("input"));
      }
    });

    // Arrow keys step through variants and scenes. stopPropagation keeps Foundry's own key bindings (panning the canvas) from seeing them.
    content.tabIndex = 0;
    content.onkeydown = ev => {
      const tag = ev.target?.tagName;
      if (tag === "SELECT" || tag === "INPUT") return;
      if (ev.key === "Enter" && ev.target?.classList?.contains("hcb-cell")) { ev.preventDefault(); return this.pick(ev.target.dataset.key); }
      const map = { ArrowRight: () => this.stepVariant(1), ArrowLeft: () => this.stepVariant(-1), ArrowDown: () => this.stepScene(1), ArrowUp: () => this.stepScene(-1) };
      if (!map[ev.key]) return;
      ev.preventDefault(); ev.stopPropagation(); map[ev.key]();
    };
    content.onkeyup = ev => { if (ARROWS.includes(ev.key) && !["SELECT", "INPUT"].includes(ev.target?.tagName)) ev.stopPropagation(); };
    if (searching && search) { search.focus(); search.setSelectionRange(search.value.length, search.value.length); }
    else content.focus({ preventScroll: true });
  }

  /** Marks the variant now shown without rendering the window again (so a double-click lands on the same picture). */
  markCurrent() {
    const f = flagOf(this.scene), root = this.element;
    if (!f || !root) return;
    const cur = f.current ?? "tag";
    root.querySelectorAll(".hcb-cell").forEach(el => el.classList.toggle("current", el.dataset.key === cur));
    const span = root.querySelector("[data-hcb=current]");
    if (span) span.textContent = t("HCB.browser.current", { variant: label(cur) });
  }

  async go(sceneId) { this.sceneId = sceneId; await this.render(); }
  async stepScene(step) {
    let list = this.matches();
    if (!list.length) list = moduleScenes();
    if (!list.length) return;
    const i = list.findIndex(s => s.id === this.sceneId);
    const next = i < 0 ? (step > 0 ? 0 : list.length - 1) : (i + step + list.length) % list.length;
    await this.go(list[next].id);
  }
  async pick(key) { if (this.scene) { await setVariant(this.scene, key); this.markCurrent(); } }
  async pickAndActivate(key) {
    const scene = this.scene;
    if (!scene) return;
    if ((flagOf(scene).current ?? "tag") !== key) await setVariant(scene, key);
    if (!scene.active) await scene.activate();
  }
  async stepVariant(step) { if (this.scene) { await cycleVariant(this.scene, step); this.markCurrent(); } }
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

/** Right-click entry on a scene in the Scenes list, a button in the list header and (optionally) a button in the scene controls.
 *  Several hook names, because they differ between versions. */
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
  // Own button group in the scene controls on the left (v13+ structure: controls and tools are records). Choosing the group opens
  // the variant window; its two tools open the window again and show the picture to the players. It has no canvas layer of its own.
  Hooks.on("getSceneControlButtons", controls => {
    try {
      if (!game.user.isGM || !game.settings.get(MOD, "controlButton")) return;
      if (!controls || Array.isArray(controls)) return;
      controls.hexcrawlBackdrops = {
        name: "hexcrawlBackdrops", order: Object.keys(controls).length + 1, title: "HCB.btn.controls", icon: "fa-solid fa-images", visible: true,
        onChange: (event, active) => { if (active) openBrowser(); },
        tools: {
          browser: { name: "browser", order: 1, title: "HCB.btn.controlsBrowser", icon: "fa-solid fa-images", button: true, onChange: () => openBrowser() },
          show: { name: "show", order: 2, title: "HCB.btn.controlsShow", icon: "fa-solid fa-image", button: true, onChange: () => showToPlayers() }
        }
      };
    } catch (e) { console.warn(`${MOD} | scene controls button`, e); }
  });
  // Keep the "active" line of the window right when a scene is activated or another scene is viewed.
  const refresh = () => { if (instance?.rendered) instance.render(); };
  Hooks.on("updateScene", (scene, changes) => { if ("active" in changes) refresh(); });
  Hooks.on("canvasReady", refresh);
}

export const browserInstance = () => instance;
