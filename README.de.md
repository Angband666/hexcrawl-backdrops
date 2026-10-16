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
Wird das Wetter gewürfelt (Dolmenwood-Kalender), vergeht Zeit oder öffnest du eine Szene, wechselt der Hintergrund zur passenden Variante. Zuerst entscheidet die Nacht nach Kalenderzeit, dann Wetterbilder (Gewitter, Nebel, Regen, Schnee), dann die Dämmerung, dann die Jahreszeit, zuletzt das normale Tagbild. Lager-Varianten werden nie automatisch gewählt; stelle sie von Hand ein:

```js
game.modules.get("hexcrawl-backdrops").api.chooseVariant()
```

Lege das in ein Skript-Makro. Es öffnet für die aktuelle Szene einen Dialog, in dem du jede Variante wählen oder zu *Automatisch* zurückkehren kannst. Das Lagerfeuerlicht erscheint nur in den Lager-Varianten.

## Einstellungen
- Sprache der Szenennamen
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
