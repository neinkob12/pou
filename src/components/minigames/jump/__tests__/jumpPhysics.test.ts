import { BUDI_JUMP } from '../../../../game/config';
import { fillPlatforms, gapRange } from '../jumpLevel';
import { advanceWorld, jumpHeight, landsOn, physicsStep, revive, scoreForHeight } from '../jumpPhysics';
import { createWorld, nextRandom, type JumpWorld, type Platform } from '../jumpWorld';

function leaf(x: number, y: number, kind: Platform['kind'] = 'normal'): Platform {
  return { x, y, kind, broken: false };
}

const VIEW = 200;
const STEP = BUDI_JUMP.stepMs;

describe('nextRandom', () => {
  it('ist reproduzierbar und liegt in [0, 1)', () => {
    let seed = 42;
    const values: number[] = [];
    for (let i = 0; i < 500; i += 1) {
      const [v, s] = nextRandom(seed);
      values.push(v);
      seed = s;
    }
    expect(values.every((v) => v >= 0 && v < 1)).toBe(true);
    expect(nextRandom(42)).toEqual(nextRandom(42));
    expect(new Set(values).size).toBeGreaterThan(490);
  });
});

describe('createWorld', () => {
  it('stellt Budi auf ein Blatt und lässt ihn abspringen', () => {
    const w = createWorld(1);
    expect(w.platforms).toEqual([leaf(BUDI_JUMP.worldWidth / 2, 0)]);
    expect(w.y - BUDI_JUMP.budiRadius).toBe(0);
    expect(w.vy).toBe(BUDI_JUMP.jumpVelocity);
    expect(w.fallen).toBe(false);
  });
});

describe('gapRange', () => {
  it('wird mit der Höhe größer und bleibt unter der Sprunghöhe', () => {
    const easy = gapRange(0);
    const hard = gapRange(BUDI_JUMP.difficultyHeight * 2);
    expect(easy).toEqual(BUDI_JUMP.gapStart);
    expect(hard).toEqual(BUDI_JUMP.gapHard);
    expect(gapRange(BUDI_JUMP.difficultyHeight / 2).max).toBeGreaterThan(easy.max);
    expect(hard.max).toBeLessThan(jumpHeight() - BUDI_JUMP.budiRadius);
  });
});

describe('fillPlatforms', () => {
  it('füllt bis über den oberen Rand, erreichbar und im Bild', () => {
    const w = fillPlatforms(createWorld(7), VIEW);
    expect(w.topPlatformY).toBeGreaterThanOrEqual(w.cameraY + VIEW + BUDI_JUMP.spawnAhead);
    for (let i = 1; i < w.platforms.length; i += 1) {
      const gap = w.platforms[i].y - w.platforms[i - 1].y;
      expect(gap).toBeGreaterThanOrEqual(BUDI_JUMP.gapStart.min);
      expect(gap).toBeLessThan(jumpHeight());
    }
    for (const p of w.platforms) {
      expect(p.x - BUDI_JUMP.platformWidth / 2).toBeGreaterThanOrEqual(0);
      expect(p.x + BUDI_JUMP.platformWidth / 2).toBeLessThanOrEqual(BUDI_JUMP.worldWidth);
    }
  });

  it('gibt dieselbe Welt zurück, wenn nichts zu tun ist', () => {
    const w = fillPlatforms(createWorld(7), VIEW);
    expect(fillPlatforms(w, VIEW)).toBe(w);
  });

  it('entfernt Blätter unter dem Bild', () => {
    const w = fillPlatforms(createWorld(7), VIEW);
    const moved = fillPlatforms({ ...w, cameraY: 100 }, VIEW);
    expect(moved.platforms.every((p) => p.y >= 100 - BUDI_JUMP.platformHeight)).toBe(true);
    expect(moved.topPlatformY).toBeGreaterThanOrEqual(100 + VIEW + BUDI_JUMP.spawnAhead);
  });

  it('ist mit gleichem Startwert gleich', () => {
    expect(fillPlatforms(createWorld(3), VIEW)).toEqual(fillPlatforms(createWorld(3), VIEW));
  });
});

describe('landsOn', () => {
  const p = leaf(50, 10);
  it('nur beim Durchqueren der Oberkante von oben und über dem Blatt', () => {
    expect(landsOn(11, 9, 50, p)).toBe(true);
    expect(landsOn(12, 11, 50, p)).toBe(false);
    expect(landsOn(9, 8, 50, p)).toBe(false);
    expect(landsOn(11, 9, 50 + BUDI_JUMP.platformWidth, p)).toBe(false);
  });
});

function world(over: Partial<JumpWorld>): JumpWorld {
  return { ...createWorld(1), platforms: [], ...over };
}

