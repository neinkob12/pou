// Schwierigkeits-Bots (Auftrag 40): spielen die reinen Spielregeln mit einer festen Reaktionszeit
// durch, ohne React und ohne Bildschirm. Nur für Tests und die Messung in docs/progress/web2.md,
// nicht Teil der App. Zufall ist ein Startwert, damit jeder Lauf gleich ausgeht.

import { BUDI_JUMP, DROPS_GAME, PEST_SMASH, TAP_CIRCLE } from '../../../game/config';
import { clampPot, createField, potTop, stepField, type DropsField } from '../drops/dropsLogic';
import {
  NO_CIRCLE,
  lifetimeAt,
  needsRespawn,
  placeCircle,
  radiusForHits,
  type TapCircle,
} from '../framework/example/tapCircle';
import { fillPlatforms } from '../jump/jumpLevel';
import { advanceWorld, jumpHeight, scoreForHeight } from '../jump/jumpPhysics';
import { createWorld, type JumpWorld } from '../jump/jumpWorld';
import { createSmashState, stepSmash, tapHole } from '../smash/pestSmash';

/** Bild-Takt der Simulation in ms. */
export const SIM_STEP_MS = 16;

/** Zufallszahlen in [0, 1) aus einem Startwert (mulberry32). */
export function seededRandom(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Streut die Reaktionszeit um ±20 %, wie bei einem Menschen. */
function reaction(ms: number, rand: () => number): number {
  return ms * (0.8 + 0.4 * rand());
}

/** Tipp den Kreis: Bot tippt jede Knospe nach `reactionMs`, wenn sie dann noch steht. */
export function simulateTap(reactionMs: number, seed: number): number {
  const rand = seededRandom(seed);
  const end = TAP_CIRCLE.durationSeconds * 1000;
  let circle: TapCircle = NO_CIRCLE;
  let hits = 0;
  let tapAt = Infinity;
  const spawn = (t: number) => {
    circle = placeCircle(rand(), rand(), 390, 700, radiusForHits(hits), t);
    tapAt = t + reaction(reactionMs, rand);
  };
  for (let t = 0; t < end; t += SIM_STEP_MS) {
    if (needsRespawn(circle, t, lifetimeAt(circle.spawnedAtMs))) spawn(t);
    if (t >= tapAt) {
      hits += 1;
      spawn(t);
    }
  }
  return hits * TAP_CIRCLE.pointsPerHit;
}

/** Mittel über mehrere Startwerte, gerundet. */
export function averageScore(run: (seed: number) => number, runs = 20): number {
  let sum = 0;
  for (let i = 1; i <= runs; i += 1) sum += run(i);
  return Math.round(sum / runs);
}

/**
 * Schädlings-Smash: Bot sieht jedes Tier nach `reactionMs` und klatscht Schädlinge, solange sie
 * noch da sind. Mit `ladybugSlip` erwischt er aus Versehen einen Marienkäfer. Ein Finger: zwischen
 * zwei Tipps vergehen mindestens `tapGapMs`.
 */
export function simulateSmash(reactionMs: number, seed: number, ladybugSlip = 0.1, tapGapMs = 300): number {
  const rand = seededRandom(seed);
  const end = PEST_SMASH.durationSeconds * 1000;
  let state = createSmashState();
  let score = 0;
  /** Wann der Bot auf welches Tier reagiert (Tier-ID). */
  const planned = new Map<number, number>();
  let fingerFreeAt = 0;
  for (let t = 0; t < end; t += SIM_STEP_MS) {
    state = stepSmash(state, t, rand(), rand(), PEST_SMASH);
    for (const c of state.critters) {
      if (planned.has(c.id) || c.hitAtMs !== null) continue;
      const wants = c.kind !== 'ladybug' || rand() < ladybugSlip;
      planned.set(c.id, wants ? t + reaction(reactionMs, rand) : Infinity);
    }
    for (const c of state.critters) {
      if ((planned.get(c.id) ?? Infinity) > t || t < fingerFreeAt) continue;
      planned.set(c.id, Infinity);
      fingerFreeAt = t + tapGapMs;
      const outcome = tapHole(state, c.hole, t, score, PEST_SMASH);
      state = outcome.state;
      score += outcome.points;
    }
  }
  return score;
}

/** Spielfeld der Tropfen-Simulation (Handy hochkant). */
const DROPS_W = 390;
const DROPS_H = 640;

/** Wohin der Bot den Topf schiebt: zum tiefsten guten Tropfen, an Salz vorbei. */
function dropsTarget(f: DropsField): number {
  const catchY = potTop(DROPS_H);
  const good = f.drops.filter((d) => d.kind !== 'salt' && d.y < catchY).sort((a, b) => b.y - a.y);
  let target = good.length > 0 ? good[0].x : f.potX;
  for (const s of f.drops) {
    if (s.kind !== 'salt' || s.y > catchY || s.y < catchY - 160) continue;
    if (Math.abs(s.x - target) < DROPS_GAME.potWidth) {
      target = s.x + (target < s.x ? -1 : 1) * DROPS_GAME.potWidth * 1.1;
    }
  }
  return clampPot(target, DROPS_W);
}

/**
 * Tropfen fangen: Bot entscheidet alle `reactionMs` neu, wohin der Topf soll, und schiebt ihn mit
 * höchstens `speed` dp pro Sekunde (Finger auf dem Handy). Spielt bis alle Leben weg sind oder
 * `maxMs` vorbei ist.
 */
export function simulateDrops(reactionMs: number, seed: number, speed = 900, maxMs = 180_000): number {
  const rand = seededRandom(seed);
  let f = createField(DROPS_W);
  let target = f.potX;
  let nextDecision = 0;
  let score = 0;
  for (let t = 0; t < maxMs && f.lives > 0; t += SIM_STEP_MS) {
    if (t >= nextDecision) {
      target = dropsTarget(f);
      nextDecision = t + reaction(reactionMs, rand);
    }
    const step = (speed * SIM_STEP_MS) / 1000;
    const potX = f.potX + Math.max(-step, Math.min(step, target - f.potX));
    const { field, events } = stepField({ ...f, potX }, SIM_STEP_MS, t, DROPS_W, DROPS_H, rand(), rand());
    f = field;
    score += events.points;
  }
  return score;
}

/** Sichthöhe in Welt-Einheiten bei einem Handy hochkant (Breite 100). */
const JUMP_VIEW = 180;

/** Ziel des Bots: das höchste tragende Blatt in Sprungweite, im Fallen das nächste darunter. */
function jumpTarget(w: JumpWorld): number {
  const feet = w.y - BUDI_JUMP.budiRadius;
  const reach = feet + (w.vy > 0 ? (w.vy * w.vy) / (2 * BUDI_JUMP.gravity) : 0);
  const usable = w.platforms.filter((p) => !p.broken && p.y > w.cameraY);
  const above = usable.filter((p) => p.y <= reach - 2 && p.y > feet - jumpHeight() * 0.2);
  const pick = above.length > 0 ? above.sort((a, b) => b.y - a.y)[0] : usable.filter((p) => p.y < feet).sort((a, b) => b.y - a.y)[0];
  return pick ? pick.x : w.x;
}

/**
 * Budi Jump: Bot sucht alle `reactionMs` ein Blatt aus und lenkt mit voller Seitengeschwindigkeit
 * dorthin, wie ein Spieler mit Pfeiltasten. Läuft bis Budi fällt oder `maxMs` vorbei ist.
 */
export function simulateJump(reactionMs: number, seed: number, maxMs = 240_000): number {
  const rand = seededRandom(seed);
  let w = fillPlatforms(createWorld(Math.floor(rand() * 2 ** 31)), JUMP_VIEW);
  let target = w.x;
  let nextDecision = 0;
  for (let t = 0; t < maxMs && !w.fallen; t += SIM_STEP_MS) {
    if (t >= nextDecision) {
      target = jumpTarget(w);
      nextDecision = t + reaction(reactionMs, rand);
    }
    const dx = target - w.x;
    const vx = Math.abs(dx) < 1.5 ? 0 : Math.sign(dx) * BUDI_JUMP.maxSideSpeed;
    w = advanceWorld(w, SIM_STEP_MS, vx, JUMP_VIEW);
  }
  return scoreForHeight(w.maxY);
}
