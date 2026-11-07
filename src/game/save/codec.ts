// Speicherformat: versionierte Hülle mit laufender Nummer und Prüfsumme.
import { SCHEMA } from '../state';

export interface SaveEnvelope {
  schema: number;
  seq: number;
  savedAt: number;
  check: string;
  state: unknown;
}

export type DecodeResult =
  | { ok: true; env: SaveEnvelope }
  | { ok: false; reason: 'empty' | 'corrupt' | 'checksum' | 'newer'; seq?: number };

/** FNV-1a, 32 Bit – genügt, um abgeschnittene oder beschädigte Stände zu erkennen. */
export function checksum(text: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, '0');
}

export function encodeEnvelope(state: unknown, seq: number, now: number): string {
  const body = JSON.stringify(state);
  return JSON.stringify({ schema: SCHEMA, seq, savedAt: now, check: checksum(body), state });
}

export function decodeEnvelope(raw: string | null | undefined): DecodeResult {
  if (!raw) return { ok: false, reason: 'empty' };
  let env: SaveEnvelope;
  try {
    env = JSON.parse(raw) as SaveEnvelope;
  } catch {
    return { ok: false, reason: 'corrupt' };
  }
  if (!env || typeof env !== 'object' || typeof env.seq !== 'number' || typeof env.schema !== 'number') {
    return { ok: false, reason: 'corrupt' };
  }
  if (env.schema > SCHEMA) return { ok: false, reason: 'newer', seq: env.seq };
  if (checksum(JSON.stringify(env.state)) !== env.check) return { ok: false, reason: 'checksum', seq: env.seq };
  return { ok: true, env };
}

// ---- Spielstand-Code zum Sichern/Wiederherstellen (Sicherheitsnetz beim Sideloading) ----

const PREFIX = 'OTTERWELT1';

function toBase64Url(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(b64: string): string {
  const norm = b64.replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(norm + '='.repeat((4 - (norm.length % 4)) % 4));
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function exportCode(state: unknown): string {
  const body = JSON.stringify({ schema: SCHEMA, state });
  return `${PREFIX}-${toBase64Url(body)}-${checksum(body)}`;
}

export class CodeError extends Error {}

/** Liefert den rohen Spielstand aus einem Code – danach muss er normalisiert werden. */
export function importCode(code: string): { schema: number; state: unknown } {
  const clean = code.replace(/\s+/g, '');
  const parts = clean.split('-');
  if (parts.length !== 3 || parts[0] !== PREFIX) throw new CodeError('Das ist kein Otterwelt-Code.');
  let body: string;
  try {
    body = fromBase64Url(parts[1]!);
  } catch {
    throw new CodeError('Der Code ist unvollständig.');
  }
  if (checksum(body) !== parts[2]) throw new CodeError('Der Code ist unvollständig oder verändert.');
  const parsed = JSON.parse(body) as { schema: number; state: unknown };
  if (typeof parsed.schema !== 'number') throw new CodeError('Der Code ist beschädigt.');
  if (parsed.schema > SCHEMA) throw new CodeError('Dieser Code stammt aus einer neueren Spielversion.');
  return parsed;
}
