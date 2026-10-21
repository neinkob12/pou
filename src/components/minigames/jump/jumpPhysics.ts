// Physik von Budi Jump, ohne React. Die 'worklet'-Funktionen laufen im Frame-Callback auf dem
// UI-Thread. Die Physik läuft in festen Schritten (stepMs), damit Sprünge auf 60- und 120-Hz-Geräten gleich sind.
// Zustand und Startwelt: jumpWorld.ts, Strecke (Blätter, Typen, Lichtpunkte): jumpLevel.ts.

import { BUDI_JUMP, MINIGAME_FUN } from '../../../game/config';
import { fillPlatforms } from './jumpLevel';
import type { JumpConfig, JumpWorld, LightPoint, Platform } from './jumpWorld';

/** Höchste Höhe, die ein Sprung erreicht. */
export function jumpHeight(cfg: JumpConfig = BUDI_JUMP, velocity: number = cfg.jumpVelocity): number {
  'worklet';
  return (velocity * velocity) / (2 * cfg.gravity);
}

/** Landet Budi in diesem Schritt auf einem Blatt? Nur im Fallen, nur von oben, nicht auf gebrochenen. */
export function landsOn(prevFeet: number, feet: number, x: number, p: Platform, cfg: JumpConfig = BUDI_JUMP): boolean {
  'worklet';
  if (p.broken || prevFeet < p.y || feet > p.y) return false;
  return Math.abs(x - p.x) <= cfg.platformWidth / 2 + cfg.budiRadius * 0.6;
}

/** Berührt Budi den Lichtpunkt? */
export function touchesLight(x: number, y: number, light: LightPoint, cfg: JumpConfig = BUDI_JUMP): boolean {
  'worklet';
  const reach = cfg.budiRadius + cfg.lightRadius;
  const dx = x - light.x;
  const dy = y - light.y;
  return dx * dx + dy * dy <= reach * reach;
}

/** Gebrochene Blätter fallen weiter. Ohne gebrochene Blätter bleibt das Array dasselbe. */
function dropBroken(platforms: Platform[], dt: number, cfg: JumpConfig): Platform[] {
  'worklet';
  if (!platforms.some((p) => p.broken)) return platforms;
  return platforms.map((p) => (p.broken ? { ...p, y: p.y - cfg.brokenFallSpeed * dt } : p));
}

/** Wander-Blätter gleiten seitlich und prallen an den Rändern ab (Auftrag 45). */
export function moveLeaves(platforms: Platform[], dt: number, cfg: JumpConfig = BUDI_JUMP): Platform[] {
  'worklet';
  if (!platforms.some((p) => p.vx)) return platforms;
  const half = cfg.platformWidth / 2;
  return platforms.map((p) => {
    if (!p.vx || p.broken) return p;
    const x = p.x + p.vx * dt;
    if (x < half) return { ...p, x: half + (half - x), vx: -p.vx };
    if (x > cfg.worldWidth - half) return { ...p, x: 2 * (cfg.worldWidth - half) - x, vx: -p.vx };
    return { ...p, x };
  });
}

/** Berührt Budi einen Sonnenstrahl? */
export function touchesBoost(x: number, y: number, boost: LightPoint, cfg: JumpConfig = BUDI_JUMP): boolean {
  'worklet';
  const reach = cfg.budiRadius + MINIGAME_FUN.jump.boostRadius;
  const dx = x - boost.x;
  const dy = y - boost.y;
  return dx * dx + dy * dy <= reach * reach;
}

/** Ein fester Physik-Schritt. `targetVx` kommt aus der Steuerung (Einheiten pro Sekunde). */
export function physicsStep(
  world: JumpWorld,
  targetVx: number,
  viewHeight: number,
  cfg: JumpConfig = BUDI_JUMP,
): JumpWorld {
  'worklet';
  const fun = MINIGAME_FUN.jump;
  const dt = cfg.stepMs / 1000;
  const blend = Math.min(1, cfg.sideResponse * dt);
  const vx = world.vx + (targetVx - world.vx) * blend;
  // Sonnenstrahl (Auftrag 45): trägt Budi mit festem Tempo nach oben, solange er wirkt.
  let boostMs = Math.max(0, (world.boostMs ?? 0) - cfg.stepMs);
  let vy = (world.boostMs ?? 0) > 0 ? fun.boostVelocity : world.vy - cfg.gravity * dt;
  let x = world.x + vx * dt;
  let y = world.y + vy * dt;
  let platforms = moveLeaves(dropBroken(world.platforms, dt, cfg), dt, cfg);

  // Links raus, rechts wieder rein.
  if (x < 0) x += cfg.worldWidth;
  else if (x >= cfg.worldWidth) x -= cfg.worldWidth;

  if (vy <= 0) {
    const prevFeet = world.y - cfg.budiRadius;
    const feet = y - cfg.budiRadius;
    for (let i = 0; i < platforms.length; i += 1) {
      const p = platforms[i];
      if (landsOn(prevFeet, feet, x, p, cfg)) {
        y = p.y + cfg.budiRadius;
        vy = p.kind === 'spring' ? cfg.springVelocity : cfg.jumpVelocity;
        // Brechendes Blatt trägt genau einmal.
        if (p.kind === 'breaking') {
          platforms = platforms.map((q, j) => (j === i ? { ...q, broken: true } : q));
        }
        break;
      }
    }
  }

  let lights = world.lights;
  let lightsCollected = world.lightsCollected;
  if (lights.some((l) => touchesLight(x, y, l, cfg))) {
    const left = lights.filter((l) => !touchesLight(x, y, l, cfg));
    lightsCollected += lights.length - left.length;
    lights = left;
  }

  let boosts = world.boosts;
  let boostsCollected = world.boostsCollected ?? 0;
  if (boosts && boosts.some((b) => touchesBoost(x, y, b, cfg))) {
    const left = boosts.filter((b) => !touchesBoost(x, y, b, cfg));
    boostsCollected += boosts.length - left.length;
    boosts = left;
    boostMs = fun.boostMs;
  }

  const maxY = Math.max(world.maxY, y);
  const cameraY = Math.max(world.cameraY, y - viewHeight * cfg.cameraFollow);
  const fallen = y + cfg.budiRadius < cameraY;
  return {
    ...world,
    x,
    y,
    vx,
    vy,
    platforms,
    lights,
    lightsCollected,
    maxY,
    cameraY,
    fallen,
    boosts,
    boostMs,
    boostsCollected,
  };
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
  const fresh: Platform = { x, y, kind: 'normal', broken: false };
  const platforms = [...world.platforms.filter((p) => p.y > y), fresh].sort((a, b) => a.y - b.y);
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
