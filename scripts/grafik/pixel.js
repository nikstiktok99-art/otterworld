// Läuft im Browser (siehe browser.mjs). Kleine Pixel-Werkzeuge auf Canvas-Basis, global unter window.G.
(() => {
  const G = { img: {}, part: {} };
  window.G = G;

  const canvas = (w, h) => {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    return c;
  };

  G.load = async (name, url) => {
    const im = new Image();
    im.src = url;
    await im.decode();
    const c = canvas(im.naturalWidth, im.naturalHeight);
    const x = c.getContext('2d');
    x.drawImage(im, 0, 0);
    G.img[name] = x.getImageData(0, 0, c.width, c.height);
    return [c.width, c.height];
  };

  /** Zusammenhängende Motive (Alpha >= alphaMin) auf einem groben Raster; liefert Begrenzungsrahmen. */
  G.components = (name, { alphaMin = 128, step = 4, minArea = 400 } = {}) => {
    const im = G.img[name];
    const W = Math.ceil(im.width / step);
    const H = Math.ceil(im.height / step);
    const on = new Uint8Array(W * H);
    for (let y = 0; y < H; y++)
      for (let x = 0; x < W; x++) {
        const sx = Math.min(im.width - 1, x * step + (step >> 1));
        const sy = Math.min(im.height - 1, y * step + (step >> 1));
        on[y * W + x] = im.data[(sy * im.width + sx) * 4 + 3] >= alphaMin ? 1 : 0;
      }
    const seen = new Uint8Array(W * H);
    const out = [];
    for (let i = 0; i < W * H; i++) {
      if (!on[i] || seen[i]) continue;
      let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1, n = 0;
      const stack = [i];
      seen[i] = 1;
      while (stack.length) {
        const j = stack.pop();
        const x = j % W;
        const y = (j / W) | 0;
        n++;
        if (x < x0) x0 = x;
        if (y < y0) y0 = y;
        if (x > x1) x1 = x;
        if (y > y1) y1 = y;
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
          const k = ny * W + nx;
          if (on[k] && !seen[k]) {
            seen[k] = 1;
            stack.push(k);
          }
        }
      }
      if (n * step * step >= minArea) out.push({ x: x0 * step, y: y0 * step, w: (x1 - x0 + 1) * step, h: (y1 - y0 + 1) * step, area: n * step * step });
    }
    return out.sort((a, b) => a.y - b.y || a.x - b.x);
  };

  G.alphaHist = (name) => {
    const d = G.img[name].data;
    const h = new Array(8).fill(0);
    for (let i = 3; i < d.length; i += 4) h[d[i] >> 5]++;
    return h;
  };

  const lum = (r, g, b) => r * 0.299 + g * 0.587 + b * 0.114;

  /**
   * Schneidet ein Motiv aus und verkleinert es pixelgenau.
   * spec: { id, src, rect:[x,y,w,h], w?, h? (Zielgröße; eine davon reicht), alphaMin=128, cover=0.5,
   *         poly?: [[x,y],...] (Maske in Quellkoordinaten, für deckende Entwürfe), flip?, trim=true }
   * Farbe je Zielpixel: Pixel mit mittlerer Helligkeit aus dem inneren Teil der Zelle (hält Konturen klar).
   */
  G.sprite = (spec) => {
    const im = G.img[spec.src];
    const alphaMin = spec.alphaMin ?? 128;
    let [rx, ry, rw, rh] = spec.rect ?? [0, 0, im.width, im.height];
    let mask = null;
    if (spec.poly) {
      const m = canvas(im.width, im.height);
      const mx = m.getContext('2d');
      mx.beginPath();
      spec.poly.forEach(([x, y], i) => (i ? mx.lineTo(x, y) : mx.moveTo(x, y)));
      mx.closePath();
      mx.fill();
      mask = mx.getImageData(0, 0, im.width, im.height).data;
    }
    const opaqueAt = (x, y) => {
      const i = (y * im.width + x) * 4;
      if (mask && mask[i + 3] < 128) return false;
      if (spec.key) {
        const [kr, kg, kb, tol] = spec.key;
        if (Math.abs(im.data[i] - kr) + Math.abs(im.data[i + 1] - kg) + Math.abs(im.data[i + 2] - kb) < tol) return false;
      }
      return im.data[i + 3] >= alphaMin;
    };
    // Auf das tatsächliche Motiv zuschneiden
    if (spec.trim !== false) {
      let x0 = rx + rw, y0 = ry + rh, x1 = rx - 1, y1 = ry - 1;
      for (let y = ry; y < ry + rh; y++)
        for (let x = rx; x < rx + rw; x++)
          if (opaqueAt(x, y)) {
            if (x < x0) x0 = x;
            if (x > x1) x1 = x;
            if (y < y0) y0 = y;
            if (y > y1) y1 = y;
          }
      rx = x0; ry = y0; rw = x1 - x0 + 1; rh = y1 - y0 + 1;
    }
    let tw = spec.w;
    let th = spec.h;
    if (!tw) tw = Math.max(1, Math.round((rw * th) / rh));
    if (!th) th = Math.max(1, Math.round((rh * tw) / rw));
    const sx = rw / tw;
    const sy = rh / th;
    const out = canvas(tw, th);
    const ox = out.getContext('2d');
    const od = ox.createImageData(tw, th);
    const cover = spec.cover ?? 0.5;
    const inner = spec.inner ?? 0.25;
    for (let ty = 0; ty < th; ty++)
      for (let tx = 0; tx < tw; tx++) {
        const cx0 = rx + tx * sx, cx1 = rx + (tx + 1) * sx;
        const cy0 = ry + ty * sy, cy1 = ry + (ty + 1) * sy;
        let n = 0, on = 0;
        for (let y = Math.floor(cy0); y < Math.ceil(cy1); y++)
          for (let x = Math.floor(cx0); x < Math.ceil(cx1); x++) {
            n++;
            if (opaqueAt(x, y)) on++;
          }
        if (!n || on / n < cover) continue;
        const ix0 = Math.floor(cx0 + (cx1 - cx0) * inner), ix1 = Math.max(ix0 + 1, Math.ceil(cx1 - (cx1 - cx0) * inner));
        const iy0 = Math.floor(cy0 + (cy1 - cy0) * inner), iy1 = Math.max(iy0 + 1, Math.ceil(cy1 - (cy1 - cy0) * inner));
        const pick = (a0, a1, b0, b1) => {
          const list = [];
          for (let y = b0; y < b1; y++)
            for (let x = a0; x < a1; x++)
              if (opaqueAt(x, y)) {
                const i = (y * im.width + x) * 4;
                list.push([lum(im.data[i], im.data[i + 1], im.data[i + 2]), i]);
              }
          return list;
        };
        let list = pick(ix0, ix1, iy0, iy1);
        if (!list.length) list = pick(Math.floor(cx0), Math.ceil(cx1), Math.floor(cy0), Math.ceil(cy1));
        list.sort((a, b) => a[0] - b[0]);
        const i = list[(list.length / 2) | 0][1];
        const o = (ty * tw + tx) * 4;
        od.data[o] = im.data[i];
        od.data[o + 1] = im.data[i + 1];
        od.data[o + 2] = im.data[i + 2];
        od.data[o + 3] = 255;
      }
    ox.putImageData(od, 0, 0);
    let result = out;
    if (spec.flip) {
      const f = canvas(tw, th);
      const fx = f.getContext('2d');
      fx.translate(tw, 0);
      fx.scale(-1, 1);
      fx.drawImage(out, 0, 0);
      result = f;
    }
    G.part[spec.id] = result;
    return { id: spec.id, w: tw, h: th, src: [rx, ry, rw, rh] };
  };


  /** Farbton/Sättigung/Helligkeit verschieben (nur warme, nicht zu dunkle Pixel, Kontur bleibt). */
  G.hsl = (id, newId, dh, ds, dl) => {
    const src = G.part[id];
    const c = canvas(src.width, src.height);
    const x = c.getContext('2d');
    x.drawImage(src, 0, 0);
    const d = x.getImageData(0, 0, c.width, c.height);
    for (let i = 0; i < d.data.length; i += 4) {
      if (!d.data[i + 3]) continue;
      const r = d.data[i] / 255, g = d.data[i + 1] / 255, b = d.data[i + 2] / 255;
      const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
      let h = 0, s = 0;
      const l = (mx + mn) / 2;
      if (mx !== mn) {
        const dd = mx - mn;
        s = l > 0.5 ? dd / (2 - mx - mn) : dd / (mx + mn);
        h = mx === r ? (g - b) / dd + (g < b ? 6 : 0) : mx === g ? (b - r) / dd + 2 : (r - g) / dd + 4;
        h *= 60;
      }
      if (l < 0.22 || s < 0.12 || (h > 60 && h < 330)) continue;
      const H = (h + dh + 360) % 360, S = Math.min(1, Math.max(0, s + ds)), L = Math.min(1, Math.max(0, l + dl));
      const q = L < 0.5 ? L * (1 + S) : L + S - L * S, p = 2 * L - q;
      const f = (t) => {
        t = (t + 1) % 1;
        return t < 1 / 6 ? p + (q - p) * 6 * t : t < 1 / 2 ? q : t < 2 / 3 ? p + (q - p) * (2 / 3 - t) * 6 : p;
      };
      d.data[i] = Math.round(f(H / 360 + 1 / 3) * 255);
      d.data[i + 1] = Math.round(f(H / 360) * 255);
      d.data[i + 2] = Math.round(f(H / 360 - 1 / 3) * 255);
    }
    x.putImageData(d, 0, 0);
    G.part[newId] = c;
  };

  /** Kleines Pixelbild als eigenes Teil (Zeilen, Buchstabe = Farbe, Punkt = frei). */
  G.pix = (id, rows, cols) => {
    const c = canvas(rows[0].length, rows.length);
    const x = c.getContext('2d');
    rows.forEach((row, y) => [...row].forEach((ch, xx) => {
      if (ch === '.') return;
      x.fillStyle = cols[ch];
      x.fillRect(xx, y, 1, 1);
    }));
    G.part[id] = c;
    return { id, w: c.width, h: c.height };
  };
  /** Färbt einen Teil um (z. B. Lumi aus dem Otter): Liste [[von, nach, toleranz]] als Hex. */
  G.recolor = (id, newId, pairs) => {
    const src = G.part[id];
    const c = canvas(src.width, src.height);
    const x = c.getContext('2d');
    x.drawImage(src, 0, 0);
    const d = x.getImageData(0, 0, c.width, c.height);
    const hex = (h) => [1, 3, 5].map((k) => parseInt(h.slice(k, k + 2), 16));
    for (let i = 0; i < d.data.length; i += 4) {
      if (!d.data[i + 3]) continue;
      for (const [from, to, tol] of pairs) {
        const [a, b, cc] = hex(from);
        if (Math.abs(d.data[i] - a) + Math.abs(d.data[i + 1] - b) + Math.abs(d.data[i + 2] - cc) <= tol) {
          [d.data[i], d.data[i + 1], d.data[i + 2]] = hex(to);
          break;
        }
      }
    }
    x.putImageData(d, 0, 0);
    G.part[newId] = c;
  };

  /**
   * Setzt Teile zu einem Streifen gleich großer Frames zusammen.
   * spec: { w, h, frames: [ [ {id, x, y, sy?} ... ] ] } – x/y = linke obere Ecke im Frame;
   *        sy: vertikale Stauchung in Pixeln (Atmen), am Boden verankert.
   * outline: Hexfarbe – zieht eine 1-px-Kontur um alles Deckende (nach außen).
   */
  G.strip = (spec) => {
    const n = spec.frames.length;
    const c = canvas(spec.w * n, spec.h);
    const x = c.getContext('2d');
    x.imageSmoothingEnabled = false;
    spec.frames.forEach((parts, f) => {
      const fc = canvas(spec.w, spec.h);
      const fx = fc.getContext('2d');
      fx.imageSmoothingEnabled = false;
      for (const p of parts) {
        const img = G.part[p.id];
        const sy = p.sy ?? 0;
        fx.drawImage(img, 0, 0, img.width, img.height, p.x, p.y + sy, img.width, img.height - sy);
      }
      if (spec.dress && spec.dress[f]) {
        // Kleid: Fell und helle Brust innerhalb des Umrisses nach Helligkeit in Rosatöne umfärben (Kontur bleibt).
        const m = canvas(spec.w, spec.h);
        const mx = m.getContext('2d');
        mx.beginPath();
        spec.dress[f].forEach(([x, y], i) => (i ? mx.lineTo(x, y) : mx.moveTo(x, y)));
        mx.closePath();
        mx.fill();
        const md = mx.getImageData(0, 0, spec.w, spec.h).data;
        const d = fx.getImageData(0, 0, spec.w, spec.h);
        const hex = (h) => [1, 3, 5].map((k) => parseInt(h.slice(k, k + 2), 16));
        const ramp = spec.ramp.map(hex);
        for (let i = 0; i < d.data.length; i += 4) {
          if (!d.data[i + 3] || md[i + 3] < 128) continue;
          const l = (Math.max(d.data[i], d.data[i + 1], d.data[i + 2]) + Math.min(d.data[i], d.data[i + 1], d.data[i + 2])) / 510;
          if (l < 0.22) continue;
          const c = l < 0.36 ? ramp[0] : l < 0.5 ? ramp[1] : l < 0.68 ? ramp[2] : ramp[3];
          [d.data[i], d.data[i + 1], d.data[i + 2]] = c;
        }
        fx.putImageData(d, 0, 0);
      }
      if (spec.outline) {
        const d = fx.getImageData(0, 0, spec.w, spec.h);
        const a = (xx, yy) => (xx < 0 || yy < 0 || xx >= spec.w || yy >= spec.h ? 0 : d.data[(yy * spec.w + xx) * 4 + 3]);
        const add = [];
        for (let yy = 0; yy < spec.h; yy++)
          for (let xx = 0; xx < spec.w; xx++)
            if (!a(xx, yy) && (a(xx + 1, yy) || a(xx - 1, yy) || a(xx, yy + 1) || a(xx, yy - 1))) add.push([xx, yy]);
        fx.fillStyle = spec.outline;
        for (const [xx, yy] of add) fx.fillRect(xx, yy, 1, 1);
      }
      x.drawImage(fc, f * spec.w, 0);
    });
    return c.toDataURL('image/png');
  };

  /** Vorschau: Teil vergrößert als PNG (zum Ansehen). */
  G.preview = (id, scale = 6, bg = '#7fae45') => {
    const p = G.part[id];
    const c = canvas(p.width * scale, p.height * scale);
    const x = c.getContext('2d');
    x.fillStyle = bg;
    x.fillRect(0, 0, c.width, c.height);
    x.imageSmoothingEnabled = false;
    x.drawImage(p, 0, 0, c.width, c.height);
    return c.toDataURL('image/png');
  };
})();
