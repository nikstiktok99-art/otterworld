// Otterwelt – Durchstich 1a
// Ziel: beweisen, dass Bild, Tippen, Bewegung, Ton, Speichern und Safe Areas auf dem iPhone laufen.
(function () {
  'use strict';
  const VERSION = '0.1.0 (1a)';
  const $ = (id) => document.getElementById(id);
  const canvas = $('welt');
  const ctx = canvas.getContext('2d');
  const cap = window.Capacitor;
  const plattform = cap && cap.getPlatform ? cap.getPlatform() : 'web';
  $('version').textContent = 'Version ' + VERSION + ' · ' + plattform;

  // ---------- Spielstand ----------
  const neuerStand = () => ({
    v: 1,
    otter: { x: 0.5, y: 0.6 },   // relativ zur Spielfläche (0..1)
    muscheln: 0,
    liegend: [],                 // Muscheln auf dem Boden, relativ
    gespeichert: 0,
    speicherZaehler: 0,
  });
  let stand = neuerStand();
  let ungespeichert = false;
  let letzteSpeicherung = '–';

  async function speichern(grund) {
    stand.gespeichert = Date.now();
    stand.speicherZaehler++;
    const ok = await Speicher.schreiben(stand);
    ungespeichert = !ok;
    letzteSpeicherung = new Date().toLocaleTimeString('de-DE') + ' (' + grund + (ok ? '' : ', FEHLER') + ')';
  }

  // ---------- Größe & Safe Areas ----------
  let B = 0, H = 0, dpr = 1;
  const sicher = { oben: 0, unten: 0, links: 0, rechts: 0 };
  const probe = document.createElement('div');
  probe.style.cssText = 'position:absolute;visibility:hidden;pointer-events:none;' +
    'padding:env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)';
  document.body.appendChild(probe);

  function groesse() {
    dpr = Math.min(window.devicePixelRatio || 1, 3);
    B = window.innerWidth; H = window.innerHeight;
    canvas.width = Math.round(B * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const cs = getComputedStyle(probe);
    sicher.oben = parseFloat(cs.paddingTop) || 0;
    sicher.rechts = parseFloat(cs.paddingRight) || 0;
    sicher.unten = parseFloat(cs.paddingBottom) || 0;
    sicher.links = parseFloat(cs.paddingLeft) || 0;
  }
  window.addEventListener('resize', groesse);
  groesse();

  // Spielfläche = Bildschirm minus Safe Areas minus HUD-Zeile
  function feld() {
    const oben = sicher.oben + 56;
    const unten = sicher.unten + 12;
    return { x: sicher.links + 12, y: oben, w: B - sicher.links - sicher.rechts - 24, h: H - oben - unten };
  }
  const zuPx = (p) => { const f = feld(); return { x: f.x + p.x * f.w, y: f.y + p.y * f.h }; };
  const zuRel = (x, y) => { const f = feld(); return {
    x: Math.min(1, Math.max(0, (x - f.x) / f.w)),
    y: Math.min(1, Math.max(0, (y - f.y) / f.h)) }; };

  // ---------- Ton (erst nach dem ersten Tipp – verlangt iOS) ----------
  let audio = null;
  function tonFreischalten() {
    if (audio) { if (audio.state === 'suspended') audio.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    audio = new AC();
    // stummer Puffer zum Freischalten
    const b = audio.createBuffer(1, 1, 22050);
    const s = audio.createBufferSource(); s.buffer = b; s.connect(audio.destination); s.start(0);
  }
  function plopp(hoehe) {
    if (!audio || audio.state !== 'running') return;
    const t = audio.currentTime;
    const o = audio.createOscillator(), g = audio.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(hoehe, t);
    o.frequency.exponentialRampToValueAtTime(hoehe * 1.8, t + 0.08);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.25, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
    o.connect(g); g.connect(audio.destination);
    o.start(t); o.stop(t + 0.2);
  }

  // ---------- Muscheln ----------
  function muschelnAuffuellen() {
    while (stand.liegend.length < 5) {
      stand.liegend.push({ x: 0.08 + Math.random() * 0.84, y: 0.35 + Math.random() * 0.6, d: Math.random() * 6.28 });
    }
  }

  // ---------- Eingabe ----------
  let ziel = null;
  let laeuft = false;
  canvas.addEventListener('pointerdown', (e) => {
    if (!laeuft) return;
    e.preventDefault();
    tonFreischalten();
    ziel = zuRel(e.clientX, e.clientY);
    ziel.y = Math.max(0.3, ziel.y); // nicht ins Wasser laufen
    plopp(330);
  });
  // Lange-Drücken-Menü und Doppeltipp-Zoom unterbinden
  document.addEventListener('contextmenu', (e) => e.preventDefault());
  document.addEventListener('gesturestart', (e) => e.preventDefault());
  document.addEventListener('dblclick', (e) => e.preventDefault(), { passive: false });
  document.addEventListener('touchmove', (e) => {
    if (e.target.tagName !== 'TEXTAREA') e.preventDefault();
  }, { passive: false });

  // ---------- Zeichnen ----------
  function zeichneWelt(t) {
    // Wasser
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#9fd8e8'); g.addColorStop(1, '#4fa6bf');
    ctx.fillStyle = g; ctx.fillRect(0, 0, B, H);
    // Wellen
    ctx.strokeStyle = '#ffffff55'; ctx.lineWidth = 2;
    for (let i = 0; i < 8; i++) {
      const y = (H / 8) * i + 20;
      ctx.beginPath();
      for (let x = 0; x <= B; x += 12) ctx.lineTo(x, y + Math.sin(x / 30 + t * 1.5 + i) * 3);
      ctx.stroke();
    }
    // Sandinsel = Spielfläche
    const f = feld();
    ctx.fillStyle = '#f2dcab';
    rund(f.x, f.y + f.h * 0.25, f.w, f.h * 0.75, 40); ctx.fill();
    ctx.fillStyle = '#e6c98d';
    rund(f.x + 10, f.y + f.h * 0.25 + 10, f.w - 20, 14, 7); ctx.fill();
  }

  function rund(x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function zeichneMuschel(m, t) {
    const p = zuPx(m);
    const s = 1 + Math.sin(t * 3 + m.d) * 0.08;
    ctx.save(); ctx.translate(p.x, p.y); ctx.scale(s, s);
    ctx.fillStyle = '#f7a8b8';
    ctx.beginPath(); ctx.moveTo(0, 8); ctx.arc(0, 0, 11, Math.PI * 1.05, Math.PI * 1.95); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#d9788d'; ctx.lineWidth = 1.5;
    for (let a = -3; a <= 3; a++) { ctx.beginPath(); ctx.moveTo(0, 8); ctx.lineTo(a * 3.2, -9); ctx.stroke(); }
    ctx.restore();
  }

  // Platzhalter-Otter aus einfachen Formen
  let blick = 1, schritt = 0;
  function zeichneOtter(t, bewegt) {
    const p = zuPx(stand.otter);
    const hop = bewegt ? Math.abs(Math.sin(schritt * 9)) * 4 : Math.sin(t * 2) * 1.2;
    ctx.save();
    ctx.translate(p.x, p.y);
    // Schatten
    ctx.fillStyle = '#0002';
    ctx.beginPath(); ctx.ellipse(0, 22, 26, 7, 0, 0, Math.PI * 2); ctx.fill();
    ctx.translate(0, -hop);
    ctx.scale(blick, 1);
    // Schwanz
    ctx.fillStyle = '#7a4a2a';
    ctx.beginPath(); ctx.ellipse(-26, 14, 16, 6, -0.4, 0, Math.PI * 2); ctx.fill();
    // Körper
    ctx.fillStyle = '#8b5a35';
    ctx.beginPath(); ctx.ellipse(0, 4, 22, 20, 0, 0, Math.PI * 2); ctx.fill();
    // Bauch
    ctx.fillStyle = '#d9b48a';
    ctx.beginPath(); ctx.ellipse(6, 8, 12, 13, 0, 0, Math.PI * 2); ctx.fill();
    // Kopf
    ctx.fillStyle = '#8b5a35';
    ctx.beginPath(); ctx.arc(10, -20, 15, 0, Math.PI * 2); ctx.fill();
    // Ohren
    ctx.beginPath(); ctx.arc(0, -32, 4.5, 0, Math.PI * 2); ctx.arc(20, -32, 4.5, 0, Math.PI * 2); ctx.fill();
    // Schnauze
    ctx.fillStyle = '#e6c9a3';
    ctx.beginPath(); ctx.ellipse(16, -15, 8, 6, 0, 0, Math.PI * 2); ctx.fill();
    // Nase & Augen
    ctx.fillStyle = '#2a1a10';
    ctx.beginPath(); ctx.arc(19, -18, 2.8, 0, Math.PI * 2); ctx.fill();
    const zwinkern = (t % 4) < 0.12;
    if (zwinkern) { ctx.fillRect(3, -24, 5, 1.5); ctx.fillRect(15, -25, 5, 1.5); }
    else { ctx.beginPath(); ctx.arc(5.5, -24, 2.2, 0, Math.PI * 2); ctx.arc(17, -25, 2.2, 0, Math.PI * 2); ctx.fill(); }
    // Schnurrhaare
    ctx.strokeStyle = '#2a1a1066'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(22, -14); ctx.lineTo(30, -16); ctx.moveTo(22, -12); ctx.lineTo(30, -11); ctx.stroke();
    ctx.restore();
  }

  // ---------- Schleife (zeitbasiert, nicht bildratenbasiert) ----------
  const TEMPO = 0.32; // Anteil der Spielfeldbreite pro Sekunde
  let alt = performance.now(), fpsBilder = 0, fpsZeit = 0, fps = 0;
  function schleife(jetzt) {
    let dt = (jetzt - alt) / 1000; alt = jetzt;
    if (dt > 0.1) dt = 0.1; // nach Pause/Hintergrund nicht springen
    const t = jetzt / 1000;
    fpsBilder++; fpsZeit += dt;
    if (fpsZeit >= 0.5) { fps = Math.round(fpsBilder / fpsZeit); fpsBilder = 0; fpsZeit = 0; }

    let bewegt = false;
    if (ziel && laeuft) {
      const f = feld();
      const dx = (ziel.x - stand.otter.x) * f.w, dy = (ziel.y - stand.otter.y) * f.h;
      const dist = Math.hypot(dx, dy);
      const weg = TEMPO * f.w * dt;
      if (dist <= weg) { stand.otter.x = ziel.x; stand.otter.y = ziel.y; ziel = null; }
      else {
        stand.otter.x += (dx / dist) * weg / f.w;
        stand.otter.y += (dy / dist) * weg / f.h;
        bewegt = true;
        if (Math.abs(dx) > 2) blick = dx > 0 ? 1 : -1;
      }
      ungespeichert = true;
    }
    if (bewegt) schritt += dt;

    // Muscheln einsammeln
    const op = zuPx(stand.otter);
    for (let i = stand.liegend.length - 1; i >= 0; i--) {
      const mp = zuPx(stand.liegend[i]);
      if (Math.hypot(mp.x - op.x, mp.y - op.y) < 30) {
        stand.liegend.splice(i, 1);
        stand.muscheln++;
        plopp(660);
        muschelnAuffuellen();
        speichern('Muschel');
      }
    }

    zeichneWelt(t);
    // Tiefe: was weiter unten ist, liegt vorne
    const dinge = stand.liegend.map((m) => ({ y: m.y, z: () => zeichneMuschel(m, t) }));
    dinge.push({ y: stand.otter.y, z: () => zeichneOtter(t, bewegt) });
    dinge.sort((a, b) => a.y - b.y).forEach((d) => d.z());

    if (ziel) {
      const zp = zuPx(ziel);
      ctx.strokeStyle = '#fff9'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(zp.x, zp.y, 8 + Math.sin(t * 8) * 2, 0, Math.PI * 2); ctx.stroke();
    }

    $('muscheln').textContent = 'Muscheln: ' + stand.muscheln;
    if (!$('technik').classList.contains('versteckt')) technikText();
    requestAnimationFrame(schleife);
  }

  function technikText() {
    $('technik').textContent =
      'Plattform: ' + plattform + '\n' +
      'Speicher:  ' + Speicher.art + '\n' +
      'Zuletzt gespeichert: ' + letzteSpeicherung + '\n' +
      'Speichervorgänge gesamt: ' + stand.speicherZaehler + '\n' +
      'Safe Area: oben ' + sicher.oben + ' · unten ' + sicher.unten +
        ' · links ' + sicher.links + ' · rechts ' + sicher.rechts + '\n' +
      'Bildschirm: ' + B + '×' + H + ' @' + dpr + 'x · ' + fps + ' FPS\n' +
      'Ton: ' + (audio ? audio.state : 'noch nicht freigeschaltet');
  }

  // ---------- Hintergrund: sofort speichern ----------
  // iOS gibt einer App beim Wechsel in den Hintergrund nur wenige Sekunden.
  function imHintergrund() { if (laeuft) speichern('Hintergrund'); }
  document.addEventListener('visibilitychange', () => { if (document.hidden) imHintergrund(); });
  window.addEventListener('pagehide', imHintergrund);
  if (cap && cap.Plugins && cap.Plugins.App) {
    cap.Plugins.App.addListener('appStateChange', (s) => {
      if (!s.isActive) imHintergrund();
      else if (audio && audio.state !== 'running') audio.resume();
    });
  }
  // Zusätzlich alle 10 Sekunden, falls sich etwas bewegt hat
  setInterval(() => { if (laeuft && ungespeichert) speichern('automatisch'); }, 10000);

  // ---------- Menü & Spielstand-Code ----------
  const zeige = (id) => $(id).classList.remove('versteckt');
  const verstecke = (id) => $(id).classList.add('versteckt');

  $('menuKnopf').addEventListener('click', () => { tonFreischalten(); zeige('menu'); });
  $('zu').addEventListener('click', () => verstecke('menu'));
  $('test').addEventListener('click', () => {
    $('technik').classList.toggle('versteckt');
    $('test').textContent = $('technik').classList.contains('versteckt') ? 'Technik-Test anzeigen' : 'Technik-Test ausblenden';
    verstecke('menu');
  });

  let codeModus = 'sichern';
  $('sichern').addEventListener('click', async () => {
    await speichern('manuell');
    codeModus = 'sichern';
    $('codeTitel').textContent = 'Spielstand sichern';
    $('codeHilfe').textContent = 'Diesen Code kopieren und z. B. in Notizen aufheben. Damit lässt sich der Spielstand jederzeit wiederherstellen.';
    $('codeFeld').value = Speicher.alsCode(stand);
    $('codeFeld').readOnly = true;
    $('codeAktion').textContent = 'Kopieren';
    verstecke('menu'); zeige('code');
  });
  $('laden').addEventListener('click', () => {
    codeModus = 'laden';
    $('codeTitel').textContent = 'Spielstand laden';
    $('codeHilfe').textContent = 'Gesicherten Code hier einfügen. Achtung: Der aktuelle Spielstand wird ersetzt.';
    $('codeFeld').value = '';
    $('codeFeld').readOnly = false;
    $('codeAktion').textContent = 'Laden';
    verstecke('menu'); zeige('code');
  });
  $('codeAktion').addEventListener('click', async () => {
    const feldEl = $('codeFeld');
    if (codeModus === 'sichern') {
      try { await navigator.clipboard.writeText(feldEl.value); $('codeAktion').textContent = 'Kopiert'; }
      catch (e) { feldEl.readOnly = false; feldEl.focus(); feldEl.select(); $('codeHilfe').textContent = 'Bitte Text markieren und kopieren.'; }
    } else {
      try {
        stand = Speicher.ausCode(feldEl.value);
        muschelnAuffuellen();
        await speichern('Code geladen');
        verstecke('code');
      } catch (e) { $('codeHilfe').textContent = e.message; }
    }
  });
  $('codeZu').addEventListener('click', () => verstecke('code'));

  // ---------- Start ----------
  $('los').addEventListener('click', () => {
    tonFreischalten();
    plopp(440);
    verstecke('start');
    laeuft = true;
  });

  (async function init() {
    if (cap && cap.Plugins && cap.Plugins.StatusBar) {
      try { await cap.Plugins.StatusBar.setOverlaysWebView({ overlay: true }); } catch (e) {}
    }
    const geladen = await Speicher.lesen();
    if (geladen && geladen.v === 1) {
      stand = geladen;
      $('los').textContent = 'Weiterspielen (' + stand.muscheln + (stand.muscheln === 1 ? ' Muschel)' : ' Muscheln)');
      letzteSpeicherung = new Date(stand.gespeichert).toLocaleString('de-DE') + ' (geladen)';
    }
    muschelnAuffuellen();
    groesse();
    requestAnimationFrame(schleife);
  })();
})();
