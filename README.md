# Otterwelt

Kleines Spiel, gebaut mit Capacitor. **Hauptplattform: ihr iPhone 16 Pro.** Android = Testgerät, Browser = schnelle Vorschau.

Aktueller Stand: **Schritt 1a – Durchstich** (Platzhalter-Otter, Tippen zum Laufen, Muscheln sammeln, Speichern, Spielstand-Code, Safe Areas, Technik-Test im Menü).

## Neue iPhone-Version erzeugen (für dich)

1. github.com → dieses Repo → **Actions** → links **„iPhone-Build (.ipa)“** → **Run workflow** → grüner Knopf.
2. Ca. 5–10 Minuten warten, bis der Lauf einen grünen Haken hat.
3. Den Lauf anklicken → unten bei **Artifacts** die Datei herunterladen. Das ist eine **.zip**,
   darin liegt die **.ipa**. Entpacken!
4. Die **.ipa** an sie schicken (z. B. per Mail, WhatsApp-Dokument oder USB-Stick).
   Sie folgt dann `ANLEITUNG-IPHONE.md`.

Android-Testversion genauso: **„Android-Testbuild (.apk)“** → .zip → .apk aufs Handy, installieren
(einmalig „Unbekannte Apps installieren“ erlauben).

## Im Browser ansehen

```bash
npm install
```

```bash
npm run serve
```

Dann http://localhost:8080 öffnen (am besten mit der Handy-Ansicht der Entwicklertools).

## Was schon iPhone-fest ist

- Speichern im **nativen** iOS-Speicher (Capacitor Preferences / UserDefaults), Browser-Ersatz: localStorage
- Sofort speichern, wenn die App in den Hintergrund geht; zusätzlich bei jeder Muschel und alle 10 s
- Safe Areas für Dynamic Island und Home-Indikator
- Kein Gummiband-Scrollen, kein Doppeltipp-Zoom, kein Lupen-/Kontextmenü
- Ton erst nach dem ersten Tipp
- Bewegung zeitbasiert (gleich schnell bei 60, 120 Hz oder im Stromsparmodus)
- Nur Hochformat, nur iPhone
- Spielstand als Text-Code sichern/laden (Menü ☰)

## Technik

| Was | Wo |
|---|---|
| Spiel (HTML/JS, kein Build-Schritt) | `www/` |
| Xcode-Projekt (Swift Package Manager) | `ios/App/` |
| Cloud-Builds | `.github/workflows/` |
| App-ID | `de.otterwelt.spiel` (in `capacitor.config.json`) |

Version erhöhen: `version` in `package.json`. Die Build-Nummer zählt GitHub automatisch hoch.
