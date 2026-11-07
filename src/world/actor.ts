// Ein Weltkörper in Bewegung: läuft und schwimmt entlang eines Kachelwegs, zeitbasiert (gleich schnell bei 60/120 Hz).
import Phaser from 'phaser';
import type { BodyDef } from '../content/types';
import type { Dir, Tile } from '../game/types';
import { terrainAt, TILE, type Grid } from '../game/space';
import type { Textures } from './textures';

export type Pose = 'idle' | 'walk' | 'swim' | 'sit';

export const anchorOf = (t: Tile) => ({ x: t.x * TILE + TILE / 2, y: t.y * TILE + 12 });

export class Actor {
  readonly sprite: Phaser.GameObjects.Sprite;
  pos: { x: number; y: number };
  tile: Tile;
  facing: Dir;
  restPose: 'idle' | 'sit' = 'idle';
  goal: Tile;
  private path: Tile[] = [];
  private onArrive: (() => void) | null = null;
  private arrivePending = false;
  private time = Math.random() * 3;
  private wasSwimming: boolean;

  constructor(
    scene: Phaser.Scene,
    private readonly tex: Textures,
    readonly body: BodyDef,
    private readonly grid: Grid,
    tile: Tile,
    facing: Dir,
  ) {
    this.tile = { ...tile };
    this.goal = { ...tile };
    this.pos = anchorOf(tile);
    this.facing = facing;
    this.wasSwimming = this.inWater();
    const first = tex.character(body.sprite, 'idle', facing);
    this.sprite = scene.add.sprite(this.pos.x, this.pos.y, first.key, 0);
    this.render();
  }

  get moving(): boolean {
    return this.path.length > 0;
  }

  inWater(): boolean {
    return terrainAt(this.grid, this.nearestTile()) === 'water';
  }

  nearestTile(): Tile {
    return { x: Math.floor(this.pos.x / TILE), y: Math.floor((this.pos.y - 4) / TILE) };
  }

  /** Sofort an eine Kachel setzen (Laden, Ortswechsel). */
  place(tile: Tile, facing: Dir): void {
    this.path = [];
    this.onArrive = null;
    this.tile = { ...tile };
    this.goal = { ...tile };
    this.pos = anchorOf(tile);
    this.facing = facing;
    this.wasSwimming = this.inWater();
    this.render();
  }

  /** Neuen Weg gehen. Ersetzt den vorigen Weg und dessen Ziel-Aktion. */
  walk(path: Tile[], onArrive?: () => void): void {
    this.path = path.map((t) => ({ ...t }));
    this.onArrive = onArrive ?? null;
    this.goal = path.length ? { ...path[path.length - 1]! } : { ...this.tile };
    this.arrivePending = path.length === 0;
  }

  faceToward(t: Tile): void {
    const dx = t.x - this.tile.x;
    const dy = t.y - this.tile.y;
    this.setFacingFromVector(dx, dy);
  }

  setFacing(dir: Dir): void {
    this.facing = dir;
  }

  private setFacingFromVector(dx: number, dy: number): void {
    const east = Math.abs(dx) > 0.01 ? dx > 0 : this.facing === 'se' || this.facing === 'ne';
    const north = dy < -0.01 ? true : dy > 0.01 ? false : this.facing === 'ne' || this.facing === 'nw';
    this.facing = north ? (east ? 'ne' : 'nw') : east ? 'se' : 'sw';
  }

  /** Bewegt die Figur. Liefert 'splash', wenn sie gerade ins Wasser oder heraus gewechselt ist. */
  update(dt: number): 'splash' | null {
    this.time += dt;
    let event: 'splash' | null = null;
    let budget = dt;
    while (this.path.length > 0 && budget > 0) {
      const next = this.path[0]!;
      const target = anchorOf(next);
      const water = terrainAt(this.grid, next) === 'water';
      const speed = water ? this.body.speed.water : this.body.speed.land;
      const dx = target.x - this.pos.x;
      const dy = target.y - this.pos.y;
      const dist = Math.hypot(dx, dy);
      if (dist > 0.01) this.setFacingFromVector(dx, dy);
      const step = speed * budget;
      if (step >= dist) {
        this.pos = target;
        this.tile = { ...next };
        this.path.shift();
        budget -= dist / speed;
        if (this.path.length === 0) this.arrivePending = true;
      } else {
        this.pos = { x: this.pos.x + (dx / dist) * step, y: this.pos.y + (dy / dist) * step };
        budget = 0;
      }
    }
    const swimming = this.inWater();
    if (swimming !== this.wasSwimming) {
      this.wasSwimming = swimming;
      event = 'splash';
    }
    if (this.arrivePending && this.path.length === 0) {
      this.arrivePending = false;
      const fn = this.onArrive;
      this.onArrive = null;
      fn?.();
    }
    this.render();
    return event;
  }

  pose(): Pose {
    if (this.inWater()) return 'swim';
    if (this.path.length > 0) return 'walk';
    return this.restPose;
  }

  render(): void {
    const pose = this.pose();
    const { key, flip } = this.tex.character(this.body.sprite, pose, this.facing);
    const info = this.tex.get(key);
    const frames = info?.frames ?? 1;
    const fps = info?.fps ?? 1;
    const frame = Math.floor(this.time * fps) % frames;
    if (this.sprite.texture.key !== key) this.sprite.setTexture(key, frame);
    else this.sprite.setFrame(frame);
    const o = this.tex.origin(key);
    this.sprite.setOrigin(o.x, o.y);
    this.sprite.setFlipX(flip);
    this.sprite.setPosition(Math.round(this.pos.x), Math.round(this.pos.y));
    this.sprite.setDepth(this.pos.y);
  }

  destroy(): void {
    this.sprite.destroy();
  }
}
