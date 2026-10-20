// Regeln von Budi Jump, ohne React. Die 'worklet'-Funktionen laufen im Frame-Callback auf dem
// UI-Thread. Welt-Einheiten: Breite immer BUDI_JUMP.worldWidth, y zählt nach oben.
// Die Physik läuft in festen Schritten (stepMs), damit Sprünge auf 60- und 120-Hz-Geräten gleich sind.

import { BUDI_JUMP } from '../../../game/config';

export type JumpConfig = typeof BUDI_JUMP;

export interface Platform {
  /** Mitte des Blatts. */
  x: number;
  /** Oberkante des Blatts. */
  y: number;
}

export interface JumpWorld {
  /** Budis Mittelpunkt. */
  x: number;
  y: number;
  vx: number;
  vy: number;
  platforms: Platform[];
  /** Unterer Rand des sichtbaren Ausschnitts in Welt-Einheiten. */
  cameraY: number;
  /** Oberkante des höchsten erzeugten Blatts. */
  topPlatformY: number;
  /** Höchster Punkt, den Budi erreicht hat (für die Punkte). */
  maxY: number;
  /** Zustand des Zufallsgenerators, damit jede Runde aus einem Startwert reproduzierbar ist. */
  seed: number;
  /** Noch nicht verrechnete Zeit unter einem Physik-Schritt. */
  restMs: number;
  /** Budi ist unten rausgefallen. */
  fallen: boolean;
}

/** Zufallszahl in [0, 1) und neuer Zustand (mulberry32). */
export function nextRandom(seed: number): [number, number] {
  'worklet';
  const s = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(s ^ (s >>> 15), 1 | s);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return [((t ^ (t >>> 14)) >>> 0) / 4294967296, s];
}

/** Startwelt: ein Blatt mittig unter Budi, Budi springt sofort ab. */
export function createWorld(seed: number, cfg: JumpConfig = BUDI_JUMP): JumpWorld {
  'worklet';
  const startX = cfg.worldWidth / 2;
  return {
    x: startX,
    y: cfg.budiRadius,
    vx: 0,
    vy: cfg.jumpVelocity,
    platforms: [{ x: startX, y: 0 }],
    cameraY: -cfg.budiRadius * 4,
    topPlatformY: 0,
    maxY: 0,
    seed,
    restMs: 0,
    fallen: false,
  };
}

/** Abstand zum nächsten Blatt: wächst mit der Höhe bis difficultyHeight. */
export function gapRange(height: number, cfg: JumpConfig = BUDI_JUMP): { min: number; max: number } {
  'worklet';
  const t = Math.min(1, Math.max(0, height / cfg.difficultyHeight));
  return {
    min: cfg.gapStart.min + (cfg.gapHard.min - cfg.gapStart.min) * t,
    max: cfg.gapStart.max + (cfg.gapHard.max - cfg.gapStart.max) * t,
  };
}

/** Höchste Höhe, die ein Sprung erreicht. */
export function jumpHeight(cfg: JumpConfig = BUDI_JUMP): number {
  'worklet';
  return (cfg.jumpVelocity * cfg.jumpVelocity) / (2 * cfg.gravity);
}

/**
 * Erzeugt Blätter bis über den oberen Rand und entfernt die, die unten aus dem Bild sind.
 * Gibt dieselbe Welt zurück, wenn sich nichts ändert (spart Neuzeichnen).
 */
export function fillPlatforms(world: JumpWorld, viewHeight: number, cfg: JumpConfig = BUDI_JUMP): JumpWorld {
  'worklet';
  const top = world.cameraY + viewHeight + cfg.spawnAhead;
  const bottom = world.cameraY - cfg.platformHeight;
  const needsNew = world.topPlatformY < top;
  const needsCleanup = world.platforms.length > 0 && world.platforms[0].y < bottom;
  if (!needsNew && !needsCleanup) return world;

  const platforms = world.platforms.filter((p) => p.y >= bottom);
  let seed = world.seed;
  let y = world.topPlatformY;
  const half = cfg.platformWidth / 2;
  while (y < top) {
    const range = gapRange(y, cfg);
    const [rGap, s1] = nextRandom(seed);
    const [rX, s2] = nextRandom(s1);
    seed = s2;
    y += range.min + rGap * (range.max - range.min);
    platforms.push({ x: half + rX * (cfg.worldWidth - cfg.platformWidth), y });
  }
  return { ...world, platforms, topPlatformY: y, seed };
}

