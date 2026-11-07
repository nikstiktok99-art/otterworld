// Die Welt: eine generische Szene für jede Map. Übersetzt Tipps in Spielaktionen und zeigt das Ergebnis.
// Sie ändert nie selbst den Spielstand – alles läuft über session.dispatch.
import Phaser from 'phaser';
import type { Content, GatherSpotDef, MapDef, MapObjectDef } from '../content/types';
import type { Action, GameEvent } from '../game/actions';
import type { Tile } from '../game/types';
import { movementBlocked, resolveNpcs, type NpcPlacement } from '../game/occupancy';
import { checkPlacement } from '../game/rules/placement';
import { accessTiles, findPath, gridFor, inBounds, key, standable, terrainAt, TILE, type Grid } from '../game/space';
import { selectDialogue } from '../game/text';
import { spriteDef } from '../assets/catalog';
import { paintTerrain } from '../assets/placeholders';
import type { DialogController } from '../app/dialogs';
import type { GameSession } from '../app/session';
import type { Sound } from '../app/sound';
import type { UiStore } from '../app/ui';
import type { Platform } from '../platform';
import { Actor, anchorOf } from './actor';
import { Textures } from './textures';

export interface WorldDeps {
  session: GameSession;
  ui: UiStore;
  dialogs: DialogController;
  sound: Sound;
  platform: Platform;
  content: Content;
  onWarnings: (w: string[]) => void;
}

type Target =
  | { kind: 'npc'; actor: Actor; character: string }
  | { kind: 'spot'; spot: GatherSpotDef }
  | { kind: 'object'; obj: MapObjectDef }
  | { kind: 'deco'; uid: string };

interface Fx {
  sprite: Phaser.GameObjects.Sprite;
  t: number;
  frames: number;
  fps: number;
}

const DEPTH_EVENING = 50000;
const DEPTH_GLOW = 50001;
const DEPTH_UI = 50010;

export class WorldScene extends Phaser.Scene {
  private deps!: WorldDeps;
  private tex!: Textures;
  private map!: MapDef;
  private grid!: Grid;
  private terrain!: Phaser.GameObjects.Image;
  private terrainFrame = 0;
  player!: Actor;
  private npcs = new Map<string, { actor: Actor; placement: NpcPlacement }>();
  private spots = new Map<string, Phaser.GameObjects.Sprite>();
  private objects: Array<{ obj: MapObjectDef; sprite: Phaser.GameObjects.Sprite }> = [];
  private decos = new Map<string, { sprite: Phaser.GameObjects.Sprite; glow: Phaser.GameObjects.Image | null; item: string }>();
  private marker!: Phaser.GameObjects.Image;
  private decoLayer!: Phaser.GameObjects.Graphics;
  private preview: Phaser.GameObjects.Sprite | null = null;
  private decoActive = false;
  private fx: Fx[] = [];
  private time0 = 0;
  private down: { x: number; y: number } | null = null;
  private unsub: Array<() => void> = [];

  constructor() {
    super('world');
  }

  init(deps: WorldDeps): void {
    this.deps = deps;
    this.tex = new Textures();
    this.npcs = new Map();
    this.spots = new Map();
    this.objects = [];
    this.decos = new Map();
    this.fx = [];
    this.preview = null;
    this.decoActive = false;
  }

  preload(): void {
    this.tex.queueFiles(this);
  }

