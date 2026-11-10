// Grafik-Katalog: der Übergabevertrag zwischen Spiel und Grafik (Codex).
// Jeder Schlüssel hat feste Maße, einen Bodenanker und eine Frame-Anzahl. Liegt eine PNG-Datei vor,
// wird sie geladen; sonst zeichnet das Spiel eine schlichte Testform mit genau denselben Maßen.
// Ein PNG-Tausch ändert nur den `file`-Eintrag hier – kein Quest- oder Bewegungscode.
//
// Schlüsselschema für Figuren: characters.<figur>.<zustand>.<richtung>
//   Richtungen: se (vorne rechts) und ne (hinten rechts). sw/nw spiegelt das Spiel automatisch.
// Dateien liegen unter public/art/ und sind horizontale Streifen gleich großer Frames.

export type PainterId =
  | 'otter'
  | 'schnabbi'
  | 'bau'
  | 'werkbank'
  | 'wegweiser'
  | 'schilfhalm'
  | 'schilfmatte'
  | 'bank'
  | 'windspiel'
  | 'hinweis'
  | 'treibholz'
  | 'treibholzTreibend'
  | 'muschel'
  | 'leuchteAus'
  | 'leuchteAn'
  | 'schein'
  | 'glitzer'
  | 'ziel'
  | 'spritzer'
  | 'portrait'
  | 'prinzessin'
  | 'axolotl'
  | 'picknickdecke'
  | 'bastelstumpf'
  | 'wiesenbluete'
  | 'glitzerkiesel'
  | 'seerosenblatt'
  | 'bluetengirlande'
  | 'seerosenkissen'
  | 'kiesellicht'
  | 'blase'
  | 'meerkat'
  | 'squichy'
  | 'aussichtsstein'
  | 'feder'
  | 'sonnenblume'
  | 'federwimpel'
  | 'schilfball'
  | 'sonnenblumentopf'
  | 'chamaron'
  | 'erbsenschale'
  | 'bean'
  | 'theke'
  | 'basteltisch'
  | 'cafetisch'
  | 'katze'
  | 'zimmerpflanze'
  | 'kochtopf'
  | 'hotpottisch'
  | 'laterne'
  | 'fuchsbauhuegel'
  | 'teepflanze'
  | 'wollfaden'
  | 'mehlsack'
  | 'gemuesekiste'
  | 'kraeutertopf'
  | 'tannenzapfen'
  | 'beerenstrauch'
  | 'moos'
  | 'kletterpflanze'
  | 'wollkissen'
  | 'teigtaschen'
  | 'kraeutersuppe'
  | 'zapfenkranz'
  | 'beerenlicht'
  | 'mooskissen'
  | 'teichlaterne';

export interface SpriteDef {
  key: string;
  frameW: number;
  frameH: number;
  frames: number;
  fps?: number;
  /** Bodenanker in Pixeln ab links oben innerhalb eines Frames. */
  anchor: { x: number; y: number };
  /** Gelieferte Datei (relativ zu public/), mit eigener Frame-Anzahl. Fehlt sie, gilt der Platzhalter. */
  file?: { path: string; frames: number; fps?: number; status: 'entwurf' | 'final' };
  placeholder: { painter: PainterId; args?: Record<string, string | number | boolean> };
  /** Beschreibung für die Grafik-Slot-Liste. */
  note: string;
}

const CHAR_DIRS = ['se', 'ne'] as const;

