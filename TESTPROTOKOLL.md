# Testprotokoll

Jede Spalte zählt nur für sich: Ein Browser- oder Simulatorlauf ist kein Gerätetest.

## Wegkarte (Version 0.8.0)

Automatisch geprüft am 09.11.2026:

- **Unit-Tests:** 125 bestanden, davon 7 neu (`tests/wegkarte.test.ts`): Anzeige am Anfang (Startufer plus drei unbekannte
  Nachbarn), besuchte Orte werden gemerkt (ohne Doppelte), Reisen nur zu besuchten Orten und nicht an den aktuellen,
  Ankunft am sicheren Platz und zurück, Aufgaben „an einem Ort ankommen“ zählen auch bei Kartenreisen, eine reine
  Wasserfigur reist nicht an einen Ort ohne Wasser, Migration 0.7.0 → 0.8.0 leitet besuchte Orte aus dem Stand ab.
- **Typprüfung:** fehlerfrei.
- **Cloud:** CLOUD_ERGEBNIS

| Test | Browser (`npm run e2e`, 102 Prüfungen) | Android (dein Handy) | iPhone-Simulator (Cloud) | iPhone 16 Pro (ihr Gerät) |
|---|---|---|---|---|
| Alles aus 0.7.0 wie bisher | ok | offen | – | offen |
| Knopf „Karte“ erscheint, Karte zeigt alle sieben Orte, „Du bist hier“ | ok | offen | – | offen |
| Vom Fuchsbau direkt in den Zoo, Ankunft am sicheren Platz | ok | offen | – | offen |
| Über die Karte zurück ans Startufer, Neuladen: Orte bleiben | ok | offen | – | offen |
| Vier Knöpfe oben passen in eine Reihe (auch auf schmalen Handys) | ok (402 px) | offen | – | offen |
| Keine Fehler in der Konsole | ok | offen | SIM_ERGEBNIS | offen |

## Cat Café, Hotpot-Restaurant, Fuchsbau (Version 0.7.0)

Automatisch geprüft am 09.11.2026:

- **Unit-Tests:** 118 bestanden, davon 10 neu (`tests/orte.test.ts`): Wege zu allen drei Orten hin und zurück, Chamaron
  erst nach Meerkats Wimpel, Kletterpflanze mit Hinsetzen und Selbst-Ansprechen, genau eine Erbsenschale mit allen drei
  Erbsen (jede spricht mit eigener Stimme), Teigtaschen nur am Kochtopf (Werkbank lehnt ab), drei Momente beim
  Festessen, Beans Kranz mit zwei Rezepten genau einmal. Das Erbsentrio ist jetzt echter Inhalt; die Trio-Prüfungen
  aus Phase 2 laufen gegen ihn.
- **Typprüfung:** fehlerfrei. **Inhaltsprüfung:** alle sieben Orte erreichbar, jeder Weg hin und zurück.
- **Cloud:** „Prüfen“, „iPhone-Build (.ipa)“ (b8), „Android-Testbuild (.apk)“ (a8) und „iPhone-Simulator-Test“ grün.
  Simulator (iPhone 16 Pro): App startet, nativer Speicher liest beide Plätze, 4 Lebenszyklus-Listener, läuft nach 35 s noch.
- **Browser-Durchlauf:** zweimal hintereinander bestanden (98 Prüfungen).

| Test | Browser (`npm run e2e`, 98 Prüfungen) | Android (dein Handy) | iPhone-Simulator (Cloud) | iPhone 16 Pro (ihr Gerät) |
|---|---|---|---|---|
| Alles aus 0.6.0 wie bisher | ok | offen | – | offen |
| Cat Café: Chamaron getarnt ohne Sprechblase, finden, danach Farbwechsel | ok | offen | – | offen |
| Kletterpflanze am Basteltisch, aufstellen, Chamaron klettert hinein und spricht | ok | offen | – | offen |
| Hotpot: Erbsenschale mit Sprechblase, drei Stimmen, Kochtopf als eigene Station, Festessen | ok | offen | – | offen |
| Durch Zoo, Ufer und Bach in den Wald, Bean kennenlernen | ok | offen | – | offen |
| Freundebuch mit zwölf Figuren, Neuladen im Wald | ok | offen | – | offen |
| Keine Fehler in der Konsole | ok | offen | ok (Start) | offen |

## Kapitel Zoo (Version 0.6.0)

Automatisch geprüft am 09.11.2026:

- **Unit-Tests:** 108 bestanden, davon 9 neu (`tests/zoo.test.ts`): Weg hin und zurück, Meerkat nur an Land, Squichy im
  Becken, beide vorher „beschäftigt“, Meerkats Wimpel (Treibholz vom Ufer, Federn aus dem Zoo) mit Geschenk, Moment und
  Rezept genau einmal, Stein zeigt danach den Wimpel, Sonnenblumentopf, Squichys Ball mit Schilf aus der Bucht.
- **Typprüfung:** fehlerfrei.
- **Cloud:** „Prüfen“, „iPhone-Build (.ipa)“ (b7), „Android-Testbuild (.apk)“ (a7) und „iPhone-Simulator-Test“ grün.
  Simulator (iPhone 16 Pro): App startet, nativer Speicher liest beide Plätze, 4 Lebenszyklus-Listener, läuft nach 35 s noch.

