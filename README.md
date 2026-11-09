# Otterwelt

Kleines, persönliches Otterspiel. **Hauptplattform: ihr iPhone 16 Pro.** Android = dein Testgerät, Browser = schnelle Vorschau.

Aktueller Stand: **Version 0.8.0** – mit Wegkarte zum Reisen zwischen besuchten Orten; alle Orte aus dem Masterprompt sind begehbar (Tiramisu Stream, Zoo, Cat Café, Hotpot-Restaurant, Fuchsbau) und alle Freunde aus dem Kanon haben eine Kennenlern-Aufgabe; dazu der Grundbau für Missionen und Crafting
(Aufgabenbuch, Sprechblasen über Figuren, Antworten im Gespräch, Abgeben/Geschenke, nachwachsende Fundstellen,
freies Bauen, Deko einpacken, Stationen; Baukasten in `docs/MISSIONEN.md`, Plan in `docs/WELTPLAN.md`). Spielbar: der erste Abend, danach ein zweites
Erlebnis mit Schnabbi in der Schilfbucht, Freundebuch und Spielen als Schnabbi, danach der Tiramisu Stream mit Lumis
Picknick (Lumi wird spielbar) und einem Kissen für Rosie und Bubbles, dann der Zoo mit Meerkats Wimpel und Squichys Ball,
das Cat Café mit dem versteckten Chamaron, das Hotpot-Restaurant mit dem Erbsentrio am Kochtopf und Bean beim Fuchsbau.
Alle Grafiken sind Platzhalter bis auf Schnabbis Codex-Entwurf; Geschichte und Texte von Phase 2 sind Vorschläge.

## Selbst spielen

**Im Browser (Windows):**

```bash
npm install
npm run dev
```

Dann http://localhost:5173 öffnen, in den Entwicklertools die Handyansicht wählen (z. B. 402 × 874).
Auf dem Handy im selben WLAN: `npm run dev:lan` und die angezeigte Netzwerkadresse öffnen (zählt nur als Browserprüfung).

**Android:** Actions › „Android-Testbuild (.apk)“ › Run workflow → .apk aufs Handy, installieren.
Lokal geht es auch: `npm run android:apk` (braucht das Android-SDK; die .apk liegt dann unter `android/app/build/outputs/apk/debug/`).

**iPhone:** Actions › „iPhone-Build (.ipa)“ › Run workflow → .ipa an sie schicken → sie folgt `ANLEITUNG-IPHONE.md`.

Vorab-Prüfung ohne ihr iPhone: „iPhone-Simulator-Test“ startet die App in einem virtuellen iPhone 16 Pro und liefert
Bildschirmfotos, Konsolenausgabe und ggf. Absturzberichte. Ersetzt nicht den Test auf ihrem echten Gerät.

(Claude startet und prüft diese Läufe über das GitHub-Werkzeug `gh`.)

## Prüfen

| Befehl | Was |
|---|---|
| `npm run check` | TypeScript-Typprüfung |
| `npm test` | Regeln, Speichern/Laden, doppelte Belohnungen, Inhaltsreferenzen, Wege, Modulgrenzen, keine Emojis |
| `npm run e2e` | Browser-Durchlauf von Phase 1 und 2 in iPhone-Größe inkl. Neuladen nach Bauen, Aufstellen, in der zweiten Map und als Schnabbi, mit Fotos in `e2e-ergebnis/` |

Bei jedem Hochladen läuft „Prüfen“ automatisch auf GitHub.

## Aufbau

| Ordner | Zuständigkeit |
|---|---|
| `src/app` | Startet eine Spielinstanz, verbindet alles, Speichern (zwei Plätze, Warteschlange), Lebenszyklus, Dialogablauf |
| `src/game` | Reine Spielregeln – keine Imports aus Phaser, React oder Capacitor (ein Test prüft das) |
| `src/content` | Typisierte Inhalte: Figuren, Körper, Begegnungen, Gegenstände, Rezepte, Quests, Momente, Dialoge (Entwurf), Maps |
| `src/world` | Phaser: Karte, Kamera, Tippen, Bewegung, Schwimmen, Dekoriermodus, Effekte |
| `src/ui` | React: Anzeige, Dialog mit Namenswahl, Beutel, Werkbank, Freundebuch, Menü, Spielstand-Code, Technik-Info |
| `src/assets` | Grafik-Katalog (Übergabevertrag mit Codex) und Platzhalter-Formen |
| `src/platform` | Speicher, Pause/Fortsetzen, Android-Zurück, Haptik – je für Browser und Capacitor |
| `public/art` | Gelieferte PNGs (siehe `docs/GRAFIK_SLOTS.md`) |
| `ios/`, `android/` | Native Projekte (Capacitor 8), nur gezielt angepasst: Hochformat, nur iPhone |

Weitere Dokumente: `TESTPROTOKOLL.md`, `ANLEITUNG-IPHONE.md`, `docs/MISSIONEN.md`, `docs/GRAFIK_SLOTS.md`, `docs/INHALTSPLAN.md`, `AGENTS.md` (für Codex), `CLAUDE.md`.

## Versionen

Exakt gepinnt (siehe `package.json` und `package-lock.json`): Phaser 4.2.1, React 19.3.1, Vite 8.3.5, TypeScript 7.0.2,
Vitest 5.0.5, Capacitor 8.6.0. App-ID `com.schnabbisfriends.otterwelt` – **niemals ändern**, sonst gilt jede neue
Version auf ihrem iPhone als andere App und ihr Spielstand ist weg.

Version erhöhen: `version` in `package.json` **und** `src/app/version.ts` (ein Test prüft, dass beide gleich sind).
