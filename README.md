# Hexcrawl Backdrops

*Scenes for the Dolmenwood RPG.* [Deutsche Anleitung: README.de.md](README.de.md)

Backdrops for hexcrawl play in Foundry VTT, with automatic weather, time-of-day, season and campsite variants.

- **159 encounter places**: forest, bog and water, settlements, inns and interiors, dungeons and campsites
- **200 hex scenes**: one landscape for each hex, numbered `0101` to `1906`
- **20 fairy scenes**: the six fairy roads and the fourteen fairy realms
- **Variants**: night, dusk, rain and mist, thunderstorm, light mist, winter, autumn, spring, and campsites at dusk and at night (interiors: night, stormy night, morning)
- **Automatic**: the backdrop follows the Dolmenwood calendar (time of day, season) and the weather table. FXMaster adds rain, snow, fog and storm effects.
- **Languages**: scene and folder names in English or German, chosen when you import.

All images are AI-generated (see LICENSE-IMAGES.md). The module contains no music and no text from the books.

## Requirements
- Foundry VTT v14
- The Dolmenwood game system (`dolmenwood`) and the Dolmenwood core books
- Recommended: **FXMaster** (weather effects) and **Alternate Zone Movement** (movement zones in the encounter places)

## Installation
In Foundry: *Add-on Modules, Install Module*, paste the manifest URL into the field at the bottom:

```
https://github.com/angband/hexcrawl-backdrops/releases/latest/download/module.json
```

The download is about 870 MB. Enable the module in your world.

## First start
When a GM opens a world with the module for the first time, a dialog appears. Choose **English** or **Deutsch** and the packs you want, then press *Import*. The scenes are created in the folder *Hexcrawl Backdrops*. You can open the dialog again at any time: *Settings, Configure Settings, Hexcrawl Backdrops, Import scenes…*

- *Import* creates missing scenes and skips existing ones, so you can run it again safely.
- *Update and rename* re-links the variants of imported scenes and renames scenes and folders to the chosen language. Your own changes to the scenes are kept.
- The images stay in the module folder, they are not copied into your world.

## How it works
When the weather is rolled (Dolmenwood calendar), when time passes or when you open a scene, the backdrop switches to the fitting variant. Night is chosen by the calendar time, then weather pictures (storm, mist, rain, snow), then dusk, then the season, then the plain day image. Campsite variants are never chosen automatically; set them by hand with the chat command (GM only):

```
/backdrop                 opens a dialog for the current scene
/backdrop night           sets a variant directly: day, night, dusk, rain, storm, mist, winter, autumn, spring, camp, campdusk
/backdrop auto            back to automatic
/backdrop import          opens the import dialog
/backdrop help            lists the names
```

The campfire light appears only in the campsite variants. `/hcb` works as a short form. Type the commands into the Foundry chat (GM only). The same is available as a script: `game.modules.get("hexcrawl-backdrops").api.chooseVariant()`.

## Weather
The module uses the weather of the Dolmenwood system when the system has one. If it has none (or you set *Weather source* to *Chosen by the GM*), you pick the current weather by hand: `/backdrop weather` opens a list, `/backdrop weather rain` sets it directly (clear, cloudy, windy, mist, fog, drizzle, rain, storm, snow, blizzard), or use *Settings, Hexcrawl Backdrops, Choose weather…*. The module never rolls or invents weather. *Off* uses only time of day and season.

## Macros
On first start (and with *Import* or *Update*) the module creates world macros in the macro folder *Hexcrawl Backdrops*: **Weather…** (opens the weather list, it is also put on your hotbar), **Backdrop variant…**, and one quick macro per weather (*Weather: Rain*, …) that you can drag to the hotbar. `/backdrop macros` creates missing ones and renames existing ones to the chosen language.

## Settings
- Language of scene names
- Weather source (automatic / chosen by the GM / off)
- Switch variants automatically (on/off)
- FXMaster effects (on scenes of this module / off)
- Seasonal variants in clear weather
- Night and dusk by calendar time

## Notes
- Hex scenes are named by hex number only.
- Fairy scenes carry the names of the fairy roads and realms.
- The scenes are created at the size of their image. Tokens work as on any other scene.

## Credits and legal
Code: MIT, see LICENSE. Images: CC BY-NC 4.0, see LICENSE-IMAGES.md. Made with FLUX.2 klein 4B.

This is an independent product published under the Dolmenwood Third-Party Licence and is not affiliated with or approved by Necrotic Gnome. Dolmenwood® and all related characters and elements are © Necrotic Gnome and used with permission under licence. Requires the Dolmenwood core books.
