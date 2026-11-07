// Lädt gelieferte PNGs aus dem Katalog und erzeugt für alles andere Platzhalter hinter denselben Schlüsseln.
import Phaser from 'phaser';
import type { Dir } from '../game/types';
import { sprites, type SpriteDef } from '../assets/catalog';
import { placeholderCanvas } from '../assets/placeholders';

export interface TextureInfo {
  key: string;
  def: SpriteDef;
  frames: number;
  fps: number;
  fromFile: boolean;
}

export class Textures {
  private info = new Map<string, TextureInfo>();
  private failed = new Set<string>();
  readonly warnings: string[] = [];

  queueFiles(scene: Phaser.Scene): void {
    scene.load.on(Phaser.Loader.Events.FILE_LOAD_ERROR, (file: Phaser.Loader.File) => {
      this.failed.add(file.key);
    });
    for (const def of sprites) {
      if (!def.file || scene.textures.exists(def.key)) continue;
      scene.load.spritesheet(def.key, def.file.path, { frameWidth: def.frameW, frameHeight: def.frameH });
    }
  }

  build(scene: Phaser.Scene): void {
    for (const def of sprites) {
      const file = def.file;
      if (file && !this.failed.has(def.key) && scene.textures.exists(def.key)) {
        const img = scene.textures.get(def.key).getSourceImage() as { width: number; height: number };
        if (img.width !== def.frameW * file.frames || img.height !== def.frameH) {
          this.warnings.push(
            `${def.key}: Datei ist ${img.width} × ${img.height}, erwartet ${def.frameW * file.frames} × ${def.frameH}`,
          );
        }
        this.info.set(def.key, { key: def.key, def, frames: file.frames, fps: file.fps ?? def.fps ?? 1, fromFile: true });
        continue;
      }
      if (file) this.warnings.push(`${def.key}: Datei ${file.path} nicht ladbar – Platzhalter`);
      if (scene.textures.exists(def.key)) scene.textures.remove(def.key);
      const tex = scene.textures.addCanvas(def.key, placeholderCanvas(def));
      if (tex) for (let i = 0; i < def.frames; i++) tex.add(i, 0, i * def.frameW, 0, def.frameW, def.frameH);
      this.info.set(def.key, { key: def.key, def, frames: def.frames, fps: def.fps ?? 1, fromFile: false });
    }
  }

  get(key: string): TextureInfo | undefined {
    return this.info.get(key);
  }

  /** Ursprung (0..1) aus dem Bodenanker. */
  origin(key: string): { x: number; y: number } {
    const d = this.info.get(key)?.def;
    return d ? { x: d.anchor.x / d.frameW, y: d.anchor.y / d.frameH } : { x: 0.5, y: 1 };
  }

  /**
   * Textur für eine Figur. sw/nw werden aus se/ne gespiegelt. Ist für eine Figur schon eine Datei geliefert,
   * aber nicht für diesen Zustand, wird die gelieferte Datei bevorzugt (kein Mix aus Bild und Testform).
   */
  character(base: string, state: string, dir: Dir): { key: string; flip: boolean } {
    const drawn = dir === 'sw' ? 'se' : dir === 'nw' ? 'ne' : dir;
    const flip = dir === 'sw' || dir === 'nw';
    const exact = `${base}.${state}.${drawn}`;
    const exactInfo = this.info.get(exact);
    if (exactInfo?.fromFile) return { key: exact, flip };
    const anyFile = [...this.info.values()].some((i) => i.fromFile && i.key.startsWith(`${base}.`));
    if (anyFile) {
      for (const k of [`${base}.${state}.${drawn === 'se' ? 'ne' : 'se'}`, `${base}.idle.${drawn}`, `${base}.idle.se`, `${base}.idle.ne`]) {
        if (this.info.get(k)?.fromFile) return { key: k, flip };
      }
    }
    if (exactInfo) return { key: exact, flip };
    return { key: `${base}.idle.${drawn}`, flip };
  }
}
