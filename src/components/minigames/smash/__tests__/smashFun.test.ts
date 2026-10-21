import { MINIGAME_FUN, PEST_SMASH } from '../../../../game/config';
import { createSmashState, isArmoredRoll, stepSmash, tapHole, type Critter, type SmashState } from '../pestSmash';

const fun = MINIGAME_FUN.smash;

function armored(partial: Partial<Critter> = {}): Critter {
  return {
    id: 1,
    kind: 'armored',
    hole: 0,
    spawnedAtMs: 0,
    lifetimeMs: 5000,
    hitAtMs: null,
    hitsLeft: fun.armoredHits,
    ...partial,
  };
}

function quiet(critters: Critter[]): SmashState {
  return {
    ...createSmashState(),
    critters,
    nextSpawnAtMs: Number.MAX_SAFE_INTEGER,
    swarms: fun.swarmAtMs.length,
  };
}

describe('Schädlings-Smash: Panzermilbe (Auftrag 45)', () => {
  it('nur nach armoredFromMs und nur statt einer Milbe', () => {
    const r = PEST_SMASH.ladybugChance + 0.001;
    expect(isArmoredRoll(r, fun.armoredFromMs - 1)).toBe(false);
    expect(isArmoredRoll(r, fun.armoredFromMs)).toBe(true);
    expect(isArmoredRoll(0, fun.armoredFromMs)).toBe(false); // Marienkäfer bleibt Marienkäfer
    expect(isArmoredRoll(0.999, fun.armoredFromMs)).toBe(false); // Mücke bleibt Mücke
  });

  it('erster Treffer knackt den Panzer ohne Punkte, zweiter bringt den Bonus', () => {
    const first = tapHole(quiet([armored()]), 0, 100, 0);
    expect(first.cracked).toBe(true);
    expect(first.points).toBe(0);
    expect(first.state.critters[0].hitAtMs).toBeNull();
    const second = tapHole(first.state, 0, 300, 0);
    expect(second.cracked).toBeUndefined();
    expect(second.points).toBe((PEST_SMASH.pointsPerPest + fun.armoredBonus) * 1);
    expect(second.state.critters[0].hitAtMs).toBe(300);
  });

  it('taucht im Spiel auf und bleibt länger', () => {
    const s = stepSmash({ ...createSmashState(), swarms: 99 }, fun.armoredFromMs, PEST_SMASH.ladybugChance + 0.001, 0);
    expect(s.critters[0].kind).toBe('armored');
    expect(s.critters[0].lifetimeMs).toBeGreaterThan(PEST_SMASH.lifetimeStartMs);
  });
});

describe('Schädlings-Smash: Schwarm (Auftrag 45)', () => {
  it('zur Schwarmzeit kommen mehrere Mücken auf einmal, jeder Schwarm nur einmal', () => {
    const before: SmashState = {
      ...createSmashState(),
      nextSpawnAtMs: Number.MAX_SAFE_INTEGER,
    };
    const s = stepSmash(before, fun.swarmAtMs[0], 0.5, 0.5);
    expect(s.swarms).toBe(1);
    expect(s.critters.filter((c) => c.kind === 'gnat')).toHaveLength(fun.swarmSize);
    expect(new Set(s.critters.map((c) => c.hole)).size).toBe(fun.swarmSize);
    const again = stepSmash(s, fun.swarmAtMs[0] + 16, 0.5, 0.5);
    expect(again.critters).toHaveLength(fun.swarmSize);
  });
});
