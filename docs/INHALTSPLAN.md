# Inhaltsplan

Feste IDs für Figuren und Orte. Namen und Bilder dürfen sich ändern, die IDs nicht.
Persönliche Bezüge, Geschichten und weitere Details liefert der Nutzer – hier steht nur, was feststeht.

## Figuren

| Figuren-ID | Name | Körper-ID (geplant) | Stand | Feste Eigenschaften |
|---|---|---|---|---|
| otter | (Name der Spielerin) | body.otter | im Spiel | Erste steuerbare Figur; heißt so, wie sie sich im ersten Gespräch nennt. Ruht vor dem Bau, während sie jemand anderen spielt |
| schnabbi | Schnabbi | body.schnabbi | im Spiel, **spielbar ab Phase 2** | Erster Freund und Helfer; Schnabeltier-Kuscheltier, Aussehen nach Foto |
| rosie | Rosie | body.rosie | geplant | Pinker Axolotl, Schwester von Bubbles |
| bubbles | Bubbles | body.bubbles | geplant | Blauer Axolotl, Bruder von Rosie, macht immer wieder Blasen |
| chamaron | Chamaron | body.chamaron | geplant | Chamäleon (Schreibweise beibehalten) |
| meerkat | Meerkat | body.meerkat | geplant | Erdmännchen, „Meerkat“ ist der Name |
| bean | Bean | body.bean | geplant | Rentier, unabhängig vom Erbsentrio |
| beano, beani, beanz | Beano, Beani, Beanz | **body.erbsenschale** (gemeinsam, 3 Sitze) | geplant | Drei eigene Figuren, eigene Stimmen, ein gemeinsamer Körper |
| squichy | Squichy | body.squichy | geplant (Codex-Entwurf vorhanden) | Mini-Robbe, Schreibweise „Squichy“ |
| otterprinzessin | (vielleicht „Lumi“) | body.otterprinzessin | geplant | Kleid und Krone; Begegnung nach Schnabbi |

**Erbsentrio, geprüft an einem Datenbeispiel** (`tests/phase2.test.ts`, nur Testinhalt): In der Welt steht genau eine
Schale mit allen drei Erbsen. Spielt sie eine Erbse, gehört die Schale ihr und steht nirgends zusätzlich. Ein Wechsel
zwischen den Erbsen behält Körper und Platz, nur wer spricht, ändert sich. Speichern und Laden vervielfältigt die Schale nicht.

## Orte

| Map-ID | Name | Stand |
|---|---|---|
| map.startufer | Startufer | im Spiel (vorläufiger Einstieg), Weg zur Schilfbucht am Wegweiser rechts |
| map.schilfbucht | Schilfbucht | im Spiel – **Vorschlag** für Phase 2: kleine Testkarte für Ortswechsel mit Hin- und Rückweg, kein persönlicher Ort, frei ersetzbar |
| map.hotpot-restaurant | Hotpot-Restaurant | wartet auf deine Angaben |
| map.tiramisu-stream | Tiramisu Stream | wartet auf deine Angaben (Eigenname, Gestaltung offen) |
| map.zoo | Zoo | wartet auf deine Angaben |
| map.cat-cafe | Cat Café | wartet auf deine Angaben |
| map.fuchsbau | Fuchsbau | wartet auf deine Angaben |

## Erlebnisse (Quests) und Momente

| Quest-ID | Name | Moment | Folge |
|---|---|---|---|
| quest.schnabbi.licht | Ein Licht am Steg (Phase 1, Vorschlag aus dem Masterprompt) | moment.schnabbi.erster-abend | – |
| quest.schnabbi.schilf | Ein Platz für zwei (Phase 2, **Vorschlag**) | moment.schnabbi.platz-fuer-zwei | Schnabbi ist im Freundebuch spielbar |

Nach „Ein Platz für zwei“ zeigt Schnabbi zwei Rezepte zum freien Bauen (**Vorschlag**): Treibholzbank (3 Treibholz) und
Muschelwindspiel (1 Treibholz, 2 Muschelschalen). Treibholz, Muscheln und Schilf wachsen nach 10 Minuten nach
(Startufer und Schilfbucht). Wie Missionen, Freunde und Rezepte als Daten aufgebaut werden: `docs/MISSIONEN.md`.

Ablauf „Ein Platz für zwei“: Schnabbi möchte eine Matte zum Sitzen und geht voraus in die Schilfbucht; dort drei
Schilfhalme sammeln (einer im Wasser), zurück an der Werkbank die Matte flechten, irgendwo hinlegen, Schnabbi setzt sich
dazu und sagt, dass er ihr vertraut. Alle Texte sind Entwürfe in `src/content/dialogues.ts` und `src/content/quests.ts`.