describe('physicsStep', () => {
  it('Schwerkraft bremst den Aufstieg', () => {
    const w = physicsStep(world({ vy: 50, y: 50 }), 0, VIEW);
    expect(w.vy).toBeCloseTo(50 - (BUDI_JUMP.gravity * STEP) / 1000);
    expect(w.y).toBeGreaterThan(50);
  });

  it('federt beim Landen ab', () => {
    const r = BUDI_JUMP.budiRadius;
    const w = physicsStep(world({ y: 20 + r + 0.1, vy: -60, platforms: [leaf(50, 20)] }), 0, VIEW);
    expect(w.y).toBe(20 + r);
    expect(w.vy).toBe(BUDI_JUMP.jumpVelocity);
  });

  it('springt von unten durch ein Blatt hindurch', () => {
    const r = BUDI_JUMP.budiRadius;
    const w = physicsStep(world({ y: 20 + r - 0.1, vy: 60, platforms: [leaf(50, 20)] }), 0, VIEW);
    expect(w.vy).toBeLessThan(60);
    expect(w.y).toBeGreaterThan(20 + r - 0.1);
  });

  it('geht links raus und kommt rechts wieder rein', () => {
    const w = physicsStep(world({ x: 0.1, y: 50, vx: -BUDI_JUMP.maxSideSpeed }), -BUDI_JUMP.maxSideSpeed, VIEW);
    expect(w.x).toBeGreaterThan(BUDI_JUMP.worldWidth - 2);
  });

  it('nähert sich der Ziel-Geschwindigkeit, ohne sie zu überschreiten', () => {
    let w = world({ y: 500, vy: 0 });
    for (let i = 0; i < 120; i += 1) w = physicsStep(w, BUDI_JUMP.maxSideSpeed, VIEW);
    expect(w.vx).toBeGreaterThan(BUDI_JUMP.maxSideSpeed * 0.95);
    expect(w.vx).toBeLessThanOrEqual(BUDI_JUMP.maxSideSpeed);
  });

  it('Kamera folgt nach oben, nie nach unten', () => {
    const high = physicsStep(world({ y: 300, vy: 10, cameraY: 0 }), 0, VIEW);
    expect(high.cameraY).toBeCloseTo(high.y - VIEW * BUDI_JUMP.cameraFollow);
    const low = physicsStep(world({ y: 50, vy: -10, cameraY: 20 }), 0, VIEW);
    expect(low.cameraY).toBe(20);
  });

  it('fällt Budi unten raus, ist die Runde vorbei', () => {
    const w = physicsStep(world({ y: 20 - BUDI_JUMP.budiRadius, vy: -50, cameraY: 20 }), 0, VIEW);
    expect(w.fallen).toBe(true);
  });
});

describe('advanceWorld', () => {
  it('ist unabhängig von der Bildrate', () => {
    let at60 = createWorld(9);
    let at120 = createWorld(9);
    for (let i = 0; i < 300; i += 1) at60 = advanceWorld(at60, 1000 / 60, 30, VIEW);
    for (let i = 0; i < 600; i += 1) at120 = advanceWorld(at120, 1000 / 120, 30, VIEW);
    expect(at60.y).toBeCloseTo(at120.y, 5);
    expect(at60.x).toBeCloseTo(at120.x, 5);
  });

  it('ohne Blätter fällt Budi und die Welt bleibt dann stehen', () => {
    let w: JumpWorld = { ...createWorld(1), platforms: [], topPlatformY: 1e9 };
    for (let i = 0; i < 400 && !w.fallen; i += 1) w = advanceWorld(w, 16, 0, VIEW);
    expect(w.fallen).toBe(true);
    expect(advanceWorld(w, 16, 0, VIEW)).toBe(w);
  });

  it('springt auf dem Startblatt endlos, wenn man nicht lenkt', () => {
    let w: JumpWorld = { ...createWorld(5), topPlatformY: 1e9 };
    for (let i = 0; i < 60 * 30; i += 1) w = advanceWorld(w, 1000 / 60, 0, VIEW);
    expect(w.fallen).toBe(false);
    // Feste Schritte weichen etwas von der exakten Sprunghöhe ab.
    expect(Math.abs(w.maxY - (BUDI_JUMP.budiRadius + jumpHeight()))).toBeLessThan(1.5);
  });

  it('wer zum nächsten Blatt lenkt, kommt weit nach oben', () => {
    for (const seed of [1, 2, 3, 4, 5]) {
      let w = createWorld(seed);
      // Ziel ist das nächste Blatt über dem, von dem Budi zuletzt abgesprungen ist.
      let base = 0;
      for (let i = 0; i < 60 * 120 && !w.fallen; i += 1) {
        const target = w.platforms.find((p) => p.y > base + 1);
        const dx = target ? target.x - w.x : 0;
        const vx = Math.max(-1, Math.min(1, dx / 4)) * BUDI_JUMP.maxSideSpeed;
        const before = w.vy;
        w = advanceWorld(w, 1000 / 60, vx, VIEW);
        if (w.vy > before + 1) base = Math.max(base, w.y - BUDI_JUMP.budiRadius);
      }
      expect(scoreForHeight(w.maxY)).toBeGreaterThan(100);
    }
  });
});

describe('scoreForHeight', () => {
  it('ein Punkt je heightPerPoint, nie negativ', () => {
    expect(scoreForHeight(0)).toBe(0);
    expect(scoreForHeight(-50)).toBe(0);
    expect(scoreForHeight(BUDI_JUMP.heightPerPoint * 3.5)).toBe(3);
  });
});

describe('revive', () => {
  it('setzt Budi auf ein neues Blatt im Bild und springt weiter', () => {
    const dead = { ...fillPlatforms(createWorld(1), VIEW), cameraY: 400, y: 380, vy: -100, fallen: true };
    const w = revive(dead, VIEW);
    expect(w.fallen).toBe(false);
    expect(w.vy).toBe(BUDI_JUMP.jumpVelocity);
    expect(w.y - BUDI_JUMP.budiRadius).toBeGreaterThan(w.cameraY);
    expect(w.platforms.some((p) => p.y === w.y - BUDI_JUMP.budiRadius && p.x === w.x)).toBe(true);
    const ys = w.platforms.map((p) => p.y);
    expect([...ys].sort((a, b) => a - b)).toEqual(ys);
  });
});
