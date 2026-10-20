import { BUDI_JUMP } from '../../../../game/config';
import { gameEvents } from '../../../../game/events';
import { useGameStore } from '../../../../store/gameStore';
import { difficultyAt, fillPlatforms, platformKindFor } from '../jumpLevel';
import { listenForJumpLightBonus } from '../jumpLightBonus';
import { advanceWorld, jumpHeight, physicsStep, touchesLight } from '../jumpPhysics';
import { addToLightBank, JUMP_GAME_ID, lightBonusForRound, recordHeight } from '../jumpReward';
import { createWorld, type JumpWorld, type Platform } from '../jumpWorld';

const VIEW = 200;
const R = BUDI_JUMP.budiRadius;

function leaf(x: number, y: number, kind: Platform['kind'] = 'normal'): Platform {
  return { x, y, kind, broken: false };
}

function world(over: Partial<JumpWorld>): JumpWorld {
  return { ...createWorld(1), platforms: [], topPlatformY: 1e9, ...over };
}

/** Budi kurz über dem Blatt, im Fallen: landet im nächsten Schritt. */
function landingOn(p: Platform): JumpWorld {
  return world({ x: p.x, y: p.y + R + 0.1, vy: -60, platforms: [p] });
}

describe('Plattform-Typen', () => {
  it('am Start keine brechenden Blätter, oben mehr brechende und weniger Federn', () => {
    expect(difficultyAt(0)).toBe(0);
    expect(difficultyAt(BUDI_JUMP.difficultyHeight * 3)).toBe(1);
    const count = (height: number) => {
      const kinds = { normal: 0, breaking: 0, spring: 0 };
      for (let i = 0; i < 1000; i += 1) kinds[platformKindFor(i / 1000, height)] += 1;
      return kinds;
    };
    const low = count(0);
    const high = count(BUDI_JUMP.difficultyHeight);
    expect(low.breaking).toBe(0);
    expect(low.spring).toBeCloseTo(BUDI_JUMP.springChance.start * 1000, -1);
    expect(high.breaking).toBeCloseTo(BUDI_JUMP.breakingChance.hard * 1000, -1);
    expect(high.spring).toBeLessThan(low.spring);
    expect(high.normal).toBeGreaterThan(high.breaking);
  });

  it('die Strecke enthält in der Höhe alle drei Typen', () => {
    let w: JumpWorld = createWorld(11);
    w = fillPlatforms({ ...w, cameraY: BUDI_JUMP.difficultyHeight }, VIEW * 20);
    const kinds = new Set(w.platforms.map((p) => p.kind));
    expect(kinds).toEqual(new Set(['normal', 'breaking', 'spring']));
  });

  it('normales Blatt trägt immer wieder', () => {
    const w = physicsStep(landingOn(leaf(50, 20)), 0, VIEW);
    expect(w.vy).toBe(BUDI_JUMP.jumpVelocity);
    expect(w.platforms[0].broken).toBe(false);
  });

  it('brechendes Blatt trägt einmal, bricht dann und fällt', () => {
    const w = physicsStep(landingOn(leaf(50, 20, 'breaking')), 0, VIEW);
    expect(w.vy).toBe(BUDI_JUMP.jumpVelocity);
    expect(w.platforms[0].broken).toBe(true);
    const later = physicsStep(w, 0, VIEW);
    expect(later.platforms[0].y).toBeLessThan(20);
    // Ein zweites Mal trägt es nicht.
    const again = physicsStep({ ...landingOn(later.platforms[0]), platforms: later.platforms }, 0, VIEW);
    expect(again.vy).toBeLessThan(0);
  });

  it('Feder-Blatt schießt Budi höher, bleibt aber in der Strecke', () => {
    const w = physicsStep(landingOn(leaf(50, 20, 'spring')), 0, VIEW);
    expect(w.vy).toBe(BUDI_JUMP.springVelocity);
    expect(jumpHeight(BUDI_JUMP, BUDI_JUMP.springVelocity)).toBeGreaterThan(jumpHeight() * 2);
    expect(w.platforms[0].broken).toBe(false);
  });
});