function character(
  name: string,
  painter: PainterId,
  frame: { w: number; h: number; anchorX: number; anchorY: number },
  states: Record<string, { frames: number; fps: number; note: string }>,
  files: Record<string, SpriteDef['file']> = {},
  extraArgs: Record<string, string> = {},
): SpriteDef[] {
  const out: SpriteDef[] = [];
  for (const [state, cfg] of Object.entries(states)) {
    for (const dir of CHAR_DIRS) {
      const key = `characters.${name}.${state}.${dir}`;
      const file = files[`${state}.${dir}`];
      out.push({
        key,
        frameW: frame.w,
        frameH: frame.h,
        frames: cfg.frames,
        fps: cfg.fps,
        anchor: { x: frame.anchorX, y: frame.anchorY },
        ...(file ? { file } : {}),
        placeholder: { painter, args: { ...extraArgs, state, dir } },
        note: `${cfg.note}, Blick ${dir === 'se' ? 'vorne rechts' : 'hinten rechts'}`,
      });
    }
  }
  return out;
}

export const sprites: SpriteDef[] = [
  // ---- Figuren (48 px hoch, Bodenanker y = 40 wie in der Codex-Übergabe) ----
  ...character(
    'otter',
    'otter',
    { w: 48, h: 48, anchorX: 24, anchorY: 40 },
    {
      idle: { frames: 2, fps: 2, note: 'Starter-Otter steht, atmet' },
      walk: { frames: 4, fps: 8, note: 'Starter-Otter läuft' },
      swim: { frames: 4, fps: 5, note: 'Starter-Otter schwimmt (Anker = Wasserlinie)' },
    },
  ),
  ...character(
    'schnabbi',
    'schnabbi',
    { w: 88, h: 48, anchorX: 44, anchorY: 40 },
    {
      idle: { frames: 2, fps: 2, note: 'Schnabbi ruht' },
      walk: { frames: 4, fps: 6, note: 'Schnabbi tapst' },
      swim: { frames: 2, fps: 3, note: 'Schnabbi paddelt (Anker = Wasserlinie)' },
      sit: { frames: 2, fps: 2, note: 'Schnabbi sitzt neben der Leuchte' },
    },
    {
      // Codex Paket 01, Designentwurf: nur zum Testen des Einbaus.
      'idle.se': { path: 'art/characters/schnabbi/idle-se.png', frames: 1, status: 'entwurf' },
    },
  ),
  ...character(
    'otterprinzessin',
    'prinzessin',
    { w: 48, h: 48, anchorX: 24, anchorY: 40 },
    {
      idle: { frames: 2, fps: 2, note: 'Otterprinzessin (Lumi) mit Kleid und Krone, steht' },
      walk: { frames: 4, fps: 8, note: 'Otterprinzessin läuft, Kleid schwingt' },
      swim: { frames: 4, fps: 5, note: 'Otterprinzessin schwimmt, Krone bleibt über Wasser (Anker = Wasserlinie)' },
    },
  ),
  ...character(
    'rosie',
    'axolotl',
    { w: 48, h: 48, anchorX: 24, anchorY: 40 },
    {
      idle: { frames: 2, fps: 2, note: 'Rosie, pinker Axolotl, ruht im Wasser' },
      swim: { frames: 4, fps: 4, note: 'Rosie schwimmt, Kiemenbüschel wippen (Anker = Wasserlinie)' },
    },
    {},
    { farbe: 'rosa' },
  ),
  ...character(
    'bubbles',
    'axolotl',
    { w: 48, h: 48, anchorX: 24, anchorY: 40 },
    {
      idle: { frames: 2, fps: 2, note: 'Bubbles, blauer Axolotl, ruht im Wasser' },
      swim: { frames: 4, fps: 4, note: 'Bubbles schwimmt (die Blasen erzeugt das Spiel extra, fx.blase)' },
    },
    {},
    { farbe: 'blau' },
  ),
  ...character(
    'meerkat',
    'meerkat',
    { w: 48, h: 48, anchorX: 24, anchorY: 40 },
    {
      idle: { frames: 2, fps: 2, note: 'Meerkat steht aufrecht und hält Wache, schaut sich um' },
      walk: { frames: 4, fps: 10, note: 'Meerkat flitzt auf allen vieren' },
    },
  ),
  ...character(
    'squichy',
    'squichy',
    { w: 48, h: 48, anchorX: 24, anchorY: 40 },
    {
      idle: { frames: 2, fps: 2, note: 'Squichy (Mini-Robbe) liegt gemütlich' },
      walk: { frames: 4, fps: 6, note: 'Squichy robbt an Land' },
      swim: { frames: 4, fps: 5, note: 'Squichy schwimmt, Kopf über Wasser (Anker = Wasserlinie)' },
    },
  ),
  ...character(
    'chamaron',
    'chamaron',
    { w: 48, h: 48, anchorX: 24, anchorY: 40 },
    {
      idle: { frames: 2, fps: 1, note: 'Chamaron (Chamäleon) sitzt still, Ringelschwanz, rollende Augen; die Farbe tönt das Spiel' },
      walk: { frames: 4, fps: 5, note: 'Chamaron schreitet langsam und bedächtig' },
    },
  ),
  ...character(
    'erbsenschale',
    'erbsenschale',
    { w: 48, h: 48, anchorX: 24, anchorY: 40 },
    {
      idle: { frames: 2, fps: 2, note: 'Schale mit drei Erbsen (Beano, Beani, Beanz), Sitzplätze links, Mitte, rechts' },
      walk: { frames: 4, fps: 6, note: 'die Schale hüpft vorwärts, alle drei Erbsen wippen mit' },
    },
  ),
  ...character(
    'bean',
    'bean',
    { w: 48, h: 48, anchorX: 24, anchorY: 40 },
    {
      idle: { frames: 2, fps: 2, note: 'Bean (Rentier) steht ruhig, Geweih' },
      walk: { frames: 4, fps: 7, note: 'Bean läuft' },
    },
  ),

  // ---- Umgebung ----
  { key: 'objects.bau', frameW: 48, frameH: 40, frames: 1, anchor: { x: 24, y: 39 }, placeholder: { painter: 'bau' }, note: 'Otterbau unter Wurzeln mit karierter Gardine, Grundfläche 3 × 2 Kacheln' },
  { key: 'objects.werkbank', frameW: 32, frameH: 24, frames: 1, anchor: { x: 16, y: 23 }, placeholder: { painter: 'werkbank' }, note: 'Werkbank, Grundfläche 2 × 1 Kacheln' },
  { key: 'objects.wegweiser', frameW: 16, frameH: 32, frames: 1, anchor: { x: 8, y: 31 }, placeholder: { painter: 'wegweiser' }, note: 'Wegweiser aus Holz, Schild zeigt nach rechts (das Spiel spiegelt für links), Grundfläche 1 Kachel' },
  { key: 'objects.picknickdecke', frameW: 48, frameH: 32, frames: 1, anchor: { x: 24, y: 31 }, placeholder: { painter: 'picknickdecke' }, note: 'Karierte Picknickdecke mit Körbchen (Tiramisu Stream), Grundfläche 3 × 2 Kacheln' },
  { key: 'objects.bastelstumpf', frameW: 16, frameH: 24, frames: 1, anchor: { x: 8, y: 23 }, placeholder: { painter: 'bastelstumpf' }, note: 'Baumstumpf mit Garn und Schere zum Basteln (Station wie die Werkbank), Grundfläche 1 Kachel' },
  { key: 'objects.aussichtsstein', frameW: 32, frameH: 24, frames: 1, anchor: { x: 16, y: 23 }, placeholder: { painter: 'aussichtsstein', args: { wimpel: false } }, note: 'Zoo: flacher Aussichtsstein in Meerkats Gehege, Grundfläche 2 × 1 Kacheln' },
  { key: 'objects.aussichtsstein.wimpel', frameW: 32, frameH: 24, frames: 1, anchor: { x: 16, y: 23 }, placeholder: { painter: 'aussichtsstein', args: { wimpel: true } }, note: 'Zoo: derselbe Stein mit dem Federwimpel obendrauf (nach „Ein Wimpel für Meerkat“)' },
  { key: 'objects.aussichtsstein.blume', frameW: 32, frameH: 24, frames: 1, anchor: { x: 16, y: 23 }, placeholder: { painter: 'aussichtsstein', args: { wimpel: true, blume: true } }, note: 'Zoo: Stein mit Wimpel und Sonnenblume daneben (nach „Eine Sonnenblume für Meerkat“)' },
  { key: 'objects.theke', frameW: 80, frameH: 32, frames: 1, anchor: { x: 40, y: 31 }, placeholder: { painter: 'theke' }, note: 'Theke (Cat Café und Hotpot-Restaurant), Grundfläche 5 × 1 Kacheln' },
  { key: 'objects.basteltisch', frameW: 32, frameH: 24, frames: 1, anchor: { x: 16, y: 23 }, placeholder: { painter: 'basteltisch' }, note: 'Cat Café: Basteltisch mit Wolle und Schere, Grundfläche 2 × 1' },
  { key: 'objects.cafetisch', frameW: 32, frameH: 24, frames: 1, anchor: { x: 16, y: 23 }, placeholder: { painter: 'cafetisch' }, note: 'Cat Café: kleiner runder Tisch mit Teetasse, Grundfläche 2 × 1' },
  { key: 'objects.katze.grau', frameW: 16, frameH: 16, frames: 2, fps: 1, anchor: { x: 8, y: 14 }, placeholder: { painter: 'katze', args: { farbe: 'grau' } }, note: 'Cat Café: schlafende graue Katze (atmet), 1 Kachel – Kulisse, keine Figur' },
  { key: 'objects.katze.rot', frameW: 16, frameH: 16, frames: 2, fps: 1, anchor: { x: 8, y: 14 }, placeholder: { painter: 'katze', args: { farbe: 'rot' } }, note: 'Cat Café: schlafende rote Katze (atmet), 1 Kachel – Kulisse, keine Figur' },
  { key: 'objects.zimmerpflanze', frameW: 16, frameH: 32, frames: 1, anchor: { x: 8, y: 31 }, placeholder: { painter: 'zimmerpflanze' }, note: 'Cat Café: große Zimmerpflanze im Topf, 1 Kachel' },
  { key: 'objects.kochtopf', frameW: 32, frameH: 40, frames: 2, fps: 2, anchor: { x: 16, y: 39 }, placeholder: { painter: 'kochtopf' }, note: 'Hotpot-Restaurant: großer Kochtopf auf dem Herd, dampft (Station „Kochtopf“), Grundfläche 2 × 2' },
  { key: 'objects.hotpottisch', frameW: 32, frameH: 40, frames: 1, anchor: { x: 16, y: 39 }, placeholder: { painter: 'hotpottisch' }, note: 'Hotpot-Restaurant: runder Tisch mit kleinem Topf, Grundfläche 2 × 2' },
  { key: 'objects.laterne', frameW: 16, frameH: 32, frames: 1, anchor: { x: 8, y: 31 }, placeholder: { painter: 'laterne' }, note: 'Hotpot-Restaurant: rote Papierlaterne auf einem Ständer, 1 Kachel' },
  { key: 'objects.fuchsbau', frameW: 48, frameH: 40, frames: 1, anchor: { x: 24, y: 39 }, placeholder: { painter: 'fuchsbauhuegel' }, note: 'Fuchsbau: Erdhügel mit Eingang unter Wurzeln, Grundfläche 3 × 2' },

  // ---- Gegenstände in der Welt ----
  { key: 'items.treibholz', frameW: 16, frameH: 16, frames: 1, anchor: { x: 8, y: 13 }, placeholder: { painter: 'treibholz' }, note: 'Treibholz am Strand' },
  { key: 'items.treibholz.treibend', frameW: 16, frameH: 16, frames: 2, fps: 2, anchor: { x: 8, y: 12 }, placeholder: { painter: 'treibholzTreibend' }, note: 'Treibholz treibt im Wasser' },
  { key: 'items.muschelschale', frameW: 16, frameH: 16, frames: 1, anchor: { x: 8, y: 13 }, placeholder: { painter: 'muschel' }, note: 'Natürliche Muschelschale im Sand (ohne Aufhängung)' },
  { key: 'deco.uferleuchte.aus', frameW: 16, frameH: 32, frames: 1, anchor: { x: 8, y: 30 }, placeholder: { painter: 'leuchteAus' }, note: 'Uferleuchte aus Treibholz mit Muschel, ausgeschaltet' },
  { key: 'deco.uferleuchte.an', frameW: 16, frameH: 32, frames: 3, fps: 4, anchor: { x: 8, y: 30 }, placeholder: { painter: 'leuchteAn' }, note: 'Uferleuchte eingeschaltet, sanftes Flackern' },
  { key: 'items.schilfhalm', frameW: 16, frameH: 16, frames: 1, anchor: { x: 8, y: 13 }, placeholder: { painter: 'schilfhalm' }, note: 'Bündel heller Schilfhalme mit Band (Fundstelle), gut vom stehenden Schilf zu unterscheiden' },
  { key: 'deco.schilfmatte', frameW: 16, frameH: 16, frames: 1, anchor: { x: 8, y: 12 }, placeholder: { painter: 'schilfmatte' }, note: 'Geflochtene Schilfmatte, flach auf dem Boden' },
  { key: 'deco.treibholzbank', frameW: 16, frameH: 24, frames: 1, anchor: { x: 8, y: 21 }, placeholder: { painter: 'bank' }, note: 'Kleine Bank aus Treibholz, 1 Kachel breit' },
  { key: 'deco.muschelwindspiel', frameW: 16, frameH: 32, frames: 3, fps: 2, anchor: { x: 8, y: 30 }, placeholder: { painter: 'windspiel' }, note: 'Windspiel aus Muscheln an einem Treibholzpfosten, Muscheln schaukeln leicht' },
  { key: 'items.wiesenbluete', frameW: 16, frameH: 16, frames: 1, anchor: { x: 8, y: 13 }, placeholder: { painter: 'wiesenbluete' }, note: 'Kleiner Strauß bunter Wiesenblüten (Fundstelle)' },
  { key: 'items.glitzerkiesel', frameW: 16, frameH: 16, frames: 1, anchor: { x: 8, y: 13 }, placeholder: { painter: 'glitzerkiesel' }, note: 'Runder, funkelnder Kiesel im Sand (Fundstelle)' },
  { key: 'items.seerosenblatt', frameW: 16, frameH: 16, frames: 2, fps: 1, anchor: { x: 8, y: 12 }, placeholder: { painter: 'seerosenblatt' }, note: 'Seerosenblatt, schwimmt und wippt leicht (Fundstelle im Teich)' },
  { key: 'deco.bluetengirlande', frameW: 16, frameH: 32, frames: 1, anchor: { x: 8, y: 30 }, placeholder: { painter: 'bluetengirlande' }, note: 'Blütengirlande zwischen zwei Stäbchen, Glitzerkiesel in der Mitte' },
  { key: 'deco.seerosenkissen', frameW: 16, frameH: 16, frames: 1, anchor: { x: 8, y: 13 }, placeholder: { painter: 'seerosenkissen' }, note: 'Rundes grünes Kissen aus Seerosenblättern mit Blüte' },
  { key: 'deco.kiesellicht.aus', frameW: 16, frameH: 16, frames: 1, anchor: { x: 8, y: 13 }, placeholder: { painter: 'kiesellicht', args: { an: false } }, note: 'Muschel mit Glitzerkieseln, aus' },
  { key: 'deco.kiesellicht.an', frameW: 16, frameH: 16, frames: 2, fps: 3, anchor: { x: 8, y: 13 }, placeholder: { painter: 'kiesellicht', args: { an: true } }, note: 'Muschel mit Glitzerkieseln, leuchtet sanft' },
  { key: 'items.feder', frameW: 16, frameH: 16, frames: 1, anchor: { x: 8, y: 13 }, placeholder: { painter: 'feder' }, note: 'Bunte Feder im Gras (Fundstelle)' },
  { key: 'items.sonnenblume', frameW: 16, frameH: 32, frames: 1, anchor: { x: 8, y: 30 }, placeholder: { painter: 'sonnenblume' }, note: 'Sonnenblume, gibt Sonnenblumenkerne (Fundstelle)' },
  { key: 'deco.federwimpel', frameW: 16, frameH: 32, frames: 2, fps: 2, anchor: { x: 8, y: 30 }, placeholder: { painter: 'federwimpel' }, note: 'Wimpel an einem Treibholzstab mit zwei Federn, flattert' },
  { key: 'deco.schilfball', frameW: 16, frameH: 16, frames: 1, anchor: { x: 8, y: 13 }, placeholder: { painter: 'schilfball' }, note: 'Geflochtener Ball aus Schilf' },
  { key: 'deco.sonnenblumentopf', frameW: 16, frameH: 32, frames: 1, anchor: { x: 8, y: 30 }, placeholder: { painter: 'sonnenblumentopf' }, note: 'Kleine Sonnenblume in einer Muschel als Topf' },
  { key: 'items.teepflanze', frameW: 16, frameH: 24, frames: 1, anchor: { x: 8, y: 22 }, placeholder: { painter: 'teepflanze' }, note: 'Teepflanze im Topf am Fenster (Fundstelle Teeblätter)' },
  { key: 'items.wollfaden', frameW: 16, frameH: 16, frames: 1, anchor: { x: 8, y: 13 }, placeholder: { painter: 'wollfaden' }, note: 'Bunter Wollfaden auf dem Boden (Fundstelle)' },
  { key: 'items.mehlsack', frameW: 16, frameH: 16, frames: 1, anchor: { x: 8, y: 14 }, placeholder: { painter: 'mehlsack' }, note: 'Kleines Mehlsäckchen (Fundstelle)' },
  { key: 'items.gemuesekiste', frameW: 16, frameH: 16, frames: 1, anchor: { x: 8, y: 14 }, placeholder: { painter: 'gemuesekiste' }, note: 'Holzkiste mit Möhrchen (Fundstelle)' },
  { key: 'items.kraeutertopf', frameW: 16, frameH: 16, frames: 1, anchor: { x: 8, y: 14 }, placeholder: { painter: 'kraeutertopf' }, note: 'Topf mit frischen Kräutern (Fundstelle)' },
  { key: 'items.tannenzapfen', frameW: 16, frameH: 16, frames: 1, anchor: { x: 8, y: 13 }, placeholder: { painter: 'tannenzapfen' }, note: 'Tannenzapfen am Boden (Fundstelle)' },
  { key: 'items.beerenstrauch', frameW: 16, frameH: 24, frames: 1, anchor: { x: 8, y: 22 }, placeholder: { painter: 'beerenstrauch' }, note: 'Kleiner Strauch mit roten Waldbeeren (Fundstelle)' },
  { key: 'items.moos', frameW: 16, frameH: 16, frames: 1, anchor: { x: 8, y: 13 }, placeholder: { painter: 'moos' }, note: 'Weiches Mooskissen am Boden (Fundstelle)' },
  { key: 'deco.kletterpflanze', frameW: 16, frameH: 32, frames: 1, anchor: { x: 8, y: 30 }, placeholder: { painter: 'kletterpflanze' }, note: 'Rankpflanze an einem Stab, mit Wollfaden festgebunden' },
  { key: 'deco.wollkissen', frameW: 16, frameH: 16, frames: 1, anchor: { x: 8, y: 13 }, placeholder: { painter: 'wollkissen' }, note: 'Buntes Wollkissen' },
  { key: 'deco.teigtaschen', frameW: 16, frameH: 16, frames: 2, fps: 2, anchor: { x: 8, y: 13 }, placeholder: { painter: 'teigtaschen' }, note: 'Teller mit dampfenden Teigtaschen' },
  { key: 'deco.kraeutersuppe', frameW: 16, frameH: 16, frames: 2, fps: 2, anchor: { x: 8, y: 13 }, placeholder: { painter: 'kraeutersuppe' }, note: 'Kräutersuppe in einer Muschelschale, dampft' },
  { key: 'deco.zapfenkranz', frameW: 16, frameH: 32, frames: 1, anchor: { x: 8, y: 30 }, placeholder: { painter: 'zapfenkranz' }, note: 'Kranz aus Tannenzapfen mit roter Beere auf einem Ständer' },
  { key: 'deco.beerenlicht.aus', frameW: 16, frameH: 24, frames: 1, anchor: { x: 8, y: 22 }, placeholder: { painter: 'beerenlicht', args: { an: false } }, note: 'Glas mit Waldbeeren und Glitzerkiesel, aus' },
  { key: 'deco.beerenlicht.an', frameW: 16, frameH: 24, frames: 2, fps: 3, anchor: { x: 8, y: 22 }, placeholder: { painter: 'beerenlicht', args: { an: true } }, note: 'Glas mit Waldbeeren und Glitzerkiesel, leuchtet warm' },
  { key: 'deco.mooskissen', frameW: 16, frameH: 16, frames: 1, anchor: { x: 8, y: 13 }, placeholder: { painter: 'mooskissen' }, note: 'Kissen aus Moos mit einer Feder' },
  { key: 'deco.teichlaterne.aus', frameW: 16, frameH: 24, frames: 1, anchor: { x: 8, y: 21 }, placeholder: { painter: 'teichlaterne', args: { an: false } }, note: 'Kiesellicht auf einem Seerosenblatt, aus' },
  { key: 'deco.teichlaterne.an', frameW: 16, frameH: 24, frames: 2, fps: 3, anchor: { x: 8, y: 21 }, placeholder: { painter: 'teichlaterne', args: { an: true } }, note: 'Kiesellicht auf einem Seerosenblatt, leuchtet' },

  // ---- Effekte ----
  { key: 'fx.leuchtschein', frameW: 64, frameH: 64, frames: 1, anchor: { x: 32, y: 32 }, placeholder: { painter: 'schein' }, note: 'Weicher Lichtkreis (additiv)' },
  { key: 'fx.glitzer', frameW: 8, frameH: 8, frames: 4, fps: 8, anchor: { x: 4, y: 4 }, placeholder: { painter: 'glitzer' }, note: 'Glitzern an Fundstellen' },
  { key: 'fx.ziel', frameW: 16, frameH: 8, frames: 1, anchor: { x: 8, y: 4 }, placeholder: { painter: 'ziel' }, note: 'Markierung des Tippziels' },
  { key: 'fx.hinweis', frameW: 12, frameH: 12, frames: 1, anchor: { x: 6, y: 11 }, placeholder: { painter: 'hinweis' }, note: 'Kleine Sprechblase über einer Figur, die etwas Neues für sie hat (Aufgabe, nächster Schritt)' },
  { key: 'fx.blase', frameW: 6, frameH: 6, frames: 1, anchor: { x: 3, y: 3 }, placeholder: { painter: 'blase' }, note: 'Kleine Luftblase (Bubbles macht immer wieder welche); das Spiel lässt sie aufsteigen' },
  { key: 'fx.spritzer', frameW: 16, frameH: 8, frames: 3, fps: 10, anchor: { x: 8, y: 6 }, placeholder: { painter: 'spritzer' }, note: 'Spritzer beim Ein- und Aussteigen' },

  // ---- Porträts (Dialog) ----
  { key: 'portraits.schnabbi', frameW: 64, frameH: 64, frames: 1, anchor: { x: 32, y: 32 }, placeholder: { painter: 'portrait', args: { who: 'schnabbi' } }, note: 'Schnabbi-Porträt, neutral' },
  { key: 'portraits.otter', frameW: 64, frameH: 64, frames: 1, anchor: { x: 32, y: 32 }, placeholder: { painter: 'portrait', args: { who: 'otter' } }, note: 'Starter-Otter-Porträt, neutral' },
  { key: 'portraits.otterprinzessin', frameW: 64, frameH: 64, frames: 1, anchor: { x: 32, y: 32 }, placeholder: { painter: 'portrait', args: { who: 'prinzessin' } }, note: 'Otterprinzessin-Porträt mit Krone, neutral' },
  { key: 'portraits.rosie', frameW: 64, frameH: 64, frames: 1, anchor: { x: 32, y: 32 }, placeholder: { painter: 'portrait', args: { who: 'rosie' } }, note: 'Rosie-Porträt (pinker Axolotl), neutral' },
  { key: 'portraits.bubbles', frameW: 64, frameH: 64, frames: 1, anchor: { x: 32, y: 32 }, placeholder: { painter: 'portrait', args: { who: 'bubbles' } }, note: 'Bubbles-Porträt (blauer Axolotl) mit einer Blase, neutral' },
  { key: 'portraits.meerkat', frameW: 64, frameH: 64, frames: 1, anchor: { x: 32, y: 32 }, placeholder: { painter: 'portrait', args: { who: 'meerkat' } }, note: 'Meerkat-Porträt (Erdmännchen), neutral' },
  { key: 'portraits.squichy', frameW: 64, frameH: 64, frames: 1, anchor: { x: 32, y: 32 }, placeholder: { painter: 'portrait', args: { who: 'squichy' } }, note: 'Squichy-Porträt (Mini-Robbe), neutral' },
  { key: 'portraits.chamaron', frameW: 64, frameH: 64, frames: 1, anchor: { x: 32, y: 32 }, placeholder: { painter: 'portrait', args: { who: 'chamaron' } }, note: 'Chamaron-Porträt (Chamäleon), neutral' },
  { key: 'portraits.beano', frameW: 64, frameH: 64, frames: 1, anchor: { x: 32, y: 32 }, placeholder: { painter: 'portrait', args: { who: 'beano' } }, note: 'Beano-Porträt (fröhliche Erbse)' },
  { key: 'portraits.beani', frameW: 64, frameH: 64, frames: 1, anchor: { x: 32, y: 32 }, placeholder: { painter: 'portrait', args: { who: 'beani' } }, note: 'Beani-Porträt (sanfte, verträumte Erbse)' },
  { key: 'portraits.beanz', frameW: 64, frameH: 64, frames: 1, anchor: { x: 32, y: 32 }, placeholder: { painter: 'portrait', args: { who: 'beanz' } }, note: 'Beanz-Porträt (neugierige Erbse)' },
  { key: 'portraits.bean', frameW: 64, frameH: 64, frames: 1, anchor: { x: 32, y: 32 }, placeholder: { painter: 'portrait', args: { who: 'bean' } }, note: 'Bean-Porträt (Rentier), neutral' },
];

/** Bodenkacheln: vorerst prozedural gezeichnet (Platzhalter). Kachelbogen-Layout wird mit Codex abgestimmt. */
export const TERRAIN_SLOT = {
  key: 'tiles.ufer',
  note: 'Uferkacheln 16 × 16: Gras, Sand, Wasser (animiert), Übergänge, Steg, Pfad, Schilf, Büsche',
} as const;

const byKey = new Map(sprites.map((s) => [s.key, s]));

export function spriteDef(key: string): SpriteDef | undefined {
  return byKey.get(key);
}

export function assetKeys(): Set<string> {
  return new Set(byKey.keys());
}
