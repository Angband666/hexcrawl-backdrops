# Changelog

## 0.3.0
- Search field in the variant window: type part of a name or a hex number (e.g. `0412`), Enter jumps to the first match. Up and down then step through the matches only.
- The window says whether the scene is active (players see every change at once) or not (the change is saved for later).
- New buttons in the window: **Activate**, **View** (only for you) and **Show to players**. Double-click a picture to choose it and activate the scene in one step.
- **Show to players** shares the chosen picture with all players as a large image window, without activating the scene and without changing your own view. Also as `/backdrop show` and as the macro "Show backdrop to players".
- A Hexcrawl Backdrops button of its own in the scene controls on the left: it opens the variant window and has a tool to show the picture to the players. It can be switched off in the module settings.
- Fixed: the arrow keys in the variant window no longer pan the canvas behind it.

## 0.2.0
- New variant window that stays open: one click on a picture switches the scene at once, arrow keys step through variants and scenes, a menu picks any scene of the module.
- Right-click a scene in the Scenes list and choose "Hexcrawl variants" (also a "Variants" button in the list header). The scene does not have to be open or active: the variant is saved in the scene, so it is already right when you activate it.
- New macros "Next variant" and "Previous variant" and the chat commands `/backdrop next` and `/backdrop prev`.
- After the import (and once after this update) a chat message tells you where the macro is and how else to switch variants. The macro "Backdrop variant." now opens the window.
- README: Alternate Zone Movement is optional.

## 0.1.0
- First version: 159 encounter places, 200 hex scenes, 20 fairy road and realm scenes.
- Variants for night, dusk, rain and mist, thunderstorm, light mist, winter, autumn, spring and campsites (dusk and night), switched by hand with a dialog macro, quick macros or `/backdrop`.
- Movement zones (with Alternate Zone Movement) and campfire lights.
- English and German scene names, chosen in the import dialog; preview images for all scenes.
- The weather automation (calendar, weather, FXMaster) was left out on purpose. It is kept in the git history under the tag `weather-engine` and can be brought back when the official Dolmenwood system offers weather.
