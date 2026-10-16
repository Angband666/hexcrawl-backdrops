# Hexcrawl Backdrops

*Szenen für das Dolmenwood-Rollenspiel.* [English instructions: README.md](README.md)

Hintergründe für Hexcrawls in Foundry VTT, mit automatischen Varianten für Wetter, Tageszeit, Jahreszeit und Lagerplätze.

- **159 Begegnungsorte**: Wald, Moor und Wasser, Siedlungen, Gasthäuser und Innenräume, Dungeons und Lagerplätze
- **200 Hex-Szenen**: eine Landschaft je Hexfeld, nummeriert von `0101` bis `1906`
- **20 Feen-Szenen**: die sechs Feenstraßen und die vierzehn Feenreiche
- **Varianten**: Nacht, Dämmerung, Regen und Nebel, Gewitter, leichter Nebel, Winter, Herbst, Frühling sowie Lager am Abend und bei Nacht (Innenräume: Nacht, Sturmnacht, Morgen)
- **Automatisch**: Der Hintergrund folgt dem Dolmenwood-Kalender (Tageszeit, Jahreszeit) und der Wettertabelle. FXMaster ergänzt Regen-, Schnee-, Nebel- und Gewittereffekte.
- **Sprachen**: Szenen- und Ordnernamen auf Deutsch oder Englisch, gewählt beim Import.

Alle Bilder sind KI-generiert (siehe LICENSE-IMAGES.md). Das Modul enthält keine Musik und keine Texte aus den Büchern.

## Voraussetzungen
- Foundry VTT v14
- Das Dolmenwood-Spielsystem (`dolmenwood`) und die Dolmenwood-Grundbücher
- Empfohlen: **FXMaster** (Wettereffekte) und **Alternate Zone Movement** (Bewegungszonen in den Begegnungsorten)

## Installation
In Foundry: *Add-on-Module, Modul installieren*, die Manifest-URL unten in das Feld einfügen:

```
https://github.com/angband/hexcrawl-backdrops/releases/latest/download/module.json
```

Der Download ist etwa 870 MB groß. Das Modul in der Welt aktivieren.

## Erster Start
Öffnet ein GM eine Welt zum ersten Mal mit dem Modul, erscheint ein Dialog. **English** oder **Deutsch** wählen, dazu die gewünschten Pakete, dann *Importieren*. Die Szenen entstehen im Ordner *Hexcrawl Backdrops*. Den Dialog kannst du jederzeit wieder öffnen: *Einstellungen, Einstellungen konfigurieren, Hexcrawl Backdrops, Szenen importieren…*

- *Importieren* legt fehlende Szenen an und überspringt vorhandene. Du kannst es gefahrlos wiederholen.
- *Aktualisieren und umbenennen* verknüpft die Varianten bereits importierter Szenen neu und benennt Szenen und Ordner in die gewählte Sprache um. Eigene Änderungen an den Szenen bleiben erhalten.
- Die Bilder bleiben im Modulordner, sie werden nicht in deine Welt kopiert.

## So funktioniert es
Wird das Wetter gewürfelt (Dolmenwood-Kalender), vergeht Zeit oder öffnest du eine Szene, wechselt der Hintergrund zur passenden Variante. Zuerst entscheidet die Nacht nach Kalenderzeit, dann Wetterbilder (Gewitter, Nebel, Regen, Schnee), dann die Dämmerung, dann die Jahreszeit, zuletzt das normale Tagbild. Lager-Varianten werden nie automatisch gewählt; stelle sie von Hand mit dem Chat-Befehl ein (nur GM):

```
/backdrop                 öffnet einen Dialog für die aktuelle Szene
/backdrop nacht           setzt direkt eine Variante: tag, nacht, dämmerung, regen, gewitter, nebel, winter, herbst, frühling, lager, lagerabend
/backdrop auto            zurück zu Automatisch
/backdrop import          öffnet den Import-Dialog
/backdrop help            listet die Namen auf
```

Das Lagerfeuerlicht erscheint nur in den Lager-Varianten. `/hcb` funktioniert als Kurzform. Die Befehle gibst du in den Foundry-Chat ein (nur GM). Dasselbe gibt es als Skript: `game.modules.get("hexcrawl-backdrops").api.chooseVariant()`.

## Wetter
Das Modul nutzt das Wetter des Dolmenwood-Systems, sobald das System eines hat. Hat es keines (oder stellst du *Wetterquelle* auf *Vom GM gewählt*), wählst du das aktuelle Wetter von Hand: `/backdrop weather` öffnet eine Liste, `/backdrop weather regen` setzt es direkt (klar, bewölkt, windig, dunst, nebel, nieselregen, regen, gewitter, schnee, schneesturm), oder nutze *Einstellungen, Hexcrawl Backdrops, Wetter wählen…*. Das Modul würfelt oder erfindet nie ein Wetter. *Aus* nutzt nur Tageszeit und Jahreszeit.

## Makros
Beim ersten Start (und bei *Importieren* oder *Aktualisieren*) legt das Modul Welt-Makros im Makro-Ordner *Hexcrawl Backdrops* an:
- **Wetter…** (öffnet die Wetterliste) und **Bildvariante…** (listet jede Variante der aktuellen Szene). Beide werden automatisch auf deine Makroleiste gelegt.
- Ordner *Wetter*: je ein Schnellmakro pro Wetter (*Wetter: Regen*, …)
- Ordner *Bild*: je ein Schnellmakro pro Bildvariante: *Automatisch*, *Tag*, *Nacht*, *Dämmerung*, *Herbst*, *Frühling*, *Winter*, *Lager am Abend*, *Lager bei Nacht*

Eine von Hand gesetzte Variante bleibt, bis du wieder *Automatisch* wählst. `/backdrop macros` legt fehlende Makros an und benennt vorhandene in die gewählte Sprache um. Welten, die schon Makros haben, bekommen neu hinzugekommene beim nächsten Start.

## Einstellungen
- Sprache der Szenennamen
- Wetterquelle (automatisch / vom GM gewählt / aus)
- Varianten automatisch wechseln (an/aus)
- FXMaster-Effekte (auf Szenen dieses Moduls / aus)
- Jahreszeiten-Varianten bei klarem Wetter
- Nacht und Dämmerung nach Kalender-Uhrzeit

## Hinweise
- Hex-Szenen heißen nur nach ihrer Hex-Nummer.
- Die Feen-Szenen tragen die Namen der Feenstraßen und Feenreiche.
- Die Szenen entstehen in der Größe ihres Bildes. Spielfiguren funktionieren wie auf jeder anderen Szene.

## Urheber und rechtliche Hinweise
Code: MIT, siehe LICENSE. Bilder: CC BY-NC 4.0, siehe LICENSE-IMAGES.md. Erstellt mit FLUX.2 klein 4B.

This is an independent product published under the Dolmenwood Third-Party Licence and is not affiliated with or approved by Necrotic Gnome. Dolmenwood® and all related characters and elements are © Necrotic Gnome and used with permission under licence. Requires the Dolmenwood core books.
