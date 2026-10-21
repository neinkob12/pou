// Aufbau der Strecke von Budi Jump: Blätter, ihre Typen und Lichtpunkte. Alles hängt von der
// Höhe ab (difficultyHeight) und vom Zufallsgenerator der Welt, ist also je Startwert gleich.

import { BUDI_JUMP, MINIGAME_FUN } from '../../../game/config';
import { nextRandom, type JumpConfig, type JumpWorld, type LightPoint, type PlatformKind } from './jumpWorld';

type JumpFun = typeof MINIGAME_FUN.jump;

/** Schwierigkeit 0 (Start) bis 1 (ab difficultyHeight). */
export function difficultyAt(height: number, cfg: JumpConfig = BUDI_JUMP): number {
  'worklet';
  return Math.min(1, Math.max(0, height / cfg.difficultyHeight));
}

function lerp(range: { start: number; hard: number }, t: number): number {
  'worklet';
  return range.start + (range.hard - range.start) * t;
}

/** Abstand zum nächsten Blatt: wächst mit der Höhe bis difficultyHeight. */
export function gapRange(height: number, cfg: JumpConfig = BUDI_JUMP): { min: number; max: number } {
  'worklet';
  const t = difficultyAt(height, cfg);
  return {
    min: cfg.gapStart.min + (cfg.gapHard.min - cfg.gapStart.min) * t,
    max: cfg.gapStart.max + (cfg.gapHard.max - cfg.gapStart.max) * t,
  };
}

/** Typ eines Blatts aus einer Zufallszahl in [0, 1). Je höher, desto mehr brechende Blätter. */
export function platformKindFor(r: number, height: number, cfg: JumpConfig = BUDI_JUMP): PlatformKind {
  'worklet';
  const t = difficultyAt(height, cfg);
  const spring = lerp(cfg.springChance, t);
  const breaking = lerp(cfg.breakingChance, t);
  if (r < spring) return 'spring';
  if (r < spring + breaking) return 'breaking';
  return 'normal';
}

/**
 * Tempo eines Wander-Blatts in dieser Höhe (Auftrag 45), 0 heißt: steht still. `rMove` entscheidet,
 * ob es wandert, `rDir` die Richtung. Unter movingFromHeight wandert nichts.
 */
export function movingSpeedFor(
  rMove: number,
  rDir: number,
  height: number,
  cfg: JumpConfig = BUDI_JUMP,
  fun: JumpFun = MINIGAME_FUN.jump,
): number {
  'worklet';
  if (height < fun.movingFromHeight) return 0;
  const t = difficultyAt(height, cfg);
  if (rMove >= lerp(fun.movingChance, t)) return 0;
  return lerp(fun.movingSpeed, t) * (rDir < 0.5 ? -1 : 1);
}

/**
 * Erzeugt Blätter (und Lichtpunkte) bis über den oberen Rand und entfernt, was unten aus dem Bild ist.
 * Gibt dieselbe Welt zurück, wenn sich nichts ändert (spart Neuzeichnen).
 */
export function fillPlatforms(
  world: JumpWorld,
  viewHeight: number,
  cfg: JumpConfig = BUDI_JUMP,
  fun: JumpFun = MINIGAME_FUN.jump,
): JumpWorld {
  'worklet';
  const top = world.cameraY + viewHeight + cfg.spawnAhead;
  const bottom = world.cameraY - cfg.platformHeight;
  const needsNew = world.topPlatformY < top;
  const needsCleanup =
    world.platforms.some((p) => p.y < bottom) ||
    world.lights.some((l) => l.y + cfg.lightRadius < bottom) ||
    (world.boosts ?? []).some((l) => l.y + fun.boostRadius < bottom);
  if (!needsNew && !needsCleanup) return world;

  const platforms = world.platforms.filter((p) => p.y >= bottom);
  const lights = world.lights.filter((l) => l.y + cfg.lightRadius >= bottom);
  const boosts: LightPoint[] = (world.boosts ?? []).filter((l) => l.y + fun.boostRadius >= bottom);
  let seed = world.seed;
  let y = world.topPlatformY;
  const half = cfg.platformWidth / 2;
  while (y < top) {
    const range = gapRange(y, cfg);
    const [rGap, s1] = nextRandom(seed);
    const [rX, s2] = nextRandom(s1);
    const [rKind, s3] = nextRandom(s2);
    const [rLight, s4] = nextRandom(s3);
    seed = s4;
    y += range.min + rGap * (range.max - range.min);
    const kind = platformKindFor(rKind, y, cfg);
    const leaf = { x: half + rX * (cfg.worldWidth - cfg.platformWidth), y, kind, broken: false };
    // Neue Zufallszahlen erst ab movingFromHeight, damit die Strecke darunter je Startwert gleich bleibt.
    if (y >= fun.movingFromHeight) {
      const [rMove, s7] = nextRandom(seed);
      const [rDir, s8] = nextRandom(s7);
      const [rBoost, s9] = nextRandom(s8);
      seed = s9;
      const vx = kind === 'normal' ? movingSpeedFor(rMove, rDir, y, cfg, fun) : 0;
      platforms.push(vx === 0 ? leaf : { ...leaf, vx });
      if (y >= fun.boostFromHeight && rBoost < fun.boostChance) boosts.push({ x: leaf.x, y: y + cfg.lightLift.max });
    } else {
      platforms.push(leaf);
    }
    if (rLight < cfg.lightChance) {
      const [rLx, s5] = nextRandom(seed);
      const [rLy, s6] = nextRandom(s5);
      seed = s6;
      lights.push({
        x: cfg.lightRadius + rLx * (cfg.worldWidth - 2 * cfg.lightRadius),
        y: y + cfg.lightLift.min + rLy * (cfg.lightLift.max - cfg.lightLift.min),
      });
    }
  }
  return { ...world, platforms, lights, boosts, topPlatformY: y, seed };
}