| Test | Browser (`npm run e2e`, 86 Prüfungen, zweimal bestanden) | Android (dein Handy) | iPhone-Simulator (Cloud) | iPhone 16 Pro (ihr Gerät) |
|---|---|---|---|---|
| Alles aus 0.5.0 wie bisher | ok | offen | – | offen |
| Weg unten am Startufer in den Zoo, Hinweis auf den Zoo | ok | offen | – | offen |
| Meerkat: „Klar!“, Federn sammeln, Wimpel an der Zoo-Werkbank, abgeben | ok | offen | – | offen |
| Wimpel steht danach auf dem Aussichtsstein (auch nach Neuladen) | ok | offen | – | offen |
| Squichy: Sprechblase, Aufgabe annehmen | ok | offen | – | offen |
| Squichys Ball bis zum Ende (Schilf aus der Bucht) | – (Unit-Test ok) | offen | – | offen |
| Unterste Reihe am Startufer (Wegweiser zum Zoo) antippbar | ok | offen | – | offen |
| Keine Fehler in der Konsole | ok | offen | ok (Start) | offen |

## Kapitel Tiramisu Stream (Version 0.5.0, Commit 04528b6)

Automatisch geprüft am 09.11.2026:

- **Unit-Tests:** 99 bestanden, davon 9 neu (`tests/tiramisu.test.ts`): Weg hin und zurück, Rosie und Bubbles nur im
  Wasser, Lumi erst nach Schnabbis zweitem Erlebnis, Picknick-Ablauf mit Hinsetzen und Selbst-Ansprechen, Moment,
  Rezept und Freischaltung genau einmal, als Lumi kein zweiter Lumi-Körper, Rosies Kissen abgeben (genau einmal,
  Geschenk zwei Glitzerkiesel), Kissen schon als Deko aufgestellt → Rosie erinnert ans Einpacken.
- **Typprüfung:** fehlerfrei.
- **Cloud:** „Prüfen“, „iPhone-Build (.ipa)“ (b6, 934 KB), „Android-Testbuild (.apk)“ (a6) und „iPhone-Simulator-Test“ grün.
  Simulator (iPhone 16 Pro): App startet, nativer Speicher liest beide Plätze, 4 Lebenszyklus-Listener, läuft nach 35 s noch.

| Test | Browser (`npm run e2e`, 77 Prüfungen, zweimal bestanden) | Android (dein Handy) | iPhone-Simulator (Cloud) | iPhone 16 Pro (ihr Gerät) |
|---|---|---|---|---|
| Alles aus 0.4.0 wie bisher | ok | offen | – | offen |
| Weg links neben dem Bau zum Tiramisu Stream | ok | offen | – | offen |
| Lumi mit Sprechblase, „Na klar!“, Blüten und Kiesel sammeln | ok | offen | – | offen |
| Bastelstumpf als eigene Station, Girlande aufhängen | ok | offen | – | offen |
| Lumi setzt sich dazu und spricht von selbst, Abschlusskarte, Lumi spielbar | ok | offen | – | offen |
| Bubbles macht Blasen | ok | offen | – | offen |
| Rosie: Seerosenblätter schwimmend sammeln, Kissen basteln und abgeben | ok | offen | – | offen |
| Freundebuch mit fünf Figuren, als Lumi spielen, Neuladen am Bach | ok | offen | – | offen |
| Oberste Kartenreihe antippbar (Kamera reicht über den Rand) | – (nicht automatisiert) | offen | – | offen |
| Keine Fehler in der Konsole | ok | offen | ok (Start) | offen |

## Grundbau Missionen und Crafting (Version 0.4.0, Commit d5576f2)

Automatisch geprüft am 08.11.2026:

- **Unit-Tests:** 90 bestanden (`npm test`), davon 21 neu (`tests/grundbau.test.ts`): Aufgabenbuch und verfolgte
  Aufgabe, Sprechblase folgt dem Spielverlauf, Antworten „später“/„weiter“ und Android-Zurück, Abgeben ganz oder gar
  nicht plus Geschenk genau einmal (Datenbeispiel), Prüfung verlangt passende Bedingung, Nachwachsen nach 10 Minuten
  (auch bei zurückgestellter Uhr), freies Bauen, Einpacken (auch doppelt getippt), Stationen, Migration 0.3.0 → 0.4.0.
- **Typprüfung:** fehlerfrei.
- **Cloud:** „Prüfen“, „iPhone-Build (.ipa)“ (b5, 929 KB), „Android-Testbuild (.apk)“ (a5) und „iPhone-Simulator-Test“ grün.
  Simulator (iPhone 16 Pro): App startet, nativer Speicher liest beide Plätze, 4 Lebenszyklus-Listener, läuft nach 35 s noch.
  Bekannt: Zu Spielbeginn sitzt die Sprechblase über Schnabbi (Stegende) am oberen Rand unter der Statusleiste; sobald
  sie Richtung Steg läuft, ist sie gut sichtbar.

