# Grafik-Slots

Lesbare Fassung von `src/assets/catalog.ts` (dort gilt im Zweifel). Maße in Pixeln, Anker = Bodenpunkt ab links oben.
Raster: 16-px-Kacheln, Weltfiguren etwa 32 px hoch in 48 px hohen Frames, Darstellung mit ganzzahligem Zoom (meist 2×).

Status: **P** = Platzhalter im Code · **E** = Codex-Entwurf eingebaut · **F** = final

## Figuren (Richtungen se und ne; sw/nw spiegelt das Spiel)

| Schlüssel | Frame | Anker | Frames · fps | Status | Hinweis |
|---|---|---|---|---|---|
| characters.otter.idle.se / .ne | 48 × 48 | 24, 40 | 2 · 2 | P | steht, atmet |
| characters.otter.walk.se / .ne | 48 × 48 | 24, 40 | 4 · 8 | P | läuft, kleine Pfotenbewegung |
| characters.otter.swim.se / .ne | 48 × 48 | 24, 40 | 4 · 5 | P | Anker = Wasserlinie, nur Kopf und Schultern sichtbar |
| characters.schnabbi.idle.se | 88 × 48 | 44, 40 | 1 | **E** | Paket 01 (Entwurf); Größe noch abstimmen, siehe AGENTS.md |
| characters.schnabbi.idle.ne | 88 × 48 | 44, 40 | 2 · 2 | P | |
| characters.schnabbi.walk.se / .ne | 88 × 48 | 44, 40 | 4 · 6 | P | tapst |
| characters.schnabbi.swim.se / .ne | 88 × 48 | 44, 40 | 2 · 3 | P | paddelt, Anker = Wasserlinie |
| characters.schnabbi.sit.se / .ne | 88 × 48 | 44, 40 | 2 · 2 | P | sitzt neben der Leuchte |
| characters.otterprinzessin.idle/.walk/.swim (se, ne) | 48 × 48 | 24, 40 | 2·2 / 4·8 / 4·5 | P | Lumi: Otter mit Kleid und Krone; Krone bleibt beim Schwimmen über Wasser |
| characters.rosie.idle/.swim (se, ne) | 48 × 48 | 24, 40 | 2·2 / 4·4 | P | pinker Axolotl, lebt nur im Wasser (Anker = Wasserlinie), Kiemenbüschel wippen |
| characters.bubbles.idle/.swim (se, ne) | 48 × 48 | 24, 40 | 2·2 / 4·4 | P | blauer Axolotl; die Blasen erzeugt das Spiel selbst (fx.blase) |
| characters.meerkat.idle/.walk (se, ne) | 48 × 48 | 24, 40 | 2·2 / 4·10 | P | Meerkat: Erdmännchen, steht aufrecht Wache, flitzt auf allen vieren; nur an Land |
| characters.squichy.idle/.walk/.swim (se, ne) | 48 × 48 | 24, 40 | 2·2 / 4·6 / 4·5 | P | Squichy: Mini-Robbe, große Augen; Codex-Entwurf vorhanden, Maße bitte hierauf abstimmen |
| characters.chamaron.idle/.walk (se, ne) | 48 × 48 | 24, 40 | 2·1 / 4·5 | P | Chamaron (Chamäleon): bitte in hellen, neutralen Farben – das Spiel tönt ihn (getarnt grün, später Farbwechsel) |
| characters.erbsenschale.idle/.walk (se, ne) | 48 × 48 | 24, 40 | 2·2 / 4·6 | P | Schale mit Beano (links, fröhlich), Beani (Mitte, verträumt), Beanz (rechts, neugierig) – ein Körper |
| characters.bean.idle/.walk (se, ne) | 48 × 48 | 24, 40 | 2·2 / 4·7 | P | Bean (Rentier) mit Geweih |

Solange von einer Figur nur einzelne Zustände geliefert sind, nutzt das Spiel für die fehlenden Zustände das gelieferte
Bild (kein Mix aus Bild und Testform).

## Umgebung

