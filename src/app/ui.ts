// Zustand der Oberfläche (nicht gespeichert): offenes Fenster, Dekoriermodus, kurze Hinweise.
// Welt und React lesen denselben Zustand. Ist ein Fenster offen, ignoriert die Welt Tipps.
import type { PlacementProblem } from '../game/rules/placement';
import type { Tile } from '../game/types';

export type Panel =
  | { kind: 'title' }
  | { kind: 'dialog'; dialogue: string; character: string; line: number }
  | { kind: 'bag' }
  | { kind: 'werkbank' }
  | { kind: 'menu' }
  | { kind: 'name' }
  | { kind: 'saveExport' }
  | { kind: 'saveImport' }
  | { kind: 'friends' }
  | { kind: 'endcard'; quest: string; unlocked: string[] }
  | { kind: 'tech' }
  | { kind: 'notice'; title: string; text: string };

export interface Decorate {
  mode: 'place' | 'move';
  item: string;
  uid?: string;
  tile: Tile | null;
  problem: PlacementProblem | null;
}

export interface Toast {
  id: number;
  text: string;
}

export interface UiState {
  panel: Panel | null;
  decorate: Decorate | null;
  toasts: Toast[];
  zoomOverride: number | null;
}

export class UiStore {
  private state: UiState = { panel: { kind: 'title' }, decorate: null, toasts: [], zoomOverride: null };
  private listeners = new Set<() => void>();
  private cueListeners = new Set<(cue: string) => void>();
  private toastId = 0;
  private timers = new Set<ReturnType<typeof setTimeout>>();

  getState = (): UiState => this.state;

  subscribe = (fn: () => void): (() => void) => {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  };

  set(patch: Partial<UiState>): void {
    this.state = { ...this.state, ...patch };
    for (const fn of this.listeners) fn();
  }

  open(panel: Panel): void {
    this.set({ panel });
  }

  close(): void {
    this.set({ panel: null });
  }

  /** Nichts offen und kein Dekoriermodus: die Welt nimmt Tipps an. */
  get idle(): boolean {
    return this.state.panel === null && this.state.decorate === null;
  }

  toast(text: string, ms = 2600): void {
    const id = ++this.toastId;
    this.set({ toasts: [...this.state.toasts.slice(-2), { id, text }] });
    const t = setTimeout(() => {
      this.timers.delete(t);
      this.set({ toasts: this.state.toasts.filter((x) => x.id !== id) });
    }, ms);
    this.timers.add(t);
  }

  cue(name: string): void {
    for (const fn of this.cueListeners) fn(name);
  }

  onCue(fn: (cue: string) => void): () => void {
    this.cueListeners.add(fn);
    return () => this.cueListeners.delete(fn);
  }

  dispose(): void {
    for (const t of this.timers) clearTimeout(t);
    this.timers.clear();
    this.listeners.clear();
    this.cueListeners.clear();
  }
}
