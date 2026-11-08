# Baukasten für Missionen, Freunde und Crafting

Alles Spielinhaltliche ist reine Daten in `src/content/`. Eine neue Mission, ein neuer Freund oder ein neues Rezept
braucht keinen neuen Spielcode – nur Einträge nach den Mustern unten. Die Inhaltsprüfung (`validateContent`, läuft in
den Tests und beim Start im Entwicklungsmodus) meldet fehlende Verweise, unerreichbare Orte und Sackgassen.

## Was ich von dir pro Freund oder Mission brauche (Steckbrief)

Kopieren, ausfüllen, mir schicken. Alles Ungefüllte schlage ich vor und markiere es als Vorschlag.

```
Freund: (Name, Tier, Schreibweise)
Wie sie sich kennenlernen: (Ort, Situation – nur was wirklich so sein soll)
Eigenheit in der Welt: (z. B. macht Blasen, winkt besonders, ist langsam, kann nicht schwimmen)
Wie er/sie spricht: (ein, zwei Beispielsätze oder Stichworte)
Mission(en):
  - Worum bittet er/sie? (bringen, bauen, irgendwohin gehen, etwas aufstellen, jemanden besuchen)
  - Was braucht man dafür? (Gegenstände, Rezept, Ort)
  - Was passiert am Ende? (Geschenk, gemeinsamer Moment, neues Rezept, wird spielbar)
Persönlicher Bezug: (nur wenn es eine echte gemeinsame Erinnerung gibt – ich erfinde keine)
Foto: (falls vorhanden, für Codex)
```

## Bausteine

### Aufgaben (Quests) – `quests.ts`

| Feld | Bedeutung |
|---|---|
| `giver` | Wer die Aufgabe gibt (steht im Aufgabenbuch) |
| `offer` | Hinweis oben, solange die Aufgabe noch nicht begonnen hat, z. B. „Schnabbi hat eine Idee“ |
| `steps` | Schritte nacheinander; jeder mit Hinweis (`{count:item.x}` zeigt den Fortschritt) und Bedingung |
| `ending` | Abschlusskarte (Titel und Text) |

Schritt-Bedingungen (`completeWhen`):

| Bedingung | Beispiel |
|---|---|
| `hasItems` | drei Schilfhalme im Beutel |
| `crafted` | an einer Station ein Rezept gebaut |
| `placed` | ein Deko-Stück aufgestellt |
| `dialogue` | ein bestimmtes Gespräch zu Ende geführt (z. B. „Gegenstand übergeben“) |
| `atMap` | an einem Ort angekommen |

Wirkungen (`onComplete` eines Schritts oder `effects` eines Gesprächs) – jede wird genau einmal vergeben, auch bei
schnellem Tippen, Neuladen oder Unterbrechen:

| Wirkung | Beispiel |
|---|---|
| `startQuest` | Mission beginnt (und steht oben im Hinweis) |
| `learnRecipe` | neues Rezept an der Werkbank |
| `giveItems` | Geschenk eines Freundes |
| `takeItems` | Abgeben (nur in Gesprächen; ganz oder gar nicht, braucht passende `hasItems`-Bedingung) |
| `addMoment` | gemeinsamer Moment im Freundebuch |
| `unlockCharacter` | Figur wird spielbar |
| `setDecoOn` | Deko einschalten (z. B. die Uferleuchte) |

### Gespräche – `dialogues.ts`

- Pro Figur gilt das **erste** Gespräch, dessen `when`-Bedingung passt (Reihenfolge = Vorrang).
- Bedingungen: `questNotStarted`, `questStep`, `questDone`, `hasMoment`, `hasItems`, `hasName`, kombinierbar mit `all`, `any`, `not`.
- `{name}` wird durch ihren Namen ersetzt. `speaker: null` ist Erzähltext. `cue` gibt der Welt ein Signal (z. B. Leuchte geht an).
- **Antworten:** `choices: [{ label: 'Gern!', then: 'weiter' }, { label: 'Lieber später', then: 'spaeter' }]`.
  „später“ beendet das Gespräch ohne Folgen; beim nächsten Ansprechen kommt es wieder.
- **Sprechblase:** Eine Figur zeigt automatisch eine kleine Sprechblase, wenn ihr aktuelles Gespräch etwas Neues bringt
  (noch nicht vergebene Wirkungen) oder den aktuellen Schritt einer Aufgabe abschließt.

### Wo Figuren sind – `encounters.ts`

Pro Körper genau eine Begegnung mit einer Liste von Plätzen; der erste passende gilt (`when`). Ein Platz ist eine feste
Kachel oder „neben einem Deko-Stück“. `talkOnArrival` lässt die Figur nach dem Hinlaufen von selbst sprechen.
Wechselt eine Figur den Ort, läuft sie sichtbar zum passenden Ausgang.

### Freunde – `characters.ts` und `quests.ts` (Momente)

`friend: { about, metWhen }` bringt die Figur ins Freundebuch. Momente (`moments`) erscheinen dort als gemeinsame
Erlebnisse. `unlockCharacter` macht sie spielbar. Mehrere Figuren können einen Körper teilen (Erbsentrio, getestet).

### Sammeln und Bauen – `maps/*.ts` und `items.ts`

- Fundstellen: einmalig oder `regrowMinutes` (wächst nach so vielen Minuten Echtzeit nach; zurzeit 10 als Vorschlag).
  `availableWhen` lässt etwas erst ab einem Punkt der Geschichte wachsen.
- Gegenstände: `material` oder `deco`, mit kurzer `description`. Deko lässt sich aufstellen, versetzen und einpacken.
- Rezepte: Zutaten und Ergebnis, optional `station` (Standard: Werkbank). Eine neue Station ist ein Objekt mit
  `interaction: { kind: 'workbench', station: 'kochtopf', title: 'Kochtopf' }` – z. B. später im Hotpot-Restaurant.

### Orte – `maps/*.ts`

Raster, Legende, sicherer Platz, Objekte, Fundstellen, Ausgänge mit Ankunftspunkten, Deko-Fläche. Die Prüfung verlangt
Hin- und Rückweg und dass Ziele, Ausgänge und Ankunftspunkte zu Fuß erreichbar sind.

## Beispiel: eine Bring-Mission (so würde sie aussehen)

```ts
// quests.ts
'quest.rosie.muscheln': {
  id: 'quest.rosie.muscheln', name: 'Muscheln für Rosie', giver: 'rosie',
  steps: [
    { id: 'sammeln', hint: 'Muschelschalen {count:item.muschelschale}/3', completeWhen: { hasItems: { 'item.muschelschale': 3 } } },
    { id: 'bringen', hint: 'Bring Rosie die Muscheln', completeWhen: { dialogue: 'dlg.rosie.danke' },
      onComplete: [{ addMoment: 'moment.rosie.muscheln' }] },
  ],
  ending: { title: 'Muscheln für Rosie', text: '…' },
},
// dialogues.ts (Reihenfolge: danke vor bitte)
{ id: 'dlg.rosie.danke', character: 'rosie',
  when: { all: [{ questStep: { quest: 'quest.rosie.muscheln', step: 'bringen' } }, { hasItems: { 'item.muschelschale': 3 } }] },
  lines: [/* … */], effects: [{ takeItems: { 'item.muschelschale': 3 } }, { giveItems: { 'item.xyz': 1 } }] },
```

(Nur ein Muster – Rosie und ihre Geschichte kommen erst, wenn du sie lieferst.)
