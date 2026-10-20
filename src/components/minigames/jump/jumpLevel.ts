// Aufbau der Strecke von Budi Jump: Blätter, ihre Typen und Lichtpunkte. Alles hängt von der
// Höhe ab (difficultyHeight) und vom Zufallsgenerator der Welt, ist also je Startwert gleich.

import { BUDI_JUMP } from '../../../game/config';
import { nextRandom, type JumpConfig, type JumpWorld, type PlatformKind } from './jumpWorld';

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
 * Erzeugt Blätter (und Lichtpunkte) bis über den oberen Rand und entfernt, was unten aus dem Bild ist.
 * Gibt dieselbe Welt zurück, wenn sich nichts ändert (spart Neuzeichnen).
 */
export function fillPlatforms(world: JumpWorld, viewHeight: number, cfg: JumpConfig = BUDI_JUMP): JumpWorld {
  'worklet';
  const top = world.cameraY + viewHeight + cfg.spawnAhead;
  const bottom = world.cameraY - cfg.platformHeight;
  const needsNew = world.topPlatformY < top;
  const needsCleanup =
    world.platforms.some((p) => p.y < bottom) || world.lights.some((l) => l.y + cfg.lightRadius < bottom);
  if (!needsNew && !needsCleanup) return world;

  const platforms = world.platforms.filter((p) => p.y >= bottom);
  const lights = world.lights.filter((l) => l.y + cfg.lightRadius >= bottom);
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
    platforms.push({ x: half + rX * (cfg.worldWidth - cfg.platformWidth), y, kind: platformKindFor(rKind, y, cfg), broken: false });
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
  return { ...world, platforms, lights, topPlatformY: y, seed };
}
