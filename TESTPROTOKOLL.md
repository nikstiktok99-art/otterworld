# Testprotokoll

Jede Spalte zählt nur für sich: Ein Browser- oder Simulatorlauf ist kein Gerätetest.

## Schritt 1b – Der erste Abend (Version 0.2.0, Commit d5118ff)

Automatisch geprüft am 07.11.2026:

- **Unit-Tests:** 40 bestanden (`npm test`) – Regeln, doppelte Belohnungen, Speichern/Laden inkl. beschädigtem Speicherplatz
  und neuerer Version, Spielstand-Code, Inhaltsreferenzen, Erbsentrio-Datenmodell, Wege, Modulgrenzen, keine Emojis.
- **Typprüfung:** fehlerfrei (`npm run check`).
- **Cloud:** „Prüfen“, „iPhone-Build (.ipa)“ (b2), „Android-Testbuild (.apk)“ (a2) und „iPhone-Simulator-Test“ grün.

| Test | Browser (`npm run e2e`, Chromium, 402 × 874, Touch) | Android (dein Handy) | iPhone-Simulator (Cloud, iOS 26.2) | iPhone 16 Pro (ihr Gerät) |
|---|---|---|---|---|
| App startet, Startbild, keine Fehler in der Konsole | ok | offen | ok (Startbild nach 35 s, keine Fehler) | offen |
| Laufen und Schwimmen per Tippen, Wechsel Land/Wasser | ok | offen | – (Test tippt nicht) | offen |
| Tipp auf Figur/Gegenstand: hinlaufen und genau einmal interagieren | ok | offen | – | offen |
| Namenswahl im ersten Gespräch, danach Anrede mit Namen | ok | offen | – | offen |
| Doppeltipp auf eine Fundstelle gibt nur eine Belohnung | ok | offen | – | offen |
| Werkbank: Verbrauch und Ergebnis passen zusammen | ok | offen | – | offen |
| Unterbrechen direkt nach dem Bauen → danach stimmt alles | ok (Seite neu geladen) | offen (App wegwischen) | – | offen |
| Deko nur auf gültigem Grund; vor dem Steg und auf Wasser abgelehnt | ok | offen | – | offen |
| Unterbrechen direkt nach dem Aufstellen → Leuchte steht, Schnabbi sitzt, Belohnung noch offen | ok | offen | – | offen |
| Abschluss: Leuchte an, Moment genau einmal, auch bei erneutem Gespräch | ok | offen | – | offen |
| Endstand bleibt nach Neuladen erhalten | ok | offen | – | offen |
| Nativer Speicher wird benutzt | – | offen (Menü › Technik-Info) | ok (Konsole: Preferences liest beide Plätze) | offen |
| Lebenszyklus angemeldet (Pause, Fortsetzen, Zurück) | – | offen | ok (Konsole: 4 Listener) | offen |
| Hochformat-Sperre | – | offen | – | offen |
| Nichts unter Dynamic Island / Home-Indikator / Systemleisten | – | offen | ok (Startbild-Foto) | offen |
| Android-Zurück schließt Fenster, im Spiel geht die App in den Hintergrund | – (Escape-Taste nicht getestet) | offen | – | – |
| Offline-Start (Flugmodus) | – | offen | – | offen |
| Ton und Vibration | – (Ton im Testbrowser nicht hörbar) | offen | – | offen |
| Cloud-Build erzeugt .ipa | – | – | – | ok (b2, 920 KB) |
| Installation und Update per Sideloadly, Spielstand bleibt | – | – | – | offen |

**So prüft man es auf dem Handy:** Menü › Technik-Info. Dort stehen Version, Speicher („nativ (Preferences)“),
letzte Speicherung und die Safe Areas (auf dem 16 Pro oben etwa 62, unten 34). Ein Bildschirmfoto davon reicht als Nachweis.

## Schritt 1a – Durchstich (abgeschlossen, durch 1b ersetzt)

Browser ok (06.11.2026), Cloud-Build b1 ok, Simulator ok (Start, Safe Area, nativer Speicher). Auf Geräten nie installiert.

## Reihenfolge (Entscheidung 07.11.2026)

Sie bekommt das Spiel erst, wenn eine kleine spielbare Version steht. Bis dahin:

- nach jedem größeren Schritt: Browser-Tests, Android-Testbuild auf deinem Handy und der iPhone-Simulator-Test in der Cloud,
- vor der Übergabe an sie: der vollständige Gerätetest auf ihrem iPhone 16 Pro (Spalte ganz rechts). Erst dann gilt die Version als fertig.
