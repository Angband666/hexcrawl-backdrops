# Hexcrawl Backdrops

<img src="logo/Dolmenwood_Compatibility_Logo_Black_On_White.png" alt="Dolmenwood Compatible Product" width="320">

*Scenes for the Dolmenwood RPG.* [Deutsche Anleitung: README.de.md](README.de.md)

> ☕ **This module is and stays free.** If it helps your game and you feel like it, you can <a href="https://buymeacoffee.com/angband"><img src="docs/bmc-button.svg" alt="Buy me a coffee" width="130"></a>. That is entirely voluntary and nothing in the module depends on it.

Backdrops for hexcrawl play in Foundry VTT. Every scene comes with variants for time of day, weather, season and campsite, which you switch by hand.

- **159 encounter places**: forest, bog and water, settlements, inns and interiors, dungeons and campsites
- **200 hex scenes**: one landscape for each hex, numbered `0101` to `1906`
- **20 fairy scenes**: the six fairy roads and the fourteen fairy realms
- **Variants**: night, dusk, rain and mist, thunderstorm, light mist, winter, autumn, spring, and campsites at dusk and at night (interiors: night, stormy night, morning)
- **Languages**: scene and folder names in English or German, chosen when you import.

It does not change weather, time or effects by itself: you pick the variant.

## Why this exists
I made these scenes for my own Dolmenwood campaign. Other game masters may find them useful, so I share them for free. Some of the AI images are not perfect. That is part of the deal: if one does not work for you, just pick a different one. This is about a good selection of backdrops, not about perfection. This is my first release on GitHub, so please be patient with me. I simply hope it will be useful for other game masters.

## AI disclosure: how the images were made
**All images in this module are AI-generated.** I made every image locally on my own computer with FLUX.2 klein 4B (Black Forest Labs, Apache 2.0), from my own written scene descriptions. I picked and checked the images and regenerated or edited them where they did not fit the place. I used no official Dolmenwood artwork, maps or text as input or reference, and no model was trained or fine-tuned on Dolmenwood material. The module contains no music and no text from the books. Details: LICENSE-IMAGES.md.

## Preview
A few scenes and their variants (night, dusk, rain, storm, winter, autumn):

![Encounter locations](docs/preview-encounters.jpg)

![Hex landscapes](docs/preview-hexes.jpg)

## Requirements
- Foundry VTT v14
- The Dolmenwood core books
- Recommended: **Alternate Zone Movement** (movement zones in the encounter places)

## Installation
In Foundry: *Add-on Modules, Install Module*, paste the manifest URL into the field at the bottom:

```
https://github.com/Angband666/hexcrawl-backdrops/releases/latest/download/module.json
```

The download is about 870 MB. Enable the module in your world.

## First start
When a GM opens a world with the module for the first time, a dialog appears. Choose **English** or **Deutsch** and the packs you want, then press *Import*. The scenes are created in the folder *Hexcrawl Backdrops*. You can open the dialog again at any time: *Settings, Configure Settings, Hexcrawl Backdrops, Import scenes…*

- *Import* creates missing scenes and skips existing ones, so you can run it again safely.
- *Update and rename* re-links the variants of imported scenes and renames scenes and folders to the chosen language. Your own changes to the scenes are kept.
- The images stay in the module folder, they are not copied into your world.

## Switching the variant
Open a scene of the module and pick a variant:

- **Macro** *Backdrop variant…* (put on your hotbar automatically): a list of all variants the scene has.
- **Quick macros** in the macro folder *Hexcrawl Backdrops / Backdrop*: *Day, Night, Dusk, Rain & mist, Thunderstorm, Light mist, Winter, Autumn, Spring, Stormy night, Morning, Camp at dusk, Camp at night*. Drag the ones you use to the hotbar.
- **Chat command** (GM only):

```
/backdrop                 opens the list for the current scene
/backdrop night           shows a variant directly: day, night, dusk, rain, storm, mist, winter, autumn, spring, camp, campdusk
/backdrop import          opens the import dialog
/backdrop macros          creates missing macros and renames existing ones to the chosen language
/backdrop help            lists the names
```

`/hcb` works as a short form. The campfire light appears only in the campsite variants. Not every scene has every variant (interiors have night, stormy night and morning; dungeons only the camp at night); you get a message if a variant is missing.

## Settings
- Language of scene names
- *Import scenes…* button

## Notes
- Hex scenes are named by hex number only.
- Fairy scenes carry the names of the fairy roads and realms.
- The scenes are created at the size of their image. Tokens work as on any other scene.
- Older test versions created weather macros; they are removed automatically.

## Credits and legal
Code: MIT, see LICENSE. Images: CC BY-NC 4.0, see LICENSE-IMAGES.md. Made with FLUX.2 klein 4B.

Dolmenwood is published by Necrotic Gnome: https://necroticgnome.com

This is an independent product published under the Dolmenwood Third-Party Licence and is not affiliated with or approved by Necrotic Gnome. Dolmenwood® and all related characters and elements are © Necrotic Gnome and used with permission under licence. Requires the Dolmenwood core books.

Dolmenwood Compatible Product logo: see NOTICE.md.
