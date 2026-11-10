// Codex-Icons (Paket 03, 64-px-Fassung) und kleine Bildchen aus den Weltgrafiken für Listen.
import { spriteDef } from '../assets/catalog';
import { placeholderCanvas } from '../assets/placeholders';

export type IconName =
  | 'back'
  | 'bag'
  | 'close'
  | 'confirm'
  | 'decorate'
  | 'friends'
  | 'help'
  | 'map'
  | 'music'
  | 'place'
  | 'recipe-book'
  | 'rotate'
  | 'settings'
  | 'sound'
  | 'store'
  | 'task'
  | 'workbench';

/** Dekoratives Icon; die Beschriftung steht immer daneben (Bildschirmleser lesen nur den Text). */
export function Icon({ name, className = 'icon' }: { name: IconName; className?: string }) {
  return <img className={className} src={`art/ui/icons/64/${name}.png`} alt="" draggable={false} />;
}

const stripCache = new Map<string, string>();

/** Erster Frame einer Weltgrafik als kleines Bild (Beutel, Werkbank, Freundebuch). */
export function SpriteIcon({ sprite, box = 44 }: { sprite: string | undefined; box?: number }) {
  const def = sprite ? spriteDef(sprite) : undefined;
  if (!def) return <span className="sprite-icon" style={{ width: box, height: box }} />;
  let src = def.file?.path;
  if (!src) {
    src = stripCache.get(def.key);
    if (!src) {
      src = placeholderCanvas(def).toDataURL();
      stripCache.set(def.key, src);
    }
  }
  const frames = def.file ? def.file.frames : def.frames;
  // Ganzzahlig vergrößern (knackige Pixel); große Grafiken passen sich in die Box ein.
  const scale = Math.max(1, Math.floor(box / Math.max(def.frameW, def.frameH)));
  const fit = Math.min(1, box / (Math.max(def.frameW, def.frameH) * scale));
  const w = def.frameW * scale * fit;
  const h = def.frameH * scale * fit;
  return (
    <span className="sprite-icon" style={{ width: box, height: box }} aria-hidden="true">
      <span
        style={{
          width: w,
          height: h,
          backgroundImage: `url(${src})`,
          backgroundSize: `${w * frames}px ${h}px`,
        }}
      />
    </span>
  );
}