| Test | Browser (`npm run e2e`, 98 Prüfungen) | Android (dein Handy) | iPhone-Simulator (Cloud) | iPhone 16 Pro (ihr Gerät) |
|---|---|---|---|---|
| Phase 1 und 2 wie bisher (alle früheren Prüfungen) | ok | offen | – | offen |
| Hinweis zum Einstieg, Sprechblase über Schnabbi | ok | offen | – | offen |
| „Lieber später“ beendet ohne Folgen, danach „Gern“ | ok | offen | – | offen |
| Hinweis antippen öffnet das Aufgabenbuch (offen/erledigt) | ok | offen | – | offen |
| Schnabbis neue Ideen: zwei Rezepte, Sprechblase verschwindet | ok | offen | – | offen |
| Treibholz wächst nach (Uhr im Test vorgestellt) | ok | offen (10 Minuten warten) | – | offen |
| Treibholzbank bauen, auf der untersten Reihe aufstellen | ok | offen | – | offen |
| Deko einpacken, Neuladen: Beutel, Deko, Rezepte stimmen | ok | offen | – | offen |
| Ansicht im Dekoriermodus mit dem Finger verschieben | – (nicht automatisiert) | offen | – | offen |
| Keine Fehler in der Konsole | ok | offen | ok (Start) | offen |
| Update 0.2.0/0.3.0 → 0.4.0 behält den Spielstand | – (Unit-Tests ok) | offen | – | offen |

## Phase 2 – Vertrauen und Figurenwechsel (Version 0.3.0, Commit 1779b5f)

Automatisch geprüft am 08.11.2026:

- **Unit-Tests:** 69 bestanden (`npm test`), davon 29 neu für Phase 2: Ortswechsel nur vom Ausgang, sichere Ankunft
  (auch bei belegtem Ankunftspunkt), Deko versperrt weder Ausgang noch Ankunftspunkt, Schilf erst nach Questbeginn,
  Moment und Freischaltung genau einmal, Figurenwechsel gesperrt/erlaubt, jeder Körper höchstens einmal in der Welt,
  Landfigur landet beim Wechsel im Wasser sicher an Land, Ruheplatz weicht alter Deko aus, Spielstand aus 0.2.0
  (Schema 1) wird vollständig übernommen, **Erbsentrio als Datenbeispiel** (eine Schale, Wechsel zwischen Erbsen ohne
  Platzwechsel, Laden vervielfältigt nichts, Prüfung verbietet zweite Begegnung desselben Körpers).
- **Typprüfung:** fehlerfrei (`npm run check`).
- **Cloud:** „Prüfen“, „iPhone-Build (.ipa)“ (b4, 925 KB), „Android-Testbuild (.apk)“ (a4) und „iPhone-Simulator-Test“ grün.
  Simulator (iPhone 16 Pro): App startet, Startbild, nativer Speicher liest beide Plätze, 4 Lebenszyklus-Listener, läuft nach 35 s noch.

| Test | Browser (`npm run e2e`, Chromium, 402 × 874, Touch) | Android (dein Handy) | iPhone-Simulator (Cloud) | iPhone 16 Pro (ihr Gerät) |
|---|---|---|---|---|
| Phase 1 unverändert spielbar (alle Prüfungen aus 1b) | ok | offen | – | offen |
| Hinweis „Schnabbi hat eine Idee“, erneutes Gespräch gibt keine zweite Belohnung | ok | offen | – | offen |
| Schnabbi geht sichtbar zum Weg und verschwindet vom Startufer | ok | offen | – | offen |
| Wegweiser antippen: Überblendung, Ankunft in der Schilfbucht am Ankunftspunkt | ok | offen | – | offen |
| Neuladen in der Schilfbucht: wieder dort | ok | offen | – | offen |
| Schilf sammeln (einer schwimmend), Schnabbi geht vor zum Ufer | ok | offen | – | offen |
| Zurück zum Startufer über den Pfad | ok | offen | – | offen |
| Matte flechten, hinlegen; Schnabbi läuft hin und spricht von selbst | ok | offen | – | offen |
| Abschlusskarte mit Freischaltung, zwei Momente, keiner doppelt | ok | offen | – | offen |
| Freundebuch: als Schnabbi spielen, Otter ruht vor dem Bau, kein zweiter Schnabbi | ok | offen | – | offen |
| Neuladen als Schnabbi: weiterhin Schnabbi | ok | offen | – | offen |
| Tipp auf den ruhenden Otter öffnet das Freundebuch, zurück zum Otter | ok | offen | – | offen |
| Keine Fehler in der Konsole | ok | offen | ok (Start) | offen |
| Update von 0.2.0 auf 0.3.0 behält den Spielstand | – (Unit-Test ok) | offen (a2 → a4 drüberinstallieren) | – | offen |

**Auf deinem Android besonders prüfen:** 0.3.0 über die alte 0.2.0 installieren (nicht vorher löschen) – der erste
Abend muss erhalten bleiben. Danach Android-Zurück im Freundebuch, App wegwischen in der Schilfbucht und als Schnabbi.

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
