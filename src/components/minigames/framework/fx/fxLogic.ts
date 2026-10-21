// Treffer-Effekte der Minigames, ohne React (Auftrag 40): Partikel, Kamera-Wackeln, kurzes Anhalten.
// Partikel werden nicht pro Frame verschoben, sondern aus Startpunkt, Tempo und Alter berechnet.
// Die 'worklet'-Funktionen laufen im Frame-Callback auf dem UI-Thread; in Tests normale Funktionen.
// Reihenfolge beachten: Worklets werden im Web nicht vorgezogen, Helfer stehen vor ihrer Nutzung.

import { MINIGAME_ART, MINIGAME_FEEL } from '../../../../game/config';

export type FeelConfig = typeof MINIGAME_FEEL;
export type ArtConfig = typeof MINIGAME_ART;

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  bornMs: number;
  lifeMs: number;
  size: number;
  /** Index in der Farbliste der Ebene (FxLayer). */
  color: number;
}

/** Schockwellen-Ring bei Treffern (Auftrag 51): wächst und wird dabei dünner und blasser. */
export interface Ring {
  x: number;
  y: number;
  bornMs: number;
  /** Index in der Farbliste der Ebene. */
  color: number;
  /** Faktor auf MINIGAME_ART.ringRadius. */
  scale: number;
}

export interface FxState {
  particles: Particle[];
  shakeStartMs: number;
  shakeMs: number;
  shakePx: number;
  /** Fehlt bei älteren Zuständen: keine Ringe. */
  rings?: Ring[];
  /** Weißer Blitz über dem Feld (Auftrag 51), Startzeit; fehlt: kein Blitz. */
  flashAtMs?: number;
}

export interface BurstOptions {
  count: number;
  color: number;
  /** Faktor auf particleSpeed. */
  speed?: number;
  /** Faktor auf particleSize. */
  size?: number;
  /** Nur nach oben streuen (z. B. Spritzer aus dem Topf). */
  upward?: boolean;
}

export function createFx(): FxState {
  'worklet';
  return { particles: [], shakeStartMs: 0, shakeMs: 0, shakePx: 0 };
}

/** Neue Partikel an (x, y). `rand` liefert Zahlen in [0, 1), damit die Funktion testbar bleibt. */
export function burst(
  fx: FxState,
  x: number,
  y: number,
  nowMs: number,
  opts: BurstOptions,
  rand: () => number = Math.random,
  cfg: FeelConfig = MINIGAME_FEEL,
): FxState {
  'worklet';
  const speed = cfg.particleSpeed * (opts.speed ?? 1);
  const size = cfg.particleSize * (opts.size ?? 1);
  const added: Particle[] = [];
  for (let i = 0; i < opts.count; i += 1) {
    const spread = opts.upward ? Math.PI * 0.8 : Math.PI * 2;
    const base = opts.upward ? -Math.PI / 2 - spread / 2 : 0;
    const angle = base + ((i + rand()) / opts.count) * spread;
    const v = speed * (0.45 + 0.55 * rand());
    added.push({
      x,
      y,
      vx: Math.cos(angle) * v,
      vy: Math.sin(angle) * v,
      bornMs: nowMs,
      lifeMs: cfg.particleLifeMs * (0.7 + 0.3 * rand()),
      size: size * (0.7 + 0.6 * rand()),
      color: opts.color,
    });
  }
  const all = fx.particles.concat(added);
  const particles = all.length > cfg.maxParticles ? all.slice(all.length - cfg.maxParticles) : all;
  return { ...fx, particles };
}

/** Wirft abgelaufene Partikel und Ringe weg. Gibt denselben Zustand zurück, wenn nichts abgelaufen ist. */
export function pruneFx(fx: FxState, nowMs: number, art: ArtConfig = MINIGAME_ART): FxState {
  'worklet';
  const alive = fx.particles.filter((p) => nowMs - p.bornMs < p.lifeMs);
  const rings = fx.rings ?? [];
  const ringsAlive = rings.filter((r) => nowMs - r.bornMs < art.ringLifeMs);
  if (alive.length === fx.particles.length && ringsAlive.length === rings.length) return fx;
  return { ...fx, particles: alive, rings: ringsAlive };
}

/** Hat der Zustand noch etwas zu zeigen oder aufzuräumen? */
export function fxBusy(fx: FxState): boolean {
  'worklet';
  return fx.particles.length > 0 || (fx.rings?.length ?? 0) > 0;
}

/** Neuer Schockwellen-Ring an (x, y). Höchstens 12 gleichzeitig, die ältesten fliegen raus. */
export function ring(fx: FxState, x: number, y: number, nowMs: number, color: number, scale = 1): FxState {
  'worklet';
  const rings = (fx.rings ?? []).concat([{ x, y, bornMs: nowMs, color, scale }]);
  return { ...fx, rings: rings.length > 12 ? rings.slice(rings.length - 12) : rings };
}

