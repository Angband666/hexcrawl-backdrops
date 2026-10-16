# Publishing checklist (not part of the module zip)

Nothing has been uploaded. Work through this list before you publish.

## Before anything goes online
- [ ] **Necrotic Gnome:** send the question mail (3pp@necroticgnome.com) and wait for the answer. Open points: does the licence cover a Foundry module with backdrops (prohibited content item 10), are AI-generated images acceptable (item 9), may hex numbers and names be used in scene names, how to use the Compatibility Logo.
- [ ] **Compatibility Logo:** get the logo files from the Dolmenwood Creator Kit (https://necroticgnome.com/products/dolmenwood-creator-kit), put them in `assets/logo/` and mention the logo in NOTICE.md and both READMEs.
- [ ] **Name:** the credited name is "angband" (LICENSE, LICENSE-IMAGES.md, module.json); change it there if you want another.
- [ ] **Test in a fresh world** (not your campaign world): install from the zip, first-start dialog, import English and German, change weather, time and season, set a campsite variant, check FXMaster effects and the movement zones.
- [ ] If you also run the older world scripts (`dolmenwood-wetterfx`), disable that module in the test world. Both would switch the same scenes.
- [ ] Look at the notes in the files marked with OWNER: the URLs assume the GitHub name `angband`; change them if the account name differs (the build script takes --repo).

## GitHub
1. Create a repository (private while testing, public only after Necrotic Gnome answered) `hexcrawl-backdrops`. Commit everything except `assets/` and `dist/` (see .gitignore).
2. `python tools/build_release.py --repo angband/hexcrawl-backdrops --version 0.1.0`
3. Create a release `v0.1.0` and attach `dist/hexcrawl-backdrops.zip` and `dist/module.json`. A single release file may be up to 2 GB; the zip is about 870 MB.
4. Install in Foundry with the manifest URL `https://github.com/angband/hexcrawl-backdrops/releases/latest/download/module.json`.
5. Tell Necrotic Gnome (3pp@necroticgnome.com) and send them a copy, as the licence asks.

## Not in the Foundry package list
Foundry's AI policy does not allow AI-generated images in the official listing. Distribution works through the manifest URL only.

## Known limits
- Written for Foundry v14 (scene levels). Tested with a mocked Foundry API only, not yet in a real world.
- The Dolmenwood weather table texts are matched in English and German; other languages fall back to clear weather.
- Music is not included; the weather scripts do not play audio.
