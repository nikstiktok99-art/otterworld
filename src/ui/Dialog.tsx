import { useState } from 'react';
import { characterName, fillText } from '../game/text';
import { NAME_MAX } from '../game/rules/name';
import { useApp, useGameState, useUi } from './context';
import { portraitSrc } from './portraits';

export function NameForm({ onSubmit, initial = '' }: { onSubmit: (name: string) => string | null; initial?: string }) {
  const [value, setValue] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const submit = () => setError(onSubmit(value));
  return (
    <form
      className="name-form"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <label className="label" htmlFor="name-input">
        Dein Name
      </label>
      <input
        id="name-input"
        className="text-input"
        value={value}
        maxLength={NAME_MAX}
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        enterKeyHint="done"
        onChange={(e) => setValue(e.target.value)}
      />
      {error && <p className="error">{error}</p>}
      <button className="btn primary" type="submit" disabled={value.trim().length === 0}>
        Passt so
      </button>
    </form>
  );
}

export function DialogPanel() {
  const { dialogs, content } = useApp();
  const state = useGameState();
  const ui = useUi();
  if (ui.panel?.kind !== 'dialog') return null;
  const line = dialogs.currentLine();
  if (!line) return null;

  if ('askName' in line) {
    return (
      <div className="backdrop top">
        <div className="sheet name-sheet" role="dialog" aria-label="Namen wählen">
          <p className="dialog-text">Wie möchtest du heißen?</p>
          <NameForm onSubmit={(n) => dialogs.submitName(n)} />
        </div>
      </div>
    );
  }

  const speaker = line.speaker;
  const portrait = speaker ? portraitSrc(content.characters[speaker]?.portrait) : null;
  const choices = line.choices ?? [];
  return (
    <div className="backdrop clear" onClick={() => dialogs.next()}>
      <div className="sheet dialog" role="dialog" aria-live="polite">
        <span className="ribbon" aria-hidden="true" />
        {speaker && (
          <div className="speaker">
            {portrait && (
              <span className="portrait-frame">
                <img className="portrait" src={portrait} alt="" />
              </span>
            )}
            <span className="speaker-name">{characterName(speaker, state, content)}</span>
          </div>
        )}
        <p className={speaker ? 'dialog-text' : 'dialog-text narration'}>{fillText(line.text, state)}</p>
        {choices.length > 0 ? (
          <div className="choices">
            {choices.map((c, i) => (
              <button
                key={c.label}
                className={c.then === 'weiter' ? 'btn primary' : 'btn'}
                onClick={(e) => {
                  e.stopPropagation();
                  dialogs.choose(i);
                }}
              >
                {fillText(c.label, state)}
              </button>
            ))}
          </div>
        ) : (
          <p className="tap-hint">Tippen zum Weiterlesen</p>
        )}
      </div>
    </div>
  );
}
