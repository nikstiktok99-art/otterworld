// Die Spielsitzung: hält den aktuellen Stand, führt Aktionen über die Spielregeln aus,
// speichert bestätigte Änderungen und benachrichtigt Welt und Oberfläche.
import type { Content } from '../content/types';
import type { Action, GameEvent } from '../game/actions';
import type { GameState } from '../game/types';
import { reduce } from '../game/reduce';
import type { SaveStore } from './saveStore';

type Listener = () => void;
type EventListener = (events: GameEvent[], action: Action | null) => void;

export class GameSession {
  private state: GameState;
  private listeners = new Set<Listener>();
  private eventListeners = new Set<EventListener>();
  private reloadListeners = new Set<Listener>();

  constructor(
    initial: GameState,
    readonly content: Content,
    readonly save: SaveStore,
  ) {
    this.state = initial;
  }

  getState = (): GameState => this.state;

  subscribe = (fn: Listener): (() => void) => {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  };

  onEvents(fn: EventListener): () => void {
    this.eventListeners.add(fn);
    return () => this.eventListeners.delete(fn);
  }

  /** Wird ausgelöst, wenn der ganze Stand ersetzt wurde (Code geladen, neu begonnen). */
  onReload(fn: Listener): () => void {
    this.reloadListeners.add(fn);
    return () => this.reloadListeners.delete(fn);
  }

  dispatch(action: Action): GameEvent[] {
    const r = reduce(this.state, action, this.content);
    if (r.changed) {
      this.state = r.state;
      this.save.request(r.state);
    }
    for (const fn of this.eventListeners) fn(r.events, action);
    if (r.changed) for (const fn of this.listeners) fn();
    return r.events;
  }

  replaceState(state: GameState): void {
    this.state = state;
    this.save.request(state);
    for (const fn of this.reloadListeners) fn();
    for (const fn of this.listeners) fn();
  }

  flush(): Promise<void> {
    return this.save.flush();
  }
}
