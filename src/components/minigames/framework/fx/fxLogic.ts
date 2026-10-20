// Treffer-Effekte der Minigames, ohne React (Auftrag 40): Partikel, Kamera-Wackeln, kurzes Anhalten.
// Partikel werden nicht pro Frame verschoben, sondern aus Startpunkt, Tempo und Alter berechnet.
// Die 'worklet'-Funktionen laufen im Frame-Callback auf dem UI-Thread; in Tests normale Funktionen.
// Reihenfolge beachten: Worklets werden im Web nicht vorgezogen, Helfer stehen vor ihrer Nutzung.

import { MINIGAME_FEEL } from '../../../../game/config';

export type FeelConfig = typeof MINIGAME_FEEL;

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

export interface FxState {
  particles: Particle[];
  shakeStartMs: number;
  shakeMs: number;
  shakePx: number;
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

/** Wirft abgelaufene Partikel weg. Gibt denselben Zustand zurück, wenn nichts abgelaufen ist. */
export function pruneFx(fx: FxState, nowMs: number): FxState {
  'worklet';
  const alive = fx.particles.filter((p) => nowMs - p.bornMs < p.lifeMs);
  return alive.length === fx.particles.length ? fx : { ...fx, particles: alive };
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