  create(): void {
    const { session, content, ui } = this.deps;
    const s = session.getState();
    this.map = content.maps[s.location.map]!;
    this.grid = gridFor(this.map);
    this.tex.build(this);
    this.deps.onWarnings(this.tex.warnings);

    // Boden (zwei Bilder für die ruhige Wasseranimation)
    for (const f of [0, 1]) {
      const k = `terrain.${this.map.id}.${f}`;
      if (this.textures.exists(k)) this.textures.remove(k);
      this.textures.addCanvas(k, paintTerrain(this.grid, f));
    }
    this.terrain = this.add.image(0, 0, `terrain.${this.map.id}.0`).setOrigin(0, 0).setDepth(-100000);
    this.time.addEvent({
      delay: 700,
      loop: true,
      callback: () => {
        this.terrainFrame ^= 1;
        this.terrain.setTexture(`terrain.${this.map.id}.${this.terrainFrame}`);
      },
    });

    // Gebäude und Möbel
    for (const obj of this.map.objects) {
      const x = (obj.tile.x + obj.footprint.w / 2) * TILE;
      const y = (obj.tile.y + obj.footprint.h) * TILE - 1;
      const o = this.tex.origin(obj.sprite);
      const sprite = this.add.sprite(x, y, obj.sprite, 0).setOrigin(o.x, o.y).setDepth(y);
      this.objects.push({ obj, sprite });
    }

    // Fundstellen
    for (const spot of this.map.gatherSpots) {
      const a = anchorOf(spot.tile);
      const o = this.tex.origin(spot.sprite);
      const sprite = this.add.sprite(a.x, a.y, spot.sprite, 0).setOrigin(o.x, o.y).setDepth(a.y - 1);
      sprite.setVisible(!s.gathered.includes(`${this.map.id}/${spot.id}`));
      this.spots.set(spot.id, sprite);
    }

    // Spielerin
    const body = content.bodies[content.characters[s.activeCharacter]!.body]!;
    this.player = new Actor(this, this.tex, body, this.grid, s.location.tile, s.location.facing);

    this.syncNpcs(false);
    this.syncDeco();

    // Abendstimmung über der ganzen Map, Lichtschein darüber
    this.add
      .rectangle(0, 0, this.grid.w * TILE, this.grid.h * TILE, 0x1c2a5a, 0.3)
      .setOrigin(0, 0)
      .setDepth(DEPTH_EVENING);

    this.marker = this.add.image(0, 0, 'fx.ziel', 0).setVisible(false).setDepth(DEPTH_UI);
    this.decoLayer = this.add.graphics().setDepth(DEPTH_UI - 1);

    const cam = this.cameras.main;
    cam.setBackgroundColor('#3d86a8');
    cam.setBounds(0, 0, this.grid.w * TILE, this.grid.h * TILE);
    cam.setRoundPixels(true);
    this.applyZoom();
    cam.startFollow(this.player.sprite, true, 0.12, 0.12);
    cam.centerOn(this.player.pos.x, this.player.pos.y);

    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
      this.down = { x: p.x, y: p.y };
    });
    this.input.on('pointerup', (p: Phaser.Input.Pointer) => {
      const d = this.down;
      this.down = null;
      if (!d || Math.hypot(p.x - d.x, p.y - d.y) > 16) return;
      const w = this.cameras.main.getWorldPoint(p.x, p.y);
      this.tap(w.x, w.y);
    });

    this.unsub.push(session.onEvents((ev, action) => this.onGameEvents(ev, action)));
    this.unsub.push(session.subscribe(() => this.onStateChanged()));
    this.unsub.push(ui.subscribe(() => this.onUiChanged()));
    this.unsub.push(ui.onCue((c) => this.onCue(c)));
    this.unsub.push(session.onReload(() => this.scene.restart(this.deps)));
    this.scale.on(Phaser.Scale.Events.RESIZE, this.applyZoom, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.cleanup());

    this.time.addEvent({ delay: 2400, loop: true, callback: () => this.sparkleSpot() });
  }

  private cleanup(): void {
    this.unsub.splice(0).forEach((u) => u());
    this.scale.off(Phaser.Scale.Events.RESIZE, this.applyZoom, this);
    this.input.removeAllListeners();
  }

  // ------------------------------------------------------------ Kamera

  private applyZoom(): void {
    const cam = this.cameras.main;
    const z = this.deps.ui.getState().zoomOverride ?? Math.max(2, Math.floor(this.scale.width / 190));
    cam.setZoom(z);
    this.updateFollowOffset();
  }

  private updateFollowOffset(): void {
    const cam = this.cameras.main;
    const panel = this.deps.ui.getState().panel;
    // Bei offenem Dialog sitzt die Figur höher, damit die Dialogbox sie nicht verdeckt.
    const shift = panel?.kind === 'dialog' ? (this.scale.height * 0.18) / cam.zoom : 0;
    cam.setFollowOffset(0, -shift);
  }

  zoomLevel(): number {
    return this.cameras.main.zoom;
  }

  /** Bildschirmposition (CSS-Pixel) einer Kachelmitte – für automatische Tests. */
  tileToScreen(t: Tile): { x: number; y: number } {
    const cam = this.cameras.main;
    const a = anchorOf(t);
    return { x: (a.x - cam.worldView.x) * cam.zoom, y: (a.y - 4 - cam.worldView.y) * cam.zoom };
  }

  // ------------------------------------------------------------ Tippen

  tap(wx: number, wy: number): void {
    const ui = this.deps.ui.getState();
    if (ui.panel) return;
    const tile = { x: Math.floor(wx / TILE), y: Math.floor(wy / TILE) };
    if (ui.decorate) {
      this.decorateSelect(tile);
      return;
    }
    const target = this.pick(wx, wy);
    if (target) this.goInteract(target);
    else this.goTo(tile);
  }

  private pick(wx: number, wy: number): Target | null {
    const hits: Array<{ depth: number; target: Target }> = [];
    const test = (sprite: Phaser.GameObjects.Sprite, target: Target) => {
      if (!sprite.visible) return;
      const b = sprite.getBounds();
      const padX = Math.max(0, (22 - b.width) / 2);
      const padY = Math.max(0, (22 - b.height) / 2);
      if (wx >= b.x - padX && wx <= b.right + padX && wy >= b.y - padY && wy <= b.bottom + padY) {
        hits.push({ depth: sprite.depth, target });
      }
    };
    for (const { actor, placement } of this.npcs.values()) {
      test(actor.sprite, { kind: 'npc', actor, character: placement.characters[0]! });
    }
    for (const [uid, d] of this.decos) test(d.sprite, { kind: 'deco', uid });
    for (const spot of this.map.gatherSpots) {
      const sp = this.spots.get(spot.id);
      if (sp) test(sp, { kind: 'spot', spot });
    }
    for (const { obj, sprite } of this.objects) if (obj.interaction) test(sprite, { kind: 'object', obj });
    hits.sort((a, b) => b.depth - a.depth);
    return hits[0]?.target ?? null;
  }

  private moves() {
    return this.player.body.moves;
  }

  private blocked(): Set<number> {
    return movementBlocked(this.deps.session.getState(), this.map);
  }

  private passable(t: Tile, blocked: Set<number>): boolean {
    return inBounds(this.grid, t) && !blocked.has(key(this.grid, t)) && standable(terrainAt(this.grid, t), this.moves());
  }

  private goTo(tile: Tile): void {
    const blocked = this.blocked();
    let dest: Tile | null = this.passable(tile, blocked) ? tile : null;
    if (!dest) {
      // Danebengetippt (z. B. auf einen Busch): nächstgelegene begehbare Kachel in der Nähe.
      let best: { t: Tile; d: number } | null = null;
      for (let dy = -2; dy <= 2; dy++)
        for (let dx = -2; dx <= 2; dx++) {
          const t = { x: tile.x + dx, y: tile.y + dy };
          const d = dx * dx + dy * dy;
          if (this.passable(t, blocked) && (!best || d < best.d)) best = { t, d };
        }
      dest = best?.t ?? null;
    }
    const path = dest ? findPath(this.grid, blocked, this.player.nearestTile(), [dest], this.moves()) : null;
    if (!dest || !path) {
      this.deps.sound.play('sfx.nein');
      return;
    }
    this.showMarker(dest);
    this.deps.sound.play('sfx.tipp');
    this.player.walk(path, () => this.reportPosition());
  }

  private goInteract(target: Target): void {
    const blocked = this.blocked();
    let rect: { x: number; y: number; w: number; h: number };
    let inside = false;
    let face: Tile;
    if (target.kind === 'npc') {
      rect = { x: target.actor.goal.x, y: target.actor.goal.y, w: 1, h: 1 };
      face = target.actor.goal;
    } else if (target.kind === 'spot') {
      rect = { x: target.spot.tile.x, y: target.spot.tile.y, w: 1, h: 1 };
      inside = true;
      face = target.spot.tile;
    } else if (target.kind === 'object') {
      rect = { x: target.obj.tile.x, y: target.obj.tile.y, w: target.obj.footprint.w, h: target.obj.footprint.h };
      face = { x: target.obj.tile.x + Math.floor(target.obj.footprint.w / 2), y: target.obj.tile.y };
    } else {
      const d = this.deps.session.getState().deco.find((x) => x.uid === target.uid);
      if (!d) return;
      rect = { x: d.tile.x, y: d.tile.y, w: 1, h: 1 };
      face = d.tile;
    }
    const access = accessTiles(this.grid, blocked, rect, this.moves(), inside).filter(
      (t) => target.kind !== 'npc' || t.x !== rect.x || t.y !== rect.y,
    );
    const path = findPath(this.grid, blocked, this.player.nearestTile(), access, this.moves());
    if (!path) {
      this.deps.ui.toast('Da komme ich gerade nicht hin.');
      this.deps.sound.play('sfx.nein');
      return;
    }
    this.showMarker(path.length ? path[path.length - 1]! : this.player.tile);
    this.deps.sound.play('sfx.tipp');
    this.player.walk(path, () => {
      this.player.faceToward(face);
      this.reportPosition();
      this.interact(target);
    });
  }

  private interact(target: Target): void {
    const { session, ui, dialogs, sound } = this.deps;
    if (!ui.idle) return;
    switch (target.kind) {
      case 'npc':
        target.actor.faceToward(this.player.tile);
        dialogs.start(target.character);
        break;
      case 'spot':
        session.dispatch({ type: 'gather', map: this.map.id, spot: target.spot.id });
        break;
      case 'object':
        if (target.obj.interaction?.kind === 'workbench') {
          sound.play('sfx.tipp');
          ui.open({ kind: 'werkbank' });
        } else if (target.obj.interaction?.kind === 'inspect') {
          ui.toast(target.obj.interaction.text);
        }
        break;
      case 'deco': {
        const ev = session.dispatch({ type: 'toggleDeco', uid: target.uid });
        const rej = ev.find((e) => e.type === 'rejected');
        if (rej && rej.type === 'rejected' && rej.detail) ui.toast(rej.detail);
        break;
      }
    }
  }

  /** Aktuelle sichere Position melden (nach Ankunft und beim Unterbrechen der App). */
  reportPosition(): void {
    this.deps.session.dispatch({ type: 'arrive', map: this.map.id, tile: this.player.tile, facing: this.player.facing });
  }

  private showMarker(t: Tile): void {
    const a = anchorOf(t);
    this.marker.setPosition(a.x, a.y).setVisible(true).setAlpha(1);
    this.tweens.killTweensOf(this.marker);
    this.tweens.add({ targets: this.marker, alpha: 0, duration: 700, delay: 250 });
  }

  // ------------------------------------------------------------ Spielereignisse

  private onGameEvents(events: GameEvent[], action: Action | null): void {
    const { sound, platform, ui, content } = this.deps;
    const haptic = () => {
      if (this.deps.session.getState().settings.haptics) platform.haptics.tap();
    };
    for (const e of events) {
      if (e.type === 'itemGained' && action?.type === 'gather') {
        const sprite = this.spots.get(action.spot);
        if (sprite) {
          this.burst(sprite.x, sprite.y - 6);
          this.tweens.add({
            targets: sprite,
            y: sprite.y - 10,
            alpha: 0,
            duration: 380,
            onComplete: () => sprite.setVisible(false).setAlpha(1),
          });
        }
        sound.play('sfx.aufheben');
        haptic();
        const item = content.items[e.item];
        ui.toast(`${item?.name ?? e.item} aufgehoben (${e.total})`);
      } else if (e.type === 'crafted') {
        sound.play('sfx.bauen');
        haptic();
      } else if (e.type === 'placed' || e.type === 'moved') {
        sound.play('sfx.aufstellen');
        haptic();
        this.syncDeco();
        const d = this.decos.get(e.uid);
        if (d) {
          d.sprite.setScale(0.6);
          this.tweens.add({ targets: d.sprite, scale: 1, duration: 260, ease: 'Back.easeOut' });
        }
      } else if (e.type === 'toggled' && e.on && action?.type === 'toggleDeco') {
        sound.play('sfx.leuchte');
      } else if (e.type === 'rejected' && action?.type === 'gather') {
        sound.play('sfx.nein');
      }
    }
  }

  private onStateChanged(): void {
    const s = this.deps.session.getState();
    for (const spot of this.map.gatherSpots) {
      const sprite = this.spots.get(spot.id);
      const gone = s.gathered.includes(`${this.map.id}/${spot.id}`);
      if (sprite && !gone) sprite.setVisible(true);
    }
    this.syncDeco();
    this.syncNpcs(true);
  }

  private syncDeco(): void {
    const s = this.deps.session.getState();
    const seen = new Set<string>();
    for (const d of s.deco) {
      if (d.map !== this.map.id) continue;
      seen.add(d.uid);
      const item = this.deps.content.items[d.item];
      const key = d.on && item?.deco?.spriteOn ? item.deco.spriteOn : (item?.sprite ?? d.item);
      const a = anchorOf(d.tile);
      let entry = this.decos.get(d.uid);
      if (!entry) {
        entry = { sprite: this.add.sprite(a.x, a.y, key, 0), glow: null, item: d.item };
        this.decos.set(d.uid, entry);
      }
      const o = this.tex.origin(key);
      if (entry.sprite.texture.key !== key) entry.sprite.setTexture(key, 0);
      entry.sprite.setOrigin(o.x, o.y).setPosition(a.x, a.y).setDepth(a.y);
      this.setGlow(entry, d.on, a.x, a.y);
    }
    for (const [uid, entry] of this.decos) {
      if (seen.has(uid)) continue;
      entry.sprite.destroy();
      entry.glow?.destroy();
      this.decos.delete(uid);
    }
  }

  private setGlow(
    entry: { sprite: Phaser.GameObjects.Sprite; glow: Phaser.GameObjects.Image | null },
    on: boolean,
    x: number,
    y: number,
  ): void {
    if (on && !entry.glow) {
      entry.glow = this.add
        .image(x + 4, y - 19, 'fx.leuchtschein', 0)
        .setBlendMode(Phaser.BlendModes.ADD)
        .setDepth(DEPTH_GLOW)
        .setScale(1.6)
        .setAlpha(0);
      this.tweens.add({ targets: entry.glow, alpha: 0.7, duration: 900 });
      this.tweens.add({ targets: entry.glow, scale: 1.75, duration: 1800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    } else if (!on && entry.glow) {
      entry.glow.destroy();
      entry.glow = null;
    }
    entry.glow?.setPosition(x + 4, y - 19);
  }

  private onCue(cue: string): void {
    if (cue !== 'leuchteAn') return;
    for (const entry of this.decos.values()) {
      const item = this.deps.content.items[entry.item];
      if (!item?.deco?.spriteOn) continue;
      entry.sprite.setTexture(item.deco.spriteOn, 0);
      this.setGlow(entry, true, entry.sprite.x, entry.sprite.y);
      this.burst(entry.sprite.x + 4, entry.sprite.y - 20);
      this.deps.sound.play('sfx.leuchte');
    }
  }

  private syncNpcs(animate: boolean): void {
    const { session, content } = this.deps;
    const s = session.getState();
    const placements = resolveNpcs(s, content, this.map.id);
    const seen = new Set<string>();
    for (const p of placements) {
      seen.add(p.body);
      const body = content.bodies[p.body]!;
      const existing = this.npcs.get(p.body);
      if (!existing) {
        const actor = new Actor(this, this.tex, body, this.grid, p.tile, p.facing);
        actor.restPose = p.pose;
        this.npcs.set(p.body, { actor, placement: p });
        continue;
      }
      const { actor } = existing;
      existing.placement = p;
      if (actor.goal.x === p.tile.x && actor.goal.y === p.tile.y) {
        if (!actor.moving) {
          actor.restPose = p.pose;
          actor.setFacing(p.facing);
        }
        continue;
      }
      const path = animate ? findPath(this.grid, movementBlocked(s, this.map), actor.nearestTile(), [p.tile], body.moves) : null;
      if (path) {
        actor.restPose = 'idle';
        actor.walk(path, () => {
          actor.restPose = p.pose;
          actor.setFacing(p.facing);
          if (p.talk) this.time.delayedCall(450, () => this.talkOnArrival(p));
        });
      } else {
        actor.restPose = p.pose;
        actor.place(p.tile, p.facing);
      }
    }
    for (const [bodyId, { actor }] of this.npcs) {
      if (seen.has(bodyId)) continue;
      actor.destroy();
      this.npcs.delete(bodyId);
    }
  }

  private talkOnArrival(p: NpcPlacement): void {
    const { ui, dialogs, session, content } = this.deps;
    const character = p.characters[0];
    if (!character || !ui.idle || this.player.moving) return;
    const current = resolveNpcs(session.getState(), content, this.map.id).find((n) => n.body === p.body);
    if (!current?.talk || !selectDialogue(character, session.getState(), content)) return;
    this.npcs.get(p.body)?.actor.faceToward(this.player.tile);
    dialogs.start(character);
  }

  // ------------------------------------------------------------ Dekoriermodus

  private onUiChanged(): void {
    this.updateFollowOffset();
    const d = this.deps.ui.getState().decorate;
    const cam = this.cameras.main;
    if (d && !this.decoActive) {
      this.decoActive = true;
      const z = this.map.decorZone;
      cam.stopFollow();
      // Kamera-Effekte suchen den Easing-Namen wörtlich nach – nur die ausgeschriebene Form funktioniert.
      cam.pan((z.x + z.w / 2) * TILE, (z.y + z.h / 2) * TILE, 450, 'Sine.easeInOut');
      if (d.mode === 'move' && d.uid) this.decos.get(d.uid)?.sprite.setAlpha(0.35);
      this.drawDecoLayer();
    } else if (!d && this.decoActive) {
      this.decoActive = false;
      this.decoLayer.clear();
      this.preview?.destroy();
      this.preview = null;
      for (const e of this.decos.values()) e.sprite.setAlpha(1);
      cam.startFollow(this.player.sprite, true, 0.12, 0.12);
    } else if (d) {
      this.drawDecoLayer();
    }
    if (this.deps.ui.getState().zoomOverride !== null && cam.zoom !== this.deps.ui.getState().zoomOverride) this.applyZoom();
  }

  private drawDecoLayer(): void {
    const d = this.deps.ui.getState().decorate;
    const g = this.decoLayer;
    g.clear();
    if (!d) return;
    const s = this.deps.session.getState();
    const z = this.map.decorZone;
    g.fillStyle(0xfff4c8, 0.2);
    for (let y = z.y; y < z.y + z.h; y++) {
      for (let x = z.x; x < z.x + z.w; x++) {
        if (!checkPlacement(s, this.deps.content, this.map.id, { x, y }, d.uid)) g.fillRect(x * TILE + 1, y * TILE + 1, TILE - 2, TILE - 2);
      }
    }
    if (d.tile) {
      const ok = !d.problem;
      g.lineStyle(1, ok ? 0xfff4c8 : 0xff6b6b, 1);
      g.strokeRect(d.tile.x * TILE + 0.5, d.tile.y * TILE + 0.5, TILE - 1, TILE - 1);
      const item = this.deps.content.items[d.item];
      const key = item?.sprite ?? 'deco.uferleuchte.aus';
      const a = anchorOf(d.tile);
      if (!this.preview) this.preview = this.add.sprite(a.x, a.y, key, 0).setDepth(DEPTH_UI - 2);
      const o = this.tex.origin(key);
      this.preview.setOrigin(o.x, o.y).setPosition(a.x, a.y).setAlpha(0.8);
      if (ok) this.preview.clearTint();
      else this.preview.setTint(0xff9090);
    }
  }

  private decorateSelect(tile: Tile): void {
    const { ui, session, content, sound } = this.deps;
    const d = ui.getState().decorate;
    if (!d) return;
    const problem = checkPlacement(session.getState(), content, this.map.id, tile, d.uid);
    sound.play(problem ? 'sfx.nein' : 'sfx.tipp');
    ui.set({ decorate: { ...d, tile, problem } });
  }

  // ------------------------------------------------------------ Effekte und Ablauf

  private burst(x: number, y: number): void {
    for (const [dx, dy] of [[-6, -2], [5, -6], [1, 3]] as const) {
      const sprite = this.add.sprite(x + dx, y + dy, 'fx.glitzer', 0).setDepth(DEPTH_UI - 3);
      this.fx.push({ sprite, t: -Math.random() * 0.15, frames: 4, fps: 9 });
    }
  }

  private splash(x: number, y: number): void {
    const o = this.tex.origin('fx.spritzer');
    const sprite = this.add.sprite(x, y, 'fx.spritzer', 0).setOrigin(o.x, o.y).setDepth(y + 1);
    this.fx.push({ sprite, t: 0, frames: 3, fps: 10 });
  }

  private sparkleSpot(): void {
    const open = this.map.gatherSpots.filter((sp) => this.spots.get(sp.id)?.visible);
    const spot = open[Math.floor(Math.random() * open.length)];
    if (!spot) return;
    const a = anchorOf(spot.tile);
    const sprite = this.add.sprite(a.x + 4, a.y - 10, 'fx.glitzer', 0).setDepth(DEPTH_UI - 3);
    this.fx.push({ sprite, t: 0, frames: 4, fps: 6 });
  }

  update(_time: number, deltaMs: number): void {
    const dt = Math.min(deltaMs, 100) / 1000;
    this.time0 += dt;
    if (this.player.update(dt) === 'splash') {
      this.splash(this.player.pos.x, this.player.pos.y);
      this.deps.sound.play('sfx.platsch');
    }
    for (const { actor } of this.npcs.values()) {
      if (actor.update(dt) === 'splash') this.splash(actor.pos.x, actor.pos.y);
    }
    for (const spot of this.map.gatherSpots) {
      const sprite = this.spots.get(spot.id);
      const info = this.tex.get(spot.sprite);
      if (sprite && info && info.frames > 1) sprite.setFrame(Math.floor(this.time0 * info.fps) % info.frames);
    }
    for (const entry of this.decos.values()) {
      const info = this.tex.get(entry.sprite.texture.key);
      if (info && info.frames > 1) entry.sprite.setFrame(Math.floor(this.time0 * info.fps) % info.frames);
    }
    for (let i = this.fx.length - 1; i >= 0; i--) {
      const f = this.fx[i]!;
      f.t += dt;
      const frame = Math.floor(Math.max(0, f.t) * f.fps);
      if (frame >= f.frames) {
        f.sprite.destroy();
        this.fx.splice(i, 1);
      } else {
        f.sprite.setVisible(f.t >= 0).setFrame(frame);
      }
    }
  }

  /** Für Tests und das Technik-Fenster. */
  debugInfo() {
    return {
      zoom: this.cameras.main.zoom,
      player: { tile: this.player.tile, moving: this.player.moving, pose: this.player.pose() },
      npcs: [...this.npcs.values()].map(({ actor, placement }) => ({ body: placement.body, tile: actor.tile, moving: actor.moving, pose: actor.pose() })),
      warnings: this.tex.warnings,
      spriteKeys: spriteDef('characters.schnabbi.idle.se')?.file ? 'schnabbi:datei' : 'schnabbi:platzhalter',
    };
  }
}
