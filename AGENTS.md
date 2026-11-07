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

## Rückmeldung aus dem ersten Einbau (Paket 01)

- `characters.schnabbi.idle.se` (88 × 48, Anker 44/40) ist eingebaut und funktioniert technisch.
- Im Spiel wirkt Schnabbi neben dem 32 px hohen Otter **sehr groß** (74 px lang ≈ 4–5 Kacheln) und überdeckt
  beim Sitzen die 16 × 32 px große Uferleuchte. Bitte prüfen, ob ein Verhältnis von etwa 48–56 px Körperlänge
  besser passt – dann ändern wir die Framegröße im Katalog gemeinsam.