| Schlüssel | Frame | Anker | Status | Hinweis |
|---|---|---|---|---|
| objects.bau | 48 × 40 | 24, 39 | P | Bau unter Wurzeln, karierte Gardine; Grundfläche 3 × 2 Kacheln |
| objects.werkbank | 32 × 24 | 16, 23 | P | Grundfläche 2 × 1 Kacheln |
| objects.wegweiser | 16 × 32 | 8, 31 | P | Holzpfosten mit Schild, Spitze nach rechts (das Spiel spiegelt für links); Grundfläche 1 Kachel; steht an jedem Ausgang |
| objects.picknickdecke | 48 × 32 | 24, 31 | P | Tiramisu Stream: karierte Picknickdecke mit Körbchen, Grundfläche 3 × 2 Kacheln |
| objects.bastelstumpf | 16 × 24 | 8, 23 | P | Tiramisu Stream: Baumstumpf mit Garn und Schere, Bastel-Station, 1 Kachel |
| objects.aussichtsstein / .wimpel | 32 × 24 | 16, 23 | P | Zoo: Meerkats Aussichtsstein; zweite Fassung mit Federwimpel obendrauf (nach der Aufgabe) |
| objects.theke | 80 × 32 | 40, 31 | P | Cat Café und Hotpot-Restaurant: Theke, Grundfläche 5 × 1 |
| objects.basteltisch | 32 × 24 | 16, 23 | P | Cat Café: Basteltisch (Station wie die Werkbank), 2 × 1 |
| objects.cafetisch | 32 × 24 | 16, 23 | P | Cat Café: kleiner runder Tisch mit Tasse, 2 × 1 |
| objects.katze.grau / .rot | 16 × 16 | 8, 14 | P | Cat Café: schlafende Katze (2 Frames, atmet), nur Kulisse |
| objects.zimmerpflanze | 16 × 32 | 8, 31 | P | Cat Café: große Zimmerpflanze, 1 Kachel |
| objects.kochtopf | 32 × 40 | 16, 39 | P | Hotpot-Restaurant: Kochtopf auf dem Herd, dampft (2 Frames), Station „Kochtopf“, 2 × 2 |
| objects.hotpottisch | 32 × 40 | 16, 39 | P | Hotpot-Restaurant: runder Tisch mit kleinem Topf, 2 × 2 |
| objects.laterne | 16 × 32 | 8, 31 | P | Hotpot-Restaurant: rote Papierlaterne, 1 Kachel |
| objects.fuchsbau | 48 × 40 | 24, 39 | P | Fuchsbau: Erdhügel mit Eingang unter Wurzeln, 3 × 2 |
| tiles.ufer | 16 × 16 je Kachel | – | P | Gras, Blumenwiese, Sand, Wasser (2 Frames), Uferkanten, Steg (längs) und Brücke (quer), Pfad, Holzzaun, Holzboden und Wand (Innenräume), Schilf im Wasser (2 Frames), Büsche – **Kachelbogen-Layout mit Claude abstimmen** |

## Gegenstände und Deko

