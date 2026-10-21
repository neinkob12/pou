import { BUDI_JUMP, MINIGAME_FUN } from '../../../../game/config';
import { fillPlatforms, movingSpeedFor } from '../jumpLevel';
import { moveLeaves, physicsStep } from '../jumpPhysics';
import { createWorld, type JumpWorld, type Platform } from '../jumpWorld';

const fun = MINIGAME_FUN.jump;
const half = BUDI_JUMP.platformWidth / 2;

function world(over: Partial<JumpWorld>): JumpWorld {
  return { ...createWorld(1), platforms: [], topPlatformY: 1e9, ...over };
}

describe('Budi Jump: Wander-Blätter (Auftrag 45)', () => {
  it('unten wandert nichts, oben mit Tempo in beide Richtungen', () => {
    expect(movingSpeedFor(0, 0, fun.movingFromHeight - 1)).toBe(0);
    expect(movingSpeedFor(0, 0.9, fun.movingFromHeight)).toBeGreaterThan(0);
    expect(movingSpeedFor(0, 0.1, fun.movingFromHeight)).toBeLessThan(0);
    expect(movingSpeedFor(0.99, 0.9, BUDI_JUMP.difficultyHeight)).toBe(0);
    expect(Math.abs(movingSpeedFor(0, 0.9, BUDI_JUMP.difficultyHeight))).toBe(fun.movingSpeed.hard);
  });

  it('gleitet und prallt am Rand ab', () => {
    const p: Platform = { x: BUDI_JUMP.worldWidth - half - 0.5, y: 10, kind: 'normal', broken: false, vx: 20 };
    const [moved] = moveLeaves([p], 0.1);
    expect(moved.vx).toBe(-20);
    expect(moved.x).toBeLessThanOrEqual(BUDI_JUMP.worldWidth - half);
    const still: Platform = { x: 50, y: 10, kind: 'normal', broken: false };
    const list = [still];
    expect(moveLeaves(list, 0.1)).toBe(list);
  });

  it('weiter oben entstehen Wander-Blätter, die Strecke unten bleibt je Startwert gleich', () => {
    const low = fillPlatforms(createWorld(7), fun.movingFromHeight - 50);
    expect(low.platforms.some((p) => p.vx)).toBe(false);
    const high = fillPlatforms({ ...createWorld(7), cameraY: BUDI_JUMP.difficultyHeight }, 2000);
    expect(high.platforms.some((p) => p.vx)).toBe(true);
  });
});

describe('Budi Jump: Sonnenstrahl (Auftrag 45)', () => {
  it('einsammeln trägt Budi eine Weile nach oben', () => {
    const w = world({ x: 50, y: 100, vy: -20, boosts: [{ x: 50, y: 100 }] });
    const hit = physicsStep(w, 0, 200);
    expect(hit.boosts).toHaveLength(0);
    expect(hit.boostsCollected).toBe(1);
    expect(hit.boostMs).toBe(fun.boostMs);
    const next = physicsStep(hit, 0, 200);
    expect(next.vy).toBe(fun.boostVelocity);
    expect(next.y).toBeGreaterThan(hit.y);
  });

  it('nach Ablauf zieht die Schwerkraft wieder', () => {
    const w = world({ x: 50, y: 100, vy: fun.boostVelocity, boostMs: 0 });
    expect(physicsStep(w, 0, 200).vy).toBeLessThan(fun.boostVelocity);
  });
});
