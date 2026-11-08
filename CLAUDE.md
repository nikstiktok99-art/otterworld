# Otterwelt – Arbeitsregeln für Claude

Persönliches Cozy-Otterspiel für die Freundin des Nutzers. Auf Deutsch arbeiten. Projektgrundlage ist ein
„Masterprompt“, den der Nutzer bei Bedarf einfügt. Eigene Ideen als **Vorschlag** kennzeichnen; keine Erinnerungen
der Freundin erfinden. An vereinbarten Meilensteinen stoppen und kurz berichten.

## Harte Regeln

- **Keine Emojis** – nicht als Icons, Figuren, Items, Knöpfe, Deko, Platzhalter, auch nicht in Doku (ein Test prüft `src/`).
- `src/game` und `src/content` importieren nichts aus Phaser, React oder Capacitor (Test prüft das).
- Genau eine Stelle pro Zustandsänderung: `src/game/reduce.ts`. Welt und UI rufen nur `session.dispatch`.
- Die Spielregeln lesen keine Uhr: Zeit kommt mit der Aktion (`gather.at`, Quelle `src/app/clock.ts`).
- Neue Missionen, Freunde, Rezepte und Orte sind reine Daten nach `docs/MISSIONEN.md`; Spielstand-Änderungen nur mit
  Schema-Erhöhung und Migration in `src/game/save/normalize.ts` (plus Test mit einem Stand der Vorversion).
- Figuren-ID, Weltkörper-ID und Grafikschlüssel bleiben getrennt; pro Körper höchstens eine Instanz in der Welt.
- App-ID `com.schnabbisfriends.otterwelt` nie ändern (Sideload-Updates brauchen dieselbe ID).
- Keine Funktionen, die ein bezahltes Apple-Konto verlangen (Push, iCloud, In-App-Käufe, Game Center).
- Grafik macht Codex. Ich baue nur Spielprinzip und Platzhalter hinter den Schlüsseln aus `src/assets/catalog.ts`.
- Versionen exakt pinnen; neue Pakete: neueste Version, die mindestens zwei Wochen alt ist.

## Plattformen und Prüfung

- Hauptziel ist ihr **iPhone 16 Pro** (Sideloadly, kostenlose Apple-ID, 7 Tage). Kein Mac – iOS nur über GitHub Actions.
- `gh` liegt unter `C:\Program Files\GitHub CLI\gh.exe`, angemeldet als `nikstiktok99-art`. Repo: `nikstiktok99-art/otterworld`.
- Vor jedem Bericht: `npm run check`, `npm test`, `npm run e2e`; danach Cloud-Läufe „Prüfen“, „iPhone-Simulator-Test“, bei Bedarf Builds.
- Testergebnisse ehrlich pro Spalte in `TESTPROTOKOLL.md`: Browser, Android, Simulator und echtes iPhone sind getrennte Nachweise.