/** Landet Budi in diesem Schritt auf einem Blatt? Nur im Fallen und nur von oben. */
export function landsOn(prevFeet: number, feet: number, x: number, p: Platform, cfg: JumpConfig = BUDI_JUMP): boolean {
  'worklet';
  if (prevFeet < p.y || feet > p.y) return false;
  return Math.abs(x - p.x) <= cfg.platformWidth / 2 + cfg.budiRadius * 0.6;
}

/** Ein fester Physik-Schritt. `targetVx` kommt aus der Steuerung (Einheiten pro Sekunde). */
export function physicsStep(world: JumpWorld, targetVx: number, viewHeight: number, cfg: JumpConfig = BUDI_JUMP): JumpWorld {
  'worklet';
  const dt = cfg.stepMs / 1000;
  const blend = Math.min(1, cfg.sideResponse * dt);
  const vx = world.vx + (targetVx - world.vx) * blend;
  let vy = world.vy - cfg.gravity * dt;
  let x = world.x + vx * dt;
  let y = world.y + vy * dt;

  // Links raus, rechts wieder rein.
  if (x < 0) x += cfg.worldWidth;
  else if (x >= cfg.worldWidth) x -= cfg.worldWidth;

  if (vy <= 0) {
    const prevFeet = world.y - cfg.budiRadius;
    const feet = y - cfg.budiRadius;
    for (const p of world.platforms) {
      if (landsOn(prevFeet, feet, x, p, cfg)) {
        y = p.y + cfg.budiRadius;
        vy = cfg.jumpVelocity;
        break;
      }
    }
  }

  const maxY = Math.max(world.maxY, y);
  const cameraY = Math.max(world.cameraY, y - viewHeight * cfg.cameraFollow);
  const fallen = y + cfg.budiRadius < cameraY;
  return { ...world, x, y, vx, vy, maxY, cameraY, fallen };
}

/**
 * Lässt die Welt um `dtMs` weiterlaufen: so viele feste Schritte wie hineinpassen, danach Blätter
 * nachfüllen. Nach dem Herunterfallen bleibt die Welt stehen.
 */
export function advanceWorld(
  world: JumpWorld,
  dtMs: number,
  targetVx: number,
  viewHeight: number,
  cfg: JumpConfig = BUDI_JUMP,
): JumpWorld {
  'worklet';
  if (world.fallen) return world;
  let next = world;
  let rest = world.restMs + Math.max(0, dtMs);
  while (rest >= cfg.stepMs && !next.fallen) {
    next = physicsStep(next, targetVx, viewHeight, cfg);
    rest -= cfg.stepMs;
  }
  return fillPlatforms({ ...next, restMs: next.fallen ? 0 : rest }, viewHeight, cfg);
}

/** Punkte für die erreichte Höhe. */
export function scoreForHeight(maxY: number, cfg: JumpConfig = BUDI_JUMP): number {
  'worklet';
  return Math.floor(Math.max(0, maxY) / cfg.heightPerPoint);
}

/** Extra-Leben: neues Blatt knapp über dem unteren Rand, Budi springt von dort weiter. */
export function revive(world: JumpWorld, viewHeight: number, cfg: JumpConfig = BUDI_JUMP): JumpWorld {
  'worklet';
  const y = world.cameraY + viewHeight * 0.1;
  const x = cfg.worldWidth / 2;
  const platforms = [...world.platforms.filter((p) => p.y > y), { x, y }].sort((a, b) => a.y - b.y);
  return {
    ...world,
    x,
    y: y + cfg.budiRadius,
    vx: 0,
    vy: cfg.jumpVelocity,
    platforms,
    restMs: 0,
    fallen: false,
  };
}
