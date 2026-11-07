// Speichern mit zwei Plätzen im Wechsel, laufender Nummer und Prüfsumme.
// - Schreibvorgänge laufen nacheinander; schnelle Wünsche werden zum neuesten zusammengefasst.
// - Ein abgebrochener Schreibvorgang trifft nie den letzten gültigen Stand.
// - Ein Stand aus einer neueren Spielversion wird nicht überschrieben.
import type { Content } from '../content/types';
import type { GameState } from '../game/types';
import { decodeEnvelope, encodeEnvelope, type SaveEnvelope } from '../game/save/codec';
import { normalizeState } from '../game/save/normalize';

export interface KeyValueStore {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  remove(key: string): Promise<void>;
}

export interface LoadResult {
  state: GameState | null;
  problem: null | 'newer' | 'corrupt';
  notes: string[];
}

export class SaveStore {
  private seq = 0;
  private pending: GameState | null = null;
  private loop: Promise<void> | null = null;
  readOnly = false;
  lastSavedAt = 0;
  lastError: string | null = null;

  constructor(
    private readonly kv: KeyValueStore,
    private readonly prefix = 'otterwelt.save',
  ) {}

  private slotKey(seq: number): string {
    return `${this.prefix}.${seq % 2 === 1 ? 'a' : 'b'}`;
  }

  get currentSeq(): number {
    return this.seq;
  }

  async load(content: Content): Promise<LoadResult> {
    const raws = await Promise.all([this.kv.get(`${this.prefix}.a`), this.kv.get(`${this.prefix}.b`)]);
    let best: SaveEnvelope | null = null;
    let newer = false;
    let damaged = false;
    for (const raw of raws) {
      const d = decodeEnvelope(raw);
      if (d.ok) {
        if (!best || d.env.seq > best.seq) best = d.env;
      } else if (d.reason === 'newer') {
        newer = true;
      } else if (d.reason !== 'empty') {
        damaged = true;
      }
    }
    this.seq = best?.seq ?? 0;
    if (newer) {
      this.readOnly = true;
      return { state: null, problem: 'newer', notes: [] };
    }
    if (!best) return { state: null, problem: damaged ? 'corrupt' : null, notes: [] };
    const n = normalizeState(best.state, best.schema, content);
    return { state: n.state, problem: null, notes: damaged ? ['Ein Speicherplatz war beschädigt – der ältere gültige Stand wurde geladen.', ...n.notes] : n.notes };
  }

  /** Neuen Stand zum Speichern vormerken. Kehrt sofort zurück. */
  request(state: GameState): void {
    if (this.readOnly) return;
    this.pending = state;
    if (!this.loop) this.loop = this.run();
  }

  private async run(): Promise<void> {
    try {
      while (this.pending) {
        const s = this.pending;
        this.pending = null;
        const seq = this.seq + 1;
        try {
          await this.kv.set(this.slotKey(seq), encodeEnvelope(s, seq, Date.now()));
          this.seq = seq;
          this.lastSavedAt = Date.now();
          this.lastError = null;
        } catch (e) {
          this.lastError = e instanceof Error ? e.message : String(e);
          // Beim nächsten Wunsch erneut versuchen, ohne neuere Wünsche zu verdrängen.
          this.pending = this.pending ?? s;
          return;
        }
      }
    } finally {
      this.loop = null;
    }
  }

  /** Wartet, bis alle vorgemerkten Stände geschrieben sind. */
  async flush(): Promise<void> {
    while (this.loop) await this.loop;
  }

  async clear(): Promise<void> {
    await this.flush();
    await this.kv.remove(`${this.prefix}.a`);
    await this.kv.remove(`${this.prefix}.b`);
    this.seq = 0;
    this.readOnly = false;
  }
}
