// Speicher: auf dem iPhone/Android der native Speicher (Capacitor Preferences,
// auf iOS = UserDefaults). Den kann iOS nicht einfach leeren – den WebView-Speicher schon.
// Im Browser: localStorage als Ersatz.
(function () {
  const SCHLUESSEL = 'otterwelt.spielstand.v1';
  const cap = window.Capacitor;
  const nativ = !!(cap && cap.isNativePlatform && cap.isNativePlatform() &&
                   cap.Plugins && cap.Plugins.Preferences);
  const Prefs = nativ ? cap.Plugins.Preferences : null;

  async function lesen() {
    try {
      let roh = null;
      if (Prefs) roh = (await Prefs.get({ key: SCHLUESSEL })).value;
      else roh = localStorage.getItem(SCHLUESSEL);
      return roh ? JSON.parse(roh) : null;
    } catch (e) {
      console.warn('Speicher lesen fehlgeschlagen', e);
      return null;
    }
  }

  async function schreiben(stand) {
    const roh = JSON.stringify(stand);
    try {
      if (Prefs) await Prefs.set({ key: SCHLUESSEL, value: roh });
      else localStorage.setItem(SCHLUESSEL, roh);
      return true;
    } catch (e) {
      console.warn('Speicher schreiben fehlgeschlagen', e);
      return false;
    }
  }

  // Spielstand als Text-Code (Sicherheitsnetz, falls die App doch mal weg ist)
  function alsCode(stand) {
    const json = JSON.stringify(stand);
    const b64 = btoa(unescape(encodeURIComponent(json)));
    return 'OTTER1-' + b64;
  }
  function ausCode(code) {
    const sauber = String(code || '').trim().replace(/\s+/g, '');
    if (!sauber.startsWith('OTTER1-')) throw new Error('Das ist kein Otterwelt-Code.');
    const json = decodeURIComponent(escape(atob(sauber.slice(7))));
    const stand = JSON.parse(json);
    if (!stand || typeof stand !== 'object' || stand.v !== 1) throw new Error('Code ist beschädigt.');
    return stand;
  }

  window.Speicher = { lesen, schreiben, alsCode, ausCode, art: nativ ? 'nativ (Preferences)' : 'Browser (localStorage)' };
})();
