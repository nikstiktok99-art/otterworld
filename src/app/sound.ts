// Platzhalter-Töne, synthetisch erzeugt (keine Audiodateien). Echte Sounds ersetzen später dieselben Schlüssel.
// iOS erlaubt Ton erst nach dem ersten Tipp – deshalb unlock() beim Start-Knopf.

export type SoundKey =
  | 'sfx.tipp'
  | 'sfx.aufheben'
  | 'sfx.platsch'
  | 'sfx.bauen'
  | 'sfx.aufstellen'
  | 'sfx.leuchte'
  | 'sfx.nein'
  | 'sfx.dialog';

export class Sound {
  private ctx: AudioContext | null = null;

  constructor(private readonly enabled: () => boolean) {}

  unlock(): void {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
      return;
    }
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
    const buf = this.ctx.createBuffer(1, 1, 22050);
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    src.connect(this.ctx.destination);
    src.start(0);
  }

  get state(): string {
    return this.ctx?.state ?? 'noch nicht freigeschaltet';
  }

  suspend(): void {
    this.ctx?.suspend().catch(() => {});
  }

  resume(): void {
    this.ctx?.resume().catch(() => {});
  }

  play(key: SoundKey): void {
    const ctx = this.ctx;
    if (!ctx || ctx.state !== 'running' || !this.enabled()) return;
    const t = ctx.currentTime;
    switch (key) {
      case 'sfx.tipp':
        this.tone(t, 520, 620, 0.06, 0.05, 'sine');
        break;
      case 'sfx.dialog':
        this.tone(t, 700, 720, 0.03, 0.03, 'sine');
        break;
      case 'sfx.aufheben':
        this.tone(t, 660, 680, 0.09, 0.1, 'triangle');
        this.tone(t + 0.09, 880, 900, 0.12, 0.1, 'triangle');
        break;
      case 'sfx.platsch':
        this.noise(t, 0.2, 900, 0.14);
        break;
      case 'sfx.bauen':
        for (let i = 0; i < 3; i++) this.tone(t + i * 0.12, 190, 150, 0.05, 0.08, 'square');
        break;
      case 'sfx.aufstellen':
        this.tone(t, 392, 523, 0.16, 0.1, 'sine');
        break;
      case 'sfx.leuchte':
        this.tone(t, 784, 784, 0.9, 0.07, 'sine');
        this.tone(t + 0.08, 1175, 1175, 0.8, 0.05, 'sine');
        break;
      case 'sfx.nein':
        this.tone(t, 300, 220, 0.12, 0.06, 'sine');
        break;
    }
  }

  private tone(t: number, f1: number, f2: number, dur: number, vol: number, type: OscillatorType): void {
    const ctx = this.ctx!;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f1, t);
    o.frequency.exponentialRampToValueAtTime(f2, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g);
    g.connect(ctx.destination);
    o.start(t);
    o.stop(t + dur + 0.02);
  }

  private noise(t: number, dur: number, freq: number, vol: number): void {
    const ctx = this.ctx!;
    const len = Math.floor(ctx.sampleRate * dur);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = freq;
    const g = ctx.createGain();
    g.gain.value = vol;
    src.connect(filter);
    filter.connect(g);
    g.connect(ctx.destination);
    src.start(t);
  }
}
