import './ui/styles.css';
import { boot } from './app/boot';

function showFatal(e: unknown) {
  const el = document.getElementById('ui') ?? document.body;
  const box = document.createElement('div');
  box.className = 'fatal';
  box.textContent = `Otterwelt konnte nicht starten.\n\n${e instanceof Error ? `${e.message}\n\n${e.stack ?? ''}` : String(e)}`;
  el.appendChild(box);
}

boot()
  .then((dispose) => {
    // Beim Neuladen im Entwicklungsmodus alles sauber abräumen (keine doppelten Listener oder Szenen).
    if (import.meta.hot) import.meta.hot.dispose(dispose);
  })
  .catch(showFatal);