/** Radius, Strichbreite und Deckkraft eines Rings; Deckkraft 0 heißt unsichtbar. */
export function ringAt(r: Ring, nowMs: number, art: ArtConfig = MINIGAME_ART): { radius: number; width: number; alpha: number } {
  'worklet';
  const age = nowMs - r.bornMs;
  if (age < 0 || age >= art.ringLifeMs) return { radius: 0, width: 0, alpha: 0 };
  const t = age / art.ringLifeMs;
  const ease = 1 - (1 - t) * (1 - t) * (1 - t);
  const max = art.ringRadius * r.scale;
  return { radius: max * (0.25 + 0.75 * ease), width: Math.max(1, 7 * r.scale * (1 - t)), alpha: 1 - t };
}

/** Startet den weißen Blitz. */
export function flash(fx: FxState, nowMs: number): FxState {
  'worklet';
  return { ...fx, flashAtMs: nowMs };
}

/** Deckkraft des Blitzes jetzt (0 bis MINIGAME_ART.flashOpacity), fällt schnell ab. */
export function flashAlpha(fx: FxState, nowMs: number, art: ArtConfig = MINIGAME_ART): number {
  'worklet';
  if (fx.flashAtMs === undefined) return 0;
  const age = nowMs - fx.flashAtMs;
  if (age < 0 || age >= art.flashMs) return 0;
  const left = 1 - age / art.flashMs;
  return art.flashOpacity * left * left;
}

/** Lage und Größe eines Partikels zum Zeitpunkt `nowMs`; Größe 0 heißt: unsichtbar. */
export function particleAt(
  p: Particle,
  nowMs: number,
  cfg: FeelConfig = MINIGAME_FEEL,
): { x: number; y: number; r: number } {
  'worklet';
  const age = nowMs - p.bornMs;
  if (age < 0 || age >= p.lifeMs) return { x: p.x, y: p.y, r: 0 };
  const t = age / 1000;
  const left = 1 - age / p.lifeMs;
  return {
    x: p.x + p.vx * t,
    y: p.y + p.vy * t + 0.5 * cfg.particleGravity * t * t,
    r: p.size * left,
  };
}

/** Aktueller Ausschlag, fällt linear auf 0. */
export function shakeStrength(fx: FxState, nowMs: number): number {
  'worklet';
  const age = nowMs - fx.shakeStartMs;
  if (fx.shakeMs <= 0 || age < 0 || age >= fx.shakeMs) return 0;
  return fx.shakePx * (1 - age / fx.shakeMs);
}

/** Startet ein Wackeln. Ein laufendes stärkeres Wackeln wird nicht abgeschwächt. */
export function shake(fx: FxState, nowMs: number, ms: number, px: number): FxState {
  'worklet';
  const current = shakeStrength(fx, nowMs);
  if (current > px) return fx;
  return { ...fx, shakeStartMs: nowMs, shakeMs: ms, shakePx: px };
}

/** Verschiebung des Bilds beim Wackeln: zwei Sinus mit verschiedenen Takten, damit es nicht pendelt. */
export function shakeOffset(fx: FxState, nowMs: number): { x: number; y: number } {
  'worklet';
  const s = shakeStrength(fx, nowMs);
  if (s === 0) return { x: 0, y: 0 };
  return { x: Math.sin(nowMs * 0.09) * s, y: Math.cos(nowMs * 0.071) * s };
}

/**
 * Kurzes Anhalten: verbraucht zuerst die Rest-Anhaltezeit, nur der Überschuss zählt als Spielzeit.
 */
export function consumeHitStop(leftMs: number, dtMs: number): { leftMs: number; dtMs: number } {
  'worklet';
  if (leftMs <= 0) return { leftMs: 0, dtMs };
  const used = Math.min(leftMs, dtMs);
  return { leftMs: leftMs - used, dtMs: dtMs - used };
}

/**
 * Zeitlupe (Auftrag 51): solange Rest-Zeitlupe da ist, zählt die echte Zeit nur mit `factor`.
 * Verbraucht wird die Zeitlupe in echter Zeit, sie endet also nach slowMoMs, egal wie langsam.
 */
export function consumeSlowMo(leftMs: number, dtMs: number, factor: number): { leftMs: number; dtMs: number } {
  'worklet';
  if (leftMs <= 0) return { leftMs: 0, dtMs };
  const slow = Math.min(leftMs, dtMs);
  return { leftMs: leftMs - slow, dtMs: slow * factor + (dtMs - slow) };
}

/** Löst diese Kombo eine Zeitlupe aus? Jede volle Stufe (5, 10, 15 ...) einmal. */
export function comboSlowMo(combo: number, every: number = MINIGAME_ART.slowMoEveryCombo): boolean {
  'worklet';
  return combo > 0 && combo % every === 0;
}

/** Überschreitet eine Serie, die in einem Schritt von `before` auf `after` springt, eine volle Stufe? */
export function crossesSlowMo(before: number, after: number, every: number = MINIGAME_ART.slowMoEveryCombo): boolean {
  'worklet';
  return after > before && Math.floor(after / every) > Math.floor(before / every);
}

/** Kombo nach einem Treffer: schnell nach dem letzten heißt +1, sonst beginnt sie bei 1. */
export function comboAfterHit(
  combo: number,
  lastHitMs: number | null,
  nowMs: number,
  windowMs: number = MINIGAME_FEEL.comboWindowMs,
): number {
  'worklet';
  return lastHitMs !== null && nowMs - lastHitMs <= windowMs ? combo + 1 : 1;
}