| Schlüssel | Frame | Anker | Frames · fps | Status | Hinweis |
|---|---|---|---|---|---|
| items.treibholz | 16 × 16 | 8, 13 | 1 | P | am Strand |
| items.treibholz.treibend | 16 × 16 | 8, 12 | 2 · 2 | P | treibt im Wasser, sanftes Wippen |
| items.muschelschale | 16 × 16 | 8, 13 | 1 | P | natürliche Muschel, ohne Aufhängung |
| deco.uferleuchte.aus | 16 × 32 | 8, 30 | 1 | P | Treibholzpfosten mit Muschel |
| deco.uferleuchte.an | 16 × 32 | 8, 30 | 3 · 4 | P | eingeschaltet, sanftes Flackern |
| items.schilfhalm | 16 × 16 | 8, 13 | 1 | P | Phase 2: Bündel heller Schilfhalme (liegt am Ufer oder treibt am Schilf); muss sich vom stehenden Schilf im Boden abheben |
| deco.schilfmatte | 16 × 16 | 8, 12 | 1 | P | Phase 2: geflochtene Matte, flach auf dem Boden, 1 Kachel |
| deco.treibholzbank | 16 × 24 | 8, 21 | 1 | P | freies Bauen: kleine Bank aus Treibholz, 1 Kachel breit |
| deco.muschelwindspiel | 16 × 32 | 8, 30 | 3 · 2 | P | freies Bauen: Windspiel aus Muscheln am Treibholzpfosten, Muscheln schaukeln |
| items.wiesenbluete | 16 × 16 | 8, 13 | 1 | P | kleiner bunter Blütenstrauß (Fundstelle) |
| items.glitzerkiesel | 16 × 16 | 8, 13 | 1 | P | runder funkelnder Kiesel (Fundstelle) |
| items.seerosenblatt | 16 × 16 | 8, 12 | 2 · 1 | P | schwimmendes Seerosenblatt (Fundstelle im Teich) |
| deco.bluetengirlande | 16 × 32 | 8, 30 | 1 | P | Blütengirlande zwischen zwei Stäbchen |
| deco.seerosenkissen | 16 × 16 | 8, 13 | 1 | P | rundes Kissen aus Seerosenblättern |
| deco.kiesellicht.aus / .an | 16 × 16 | 8, 13 | 1 / 2 · 3 | P | Muschel mit Glitzerkieseln, an: leuchtet sanft |
| items.feder | 16 × 16 | 8, 13 | 1 | P | bunte Feder im Gras (Fundstelle) |
| items.sonnenblume | 16 × 32 | 8, 30 | 1 | P | Sonnenblume, gibt Kerne (Fundstelle) |
| deco.federwimpel | 16 × 32 | 8, 30 | 2 · 2 | P | Wimpel mit Federn am Treibholzstab, flattert |
| deco.schilfball | 16 × 16 | 8, 13 | 1 | P | geflochtener Ball aus Schilf |
| deco.sonnenblumentopf | 16 × 32 | 8, 30 | 1 | P | kleine Sonnenblume in einer Muschel |
| items.teepflanze | 16 × 24 | 8, 22 | 1 | P | Teepflanze im Topf (Fundstelle Teeblätter) |
| items.wollfaden | 16 × 16 | 8, 13 | 1 | P | bunter Wollfaden (Fundstelle) |
| items.mehlsack | 16 × 16 | 8, 14 | 1 | P | Mehlsäckchen (Fundstelle) |
| items.gemuesekiste | 16 × 16 | 8, 14 | 1 | P | Kiste mit Möhrchen (Fundstelle) |
| items.kraeutertopf | 16 × 16 | 8, 14 | 1 | P | Kräutertopf (Fundstelle) |
| items.tannenzapfen | 16 × 16 | 8, 13 | 1 | P | Tannenzapfen (Fundstelle) |
| items.beerenstrauch | 16 × 24 | 8, 22 | 1 | P | Strauch mit Waldbeeren (Fundstelle) |
| items.moos | 16 × 16 | 8, 13 | 1 | P | Moospolster (Fundstelle) |
| deco.kletterpflanze | 16 × 32 | 8, 30 | 1 | P | Rankpflanze am Stab, mit Wollfaden |
| deco.wollkissen | 16 × 16 | 8, 13 | 1 | P | buntes Wollkissen |
| deco.teigtaschen | 16 × 16 | 8, 13 | 2 · 2 | P | Teller mit dampfenden Teigtaschen |
| deco.kraeutersuppe | 16 × 16 | 8, 13 | 2 · 2 | P | Kräutersuppe in einer Muschelschale, dampft |
| deco.zapfenkranz | 16 × 32 | 8, 30 | 1 | P | Kranz aus Tannenzapfen mit Beere auf einem Ständer |
| deco.beerenlicht.aus / .an | 16 × 24 | 8, 22 | 1 / 2 · 3 | P | Glas mit Waldbeeren und Glitzerkiesel; an: leuchtet |
| deco.mooskissen | 16 × 16 | 8, 13 | 1 | P | Kissen aus Moos mit Feder |

## Effekte

