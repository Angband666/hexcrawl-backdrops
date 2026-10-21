# Publishing checklist (not part of the module zip)

Nothing has been uploaded yet. State: 2026-10-21.

## Done
- [x] **Necrotic Gnome answered** (Rachel, Customer Support, reply to the mail of 2026-10-15; kept in `PUBLISHING_CHECKLIST.local.md`, not in git):
  - Foundry module: you may publish it; the licence will be updated when the official Dolmenwood system for Foundry is out.
  - AI art is not prohibited; each publisher decides. Recommended: be open about the process, use AI tags where they exist, say so in the product description. (Done: README, module.json, release notes.)
  - Hex numbers and location names in scene names: fine ("Referencing the Dolmenwood Property").
  - Compatibility logo: put it on a legal or product page. (NOTICE.md and both READMEs.)
  - README links to your hosting place and to necroticgnome.com: fine.
- [x] AI disclosure added to README.md, README.de.md, module.json, LICENSE-IMAGES.md, RELEASE_NOTES.md.
- [x] Credited name is "angband" (LICENSE, LICENSE-IMAGES.md, module.json).
- [x] Release build tested locally (`dist/`).

- [x] Compatibility Logo (both versions) is in `logo/`, shown at the top of both READMEs, in NOTICE.md and in the Foundry module description (the licence asks to feature it prominently).
- [x] GitHub account is Angband666; URLs use `Angband666/hexcrawl-backdrops` (the credited author name stays "angband" unless you change it).

## Still open
- [ ] **GitHub:** create the account/repository `Angband666/hexcrawl-backdrops` (private while preparing, public when you publish). Suggested description: "Scene backdrops for hexcrawl play in Foundry VTT (AI-generated images, free, non-commercial)". Suggested topics: foundry-vtt, foundry-module, dolmenwood, ai-generated, battlemap.
- [ ] **Test in a fresh Foundry world** with the final zip: first-start dialog, import English and German, variants via dialog macro, quick macros and /backdrop, campfire light, movement zones.
- [ ] **Publish** (needs your OK each time): `git remote add origin ...`, `git push -u origin main`, then `python tools/build_release.py --repo Angband666/hexcrawl-backdrops --version 0.1.0`, create release `v0.1.0`, paste RELEASE_NOTES.md as the description, attach `dist/hexcrawl-backdrops.zip` (about 870 MB, limit 2 GB) and `dist/module.json`.
- [ ] Install test with the manifest URL.
- [ ] Mail Necrotic Gnome (3pp@necroticgnome.com): link to the release, as the licence asks to share a copy; offer the zip.
- [ ] Ask Necrotic Gnome separately about the atmosphere videos if they use Dolmenwood names (not asked yet).

## Not in the Foundry package list
Foundry's AI policy does not allow AI-generated images in the official listing. Distribution works through the manifest URL only.

## Known limits
- Written for Foundry v14 (scene levels).
- The module does no weather automation. The old engine is in git under the tag `weather-engine`; re-add it when the official Dolmenwood system has weather.
- Do not enable the old world module `dolmenwood-wetterfx` together with this module in one world.
- Music is not included.
