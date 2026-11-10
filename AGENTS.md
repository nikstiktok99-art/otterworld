# Hinweise für Codex (Grafik)

Claude baut das Spiel, Codex gestaltet die Grafik. Diese Datei beschreibt, wie gelieferte Bilder ins Spiel kommen.

## Wo was liegt

- Arbeitsdateien und Entwürfe: weiterhin `../otter-design/arbeit/` und `../otter-design/uebergabe/` (außerhalb dieses Repos).
- Ins Spiel übernommen werden nur geprüfte PNGs nach `public/art/…`. Den Einbau macht Claude.
- **Quelle der Wahrheit für Schlüssel, Maße, Anker und Frames ist `src/assets/catalog.ts`.**
  Eine lesbare Fassung steht in `docs/GRAFIK_SLOTS.md`.

## Regeln für gelieferte Bilder

- Transparente PNGs, Nearest-Neighbor, keine automatische Beschneidung.
- Animationen als **horizontaler Streifen** gleich großer Frames, Frame 0 links.
- Exakt die Framegröße aus dem Katalog; der Bodenanker (Pixel ab links oben) muss in jedem Frame gleich sitzen.
- Figuren: Richtungen `se` (vorne rechts) und `ne` (hinten rechts). `sw`/`nw` spiegelt das Spiel selbst.
- Dateiname nach Schlüssel, z. B. `characters.otter.walk.se` → `public/art/characters/otter/walk-se.png`.
- Keine Emojis, keine Standard-Icon-Sammlungen, keine nachgezeichneten Emoji-Formen.
- Fotos gehören nicht ins Repo und nicht ins App-Paket.

## Was du nicht anfasst

Spielcode (`src/`), Konfiguration, Abhängigkeiten, native Projekte und Git. Wenn Maße oder Schlüssel nicht passen,
vermerke es in deiner Übergabe – Claude passt den Katalog an.

## Einbau der Entwürfe (Grafik-Stufe 1, Version 0.10.0)

Der User hat alle Entwürfe aus `otter-design/arbeit/` freigegeben („baue alles in dem Style ein, Skalierungen
dürfen abweichen“). Claude schneidet sie mit `scripts/grafik/bauen.mjs` aus (liest `otter-design` nur):

- Motive werden über einen gemeinsamen Maßstab auf Spielgröße gebracht (Starter-Otter ≈ 41 × 30 px);
  je Zielpixel zählt das Quellpixel mittlerer Helligkeit aus der Zellmitte (hält Konturen klar).
- Eingebaut: Starter-Otter (stehen, laufen, treiben), Schnabbi (jetzt 58 px lang), Squichy (v3), Lumi (aus dem
  Otter abgeleitet, mit Krone, Vorschlag), Uferleuchte aus/an, Muschel, Treibholz, Kiesel, Werkbank, Bau (aus
  `startufer.png` ausgeschnitten), Café-Tisch, Korbpflanze, Wurzeltür als Fuchsbau, Schilfmatte, drei Porträts,
  alle 22 Icons aus `uebergabe/paket-03-icons` für die Oberfläche.
- Der Boden (`src/assets/terrain.ts`) und die übrigen Freunde (`src/assets/freunde.ts`) sind im Stil der
  Entwürfe im Code gezeichnet; Farben aus `startufer.png` gemessen.
- Neue Codex-Bilder dürfen weiter Entwürfe sein: einfach in `otter-design/arbeit/` ablegen und im Übergabetext
  sagen, welcher Katalogschlüssel gemeint ist. Am meisten fehlen noch: Rückansichten (`ne`), echte Lauf-Frames,
  und eigene Entwürfe für Meerkat, Rosie, Bubbles, Chamaron, die Erbsenschale, Bean und die Gegenstände der Orte.