| Schlüssel | Frame | Anker | Frames · fps | Status |
|---|---|---|---|---|
| fx.leuchtschein | 64 × 64 | 32, 32 | 1 | P (additiv gezeichnet) |
| fx.glitzer | 8 × 8 | 4, 4 | 4 · 8 | P |
| fx.ziel | 16 × 8 | 8, 4 | 1 | P |
| fx.spritzer | 16 × 8 | 8, 6 | 3 · 10 | P |
| fx.hinweis | 12 × 12 | 6, 11 | 1 | P (kleine Sprechblase über einer Figur, die etwas Neues hat; keine Schrift, kein Ausrufezeichen-Emoji) |
| fx.blase | 6 × 6 | 3, 3 | 1 | P (Luftblase, steigt auf – Bubbles' Eigenheit) |

## Porträts (Dialog, angezeigt mit 64 CSS-Pixeln)

| Schlüssel | Frame | Status | Hinweis |
|---|---|---|---|
| portraits.schnabbi | 64 × 64 | P | neutral; nach Foto |
| portraits.otter | 64 × 64 | P | neutral |
| portraits.otterprinzessin | 64 × 64 | P | Lumi mit Krone |
| portraits.rosie | 64 × 64 | P | pinker Axolotl |
| portraits.bubbles | 64 × 64 | P | blauer Axolotl mit Blase |
| portraits.meerkat | 64 × 64 | P | Erdmännchen |
| portraits.squichy | 64 × 64 | P | Mini-Robbe |
| portraits.chamaron | 64 × 64 | P | Chamäleon |
| portraits.beano / .beani / .beanz | 64 × 64 | P | je eine Erbse: fröhlich, verträumt, neugierig |
| portraits.bean | 64 × 64 | P | Rentier |

## Ton (Platzhalter: synthetisch erzeugt, `src/app/sound.ts`)

`sfx.tipp`, `sfx.dialog`, `sfx.aufheben`, `sfx.platsch`, `sfx.bauen`, `sfx.aufstellen`, `sfx.leuchte`, `sfx.nein`;
Ambiente-Slots `ambience.startufer.abend` und `ambience.schilfbucht.abend` (noch stumm).

## Nächste sinnvolle Pakete

1. **Starter-Otter**: idle, walk, swim in se und ne (größter sichtbarer Gewinn, kein Foto nötig).
2. **Schnabbi** komplett (Größe abgestimmt) inkl. Porträt – seit Phase 2 ist er auch spielbar, also braucht er
   laufen und schwimmen in beiden Richtungen genauso wie der Otter.
3. **Startufer**: Kachelbogen (inkl. Pfad und Schilf), Bau, Werkbank, Steg, Wegweiser.
4. **Dinge**: Treibholz (2), Muschelschale, Uferleuchte aus/an, Schilfhalme, Schilfmatte.
5. **Tiramisu Stream** (neu, Version 0.5.0): Lumi (Otter mit Kleid und Krone), Rosie und Bubbles (Axolotl, rosa und
   blau, nur im Wasser), Porträts der drei, Picknickdecke, Bastelstumpf, Blumenwiese, Querbrücke, Wiesenblüten,
   Glitzerkiesel, Seerosenblätter, Blütengirlande, Seerosenkissen, Kiesellicht aus/an. Gleicher Stil wie das Startufer.
6. **Zoo** (neu, Version 0.6.0): Meerkat (Erdmännchen), Squichy (Mini-Robbe – Codex-Entwurf vorhanden), Porträts,
   Aussichtsstein mit und ohne Wimpel, Holzzaun, Feder, Sonnenblume, Federwimpel, Schilfball, Sonnenblumentopf.
7. **Cat Café, Hotpot-Restaurant, Fuchsbau** (neu, Version 0.7.0): Chamaron, Erbsenschale mit Beano/Beani/Beanz,
   Bean, fünf Porträts, Innenraum-Boden und Wände, Möbel (Theke, Tische, Kochtopf, Laterne), zwei schlafende Katzen,
   Fuchsbau-Hügel, alle neuen Fundstellen und Deko (siehe Tabellen oben).
