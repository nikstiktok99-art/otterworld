// Ablauf eines Gesprächs: Zeilen weiterschalten, Namensfrage, Signale an die Welt, Abschluss über die Spielregeln.
import type { DialogueLine } from '../content/types';
import { selectDialogue } from '../game/text';
import type { GameSession } from './session';
import type { Sound } from './sound';
import type { UiStore } from './ui';

export class DialogController {
  constructor(
    private readonly session: GameSession,
    private readonly ui: UiStore,
    private readonly sound: Sound,
  ) {}

  /** Startet das passende Gespräch dieser Figur. Liefert false, wenn es keins gibt. */
  start(character: string): boolean {
    const dlg = selectDialogue(character, this.session.getState(), this.session.content);
    if (!dlg) return false;
    this.ui.open({ kind: 'dialog', dialogue: dlg.id, character, line: 0 });
    this.skipAnsweredQuestions();
    this.fireCue();
    return true;
  }

  currentLine(): DialogueLine | null {
    const p = this.ui.getState().panel;
    if (p?.kind !== 'dialog') return null;
    const dlg = this.session.content.dialogues.find((d) => d.id === p.dialogue);
    return dlg?.lines[p.line] ?? null;
  }

  /** Nächste Zeile; bei der Namensfrage geht es nur über submitName weiter. */
  next(): void {
    const p = this.ui.getState().panel;
    if (p?.kind !== 'dialog') return;
    const line = this.currentLine();
    if (line && 'askName' in line) return;
    const dlg = this.session.content.dialogues.find((d) => d.id === p.dialogue);
    if (!dlg) {
      this.ui.close();
      return;
    }
    if (p.line + 1 >= dlg.lines.length) {
      this.finish(dlg.id);
      return;
    }
    this.sound.play('sfx.dialog');
    this.ui.open({ ...p, line: p.line + 1 });
    this.skipAnsweredQuestions();
    this.fireCue();
  }

  /** Liefert eine Fehlermeldung oder null, wenn der Name übernommen wurde. */
  submitName(name: string): string | null {
    const events = this.session.dispatch({ type: 'setPlayerName', name });
    if (events.some((e) => e.type === 'rejected')) {
      return 'Bitte 1–16 Buchstaben oder Ziffern (auch Leerzeichen und Bindestrich).';
    }
    const p = this.ui.getState().panel;
    if (p?.kind === 'dialog') {
      this.ui.open({ ...p, line: p.line + 1 });
      this.fireCue();
    }
    return null;
  }

  private skipAnsweredQuestions(): void {
    const line = this.currentLine();
    const p = this.ui.getState().panel;
    if (line && 'askName' in line && this.session.getState().player.name && p?.kind === 'dialog') {
      this.ui.open({ ...p, line: p.line + 1 });
    }
  }

  private fireCue(): void {
    const line = this.currentLine();
    if (line && 'cue' in line && line.cue) this.ui.cue(line.cue);
  }

  private finish(dialogue: string): void {
    const events = this.session.dispatch({ type: 'finishDialogue', dialogue });
    const done = events.find((e) => e.type === 'questDone');
    if (done?.type === 'questDone') {
      this.sound.play('sfx.leuchte');
      const unlocked = events.flatMap((e) => (e.type === 'unlocked' ? [e.character] : []));
      this.ui.open({ kind: 'endcard', quest: done.quest, unlocked });
    } else {
      this.ui.close();
    }
  }
}
