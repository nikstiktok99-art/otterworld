# Testprotokoll

Jede Spalte zählt nur für sich: Ein Browser- oder Simulatorlauf ist kein Gerätetest.

## Schritt 1a – Durchstich

| Test | Browser (iPhone-Ansicht) | Android | iPhone-Simulator (Cloud) | iPhone 16 Pro (ihr Gerät) |
|---|---|---|---|---|
| Startbild erscheint, Tippen startet | ok 06.11.2026 | offen | offen | offen |
| Tippen → Otter läuft dorthin | ok | offen | – (Simulator-Test tippt nicht) | offen |
| Muschel einsammeln, Zähler steigt, Ton | ok | offen | – | offen |
| App schließen & neu öffnen → Muscheln noch da | ok (localStorage) | offen | – | offen (nativer Speicher) |
| In den Hintergrund wechseln → gespeichert („Hintergrund“ im Technik-Test) | – | offen | – | offen |
| Spielstand-Code sichern → Speicher leeren → Code laden | ok | offen | – | offen |
| Nichts unter der Dynamic Island / dem Home-Indikator | – (keine Safe Area im Browser) | offen | offen (Bildschirmfoto) | offen |
| Kein Zoom bei Doppeltipp, keine Lupe bei langem Drücken | – | offen | – | offen |
| Technik-Test zeigt „nativ (Preferences)“ | – | offen | – | offen |
| App startet ohne Absturz, keine JS-Fehler in der Konsole | – | offen | offen | offen |
| Cloud-Build erzeugt .ipa | – | – | – | ok 07.11.2026 (Lauf b1, Commit ba79055; Inhalt geprüft: App-ID, Spieldateien, Capacitor-Framework, Plugins Preferences/App/StatusBar) |
| Installation per Sideloadly | – | – | – | offen |
| Update per Sideloadly → Spielstand bleibt | – | – | – | offen |

**So prüft sie es auf dem iPhone:** Menü → „Technik-Test anzeigen“. Unten steht dann, welcher Speicher benutzt wird,
wann zuletzt gespeichert wurde und wie groß die Safe Areas sind (auf dem 16 Pro oben etwa 62, unten 34).
Ein Foto davon (Bildschirmfoto) an dich reicht als Nachweis.

Hinweis: Ein erfolgreicher Cloud-Build beweist nur, dass die Datei korrekt gebaut ist. Ob die App auf ihrem iPhone startet, zeigt erst die Installation.

## Reihenfolge (Entscheidung 07.11.2026)

Sie bekommt das Spiel erst, wenn eine kleine spielbare Version steht. Bis dahin:

- nach jedem größeren Schritt: Browser-Tests, Android-Testbuild auf deinem Handy und der iPhone-Simulator-Test in der Cloud,
- vor der Übergabe an sie: der vollständige Gerätetest auf ihrem iPhone 16 Pro (Spalte ganz rechts). Erst dann gilt die Version als fertig.
