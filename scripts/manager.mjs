// Import dialog: language (English/Deutsch) and which packs to import. Opens automatically on the first start of a world.
import { MOD, PACKS, t } from "./constants.mjs";
import { importPack, packStatus } from "./importer.mjs";
import { ensureMacros, helpHtml } from "./macros.mjs";

let open = false;

export async function openManager({ firstRun = false } = {}) {
  if (!game.user.isGM || open) return;
  open = true;
  try {
    const status = await packStatus();
    const cur = game.settings.get(MOD, "language");
    const rows = PACKS.map(p => {
      const s = status[p];
      return `<label class="hcb-row"><input type="checkbox" name="pack-${p}" ${s.done < s.total ? "checked" : ""}> <b>${t(`HCB.pack.${p}`)}</b> <span>(${s.done}/${s.total} ${t("HCB.imported")})</span></label>`;
    }).join("");
    const content = `
      <style>.hcb-row{display:block;margin:.3rem 0}.hcb-lang label{margin-right:1rem}</style>
      <p>${t("HCB.dialog.intro")}</p>
      <div class="form-group hcb-lang"><label><b>${t("HCB.dialog.language")}</b></label>
        <label><input type="radio" name="lang" value="en" ${cur === "en" ? "checked" : ""}> English</label>
        <label><input type="radio" name="lang" value="de" ${cur === "de" ? "checked" : ""}> Deutsch</label></div>
      <fieldset><legend>${t("HCB.dialog.packs")}</legend>${rows}</fieldset>
      <p class="notes">${t("HCB.dialog.note")}</p>`;
    const read = button => {
      const fd = new FormData(button.form);
      return { lang: fd.get("lang") || cur, packs: PACKS.filter(p => fd.get(`pack-${p}`)) };
    };
    const choice = await foundry.applications.api.DialogV2.wait({
      window: { title: t("HCB.dialog.title"), icon: "fa-solid fa-map" }, position: { width: 520 }, rejectClose: false, modal: false,
      content,
      buttons: [
        { action: "import", label: t("HCB.dialog.import"), icon: "fa-solid fa-download", default: true, callback: (ev, button) => ({ ...read(button), update: false }) },
        { action: "update", label: t("HCB.dialog.update"), icon: "fa-solid fa-rotate", callback: (ev, button) => ({ ...read(button), update: true }) },
        { action: "later", label: t(firstRun ? "HCB.dialog.later" : "HCB.dialog.close"), callback: () => null }
      ]
    });
    if (!choice) return;
    await game.settings.set(MOD, "language", choice.lang);
    await game.settings.set(MOD, "setupDone", true);
    let mr = null;
    try { mr = await ensureMacros({ lang: choice.lang, update: choice.update, hotbar: true }); } catch (e) { console.warn(`${MOD} | macros`, e); }
    if (!choice.packs.length) { ChatMessage.create({ whisper: [game.user.id], speaker: { alias: "Hexcrawl Backdrops" }, content: helpHtml(mr?.slot) }); return; }
    ui.notifications.info(t("HCB.notify.start"));
    const lines = [];
    for (const p of choice.packs) {
      const r = await importPack(p, { lang: choice.lang, update: choice.update,
        progress: (n, total) => ui.notifications.info(t("HCB.notify.progress", { pack: t(`HCB.pack.${p}`), n, total })) });
      lines.push(t("HCB.report.line", { pack: t(`HCB.pack.${p}`), created: r.created, updated: r.updated, skipped: r.skipped }));
    }
    ChatMessage.create({ whisper: [game.user.id], speaker: { alias: "Hexcrawl Backdrops" }, content: `<h3>Hexcrawl Backdrops</h3><p>${lines.join("<br>")}</p>${helpHtml(mr?.slot)}` });
    ui.notifications.info(t("HCB.notify.done"));
  } catch (e) {
    console.error(`${MOD} | import`, e);
    ui.notifications.error(t("HCB.notify.error", { msg: e.message }));
  } finally { open = false; }
}