describe('Lichtpunkte', () => {
  it('liegen über einem Blatt und in Sprungweite', () => {
    const w = fillPlatforms(createWorld(4), VIEW * 20);
    expect(w.lights.length).toBeGreaterThan(5);
    for (const l of w.lights) {
      const below = w.platforms.filter((p) => p.y < l.y).pop();
      expect(below).toBeDefined();
      expect(l.y - (below as Platform).y).toBeLessThanOrEqual(BUDI_JUMP.lightLift.max);
      expect(BUDI_JUMP.lightLift.max).toBeLessThan(jumpHeight());
      expect(l.x).toBeGreaterThanOrEqual(BUDI_JUMP.lightRadius);
      expect(l.x).toBeLessThanOrEqual(BUDI_JUMP.worldWidth - BUDI_JUMP.lightRadius);
    }
  });

  it('Budi sammelt einen Lichtpunkt bei Berührung ein', () => {
    const light = { x: 50, y: 60 };
    expect(touchesLight(50, 60 - R, light)).toBe(true);
    expect(touchesLight(50, 60 - R - BUDI_JUMP.lightRadius - 1, light)).toBe(false);
    const w = physicsStep(world({ x: 50, y: 59, vy: 10, lights: [light, { x: 10, y: 300 }] }), 0, VIEW);
    expect(w.lightsCollected).toBe(1);
    expect(w.lights).toEqual([{ x: 10, y: 300 }]);
  });

  it('wer lenkt, sammelt auf dem Weg nach oben Licht', () => {
    let w = createWorld(3);
    let base = 0;
    for (let i = 0; i < 60 * 60 && !w.fallen; i += 1) {
      const target = w.platforms.find((p) => p.y > base + 1 && !p.broken);
      const dx = target ? target.x - w.x : 0;
      const vx = Math.max(-1, Math.min(1, dx / 4)) * BUDI_JUMP.maxSideSpeed;
      const before = w.vy;
      w = advanceWorld(w, 1000 / 60, vx, VIEW);
      if (w.vy > before + 1) base = Math.max(base, w.y - R);
    }
    expect(w.lightsCollected).toBeGreaterThan(0);
  });
});

describe('Belohnung', () => {
  it('Lichtbonus je Lichtpunkt, gedeckelt', () => {
    expect(lightBonusForRound(0)).toBe(0);
    expect(lightBonusForRound(3)).toBe(3 * BUDI_JUMP.lightBonusPerPoint);
    expect(lightBonusForRound(1000)).toBe(BUDI_JUMP.lightBonusMaxPerRound);
    expect(lightBonusForRound(-2)).toBe(0);
  });

  it('Licht-Guthaben wächst bis lightBankMax', () => {
    expect(addToLightBank(10, 5)).toBe(15);
    expect(addToLightBank(BUDI_JUMP.lightBankMax - 1, 30)).toBe(BUDI_JUMP.lightBankMax);
  });

  it('Rekordmarke auf der Höhe des Rekords, ohne Rekord keine', () => {
    expect(recordHeight(0)).toBeNull();
    expect(recordHeight(42)).toBe(42 * BUDI_JUMP.heightPerPoint);
  });
});

describe('Lichtbonus über minigameFinished', () => {
  afterEach(() => {
    gameEvents.clear();
    useGameStore.setState({ jumpLightBank: 0 });
  });

  it('schreibt nur bei Budi Jump gut, der Licht-Balken holt es ab', () => {
    let lights = 4;
    const stop = listenForJumpLightBonus(() => lights);
    gameEvents.emit('minigameFinished', { gameId: 'smash', score: 10, coins: 5, atMs: 0 });
    expect(useGameStore.getState().jumpLightBank).toBe(0);
    gameEvents.emit('minigameFinished', { gameId: JUMP_GAME_ID, score: 10, coins: 5, atMs: 0 });
    expect(useGameStore.getState().jumpLightBank).toBe(lightBonusForRound(4));
    lights = 0;
    gameEvents.emit('minigameFinished', { gameId: JUMP_GAME_ID, score: 10, coins: 5, atMs: 0 });
    expect(useGameStore.getState().jumpLightBank).toBe(lightBonusForRound(4));
    stop();
    lights = 4;
    gameEvents.emit('minigameFinished', { gameId: JUMP_GAME_ID, score: 10, coins: 5, atMs: 0 });
    expect(useGameStore.getState().takeJumpLight()).toBe(lightBonusForRound(4));
    expect(useGameStore.getState().jumpLightBank).toBe(0);
  });
});
