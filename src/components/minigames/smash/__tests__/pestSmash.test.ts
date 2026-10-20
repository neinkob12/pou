import { PEST_SMASH } from '../../../../game/config';
import {
  comboMultiplier,
  createSmashState,
  critterKindFor,
  critterLifetimeMs,
  earnsPestProtection,
  holeAt,
  holeCount,
  holeLayout,
  pickFreeHole,
  spawnIntervalMs,
  stepSmash,
  tapHole,
  type Critter,
  type SmashState,
} from '../pestSmash';

const END_MS = PEST_SMASH.durationSeconds * 1000;

function critter(partial: Partial<Critter>): Critter {
  return { id: 1, kind: 'mite', hole: 0, spawnedAtMs: 0, lifetimeMs: 1000, hitAtMs: null, ...partial };
}

function withCritters(critters: Critter[], extra: Partial<SmashState> = {}): SmashState {
  return { ...createSmashState(), critters, nextSpawnAtMs: Number.MAX_SAFE_INTEGER, ...extra };
}

describe('Schädlings-Smash: Tempo', () => {
  it('Runde dauert 45 Sekunden', () => {
    expect(PEST_SMASH.durationSeconds).toBe(45);
  });

  it('Tiere kommen über die Runde schneller und bleiben kürzer', () => {
    expect(spawnIntervalMs(0)).toBe(PEST_SMASH.spawnIntervalStartMs);
    expect(spawnIntervalMs(END_MS)).toBe(PEST_SMASH.spawnIntervalEndMs);
    expect(spawnIntervalMs(END_MS / 2)).toBeLessThan(spawnIntervalMs(END_MS / 4));
    expect(critterLifetimeMs(0)).toBe(PEST_SMASH.lifetimeStartMs);
    expect(critterLifetimeMs(END_MS)).toBe(PEST_SMASH.lifetimeEndMs);
    expect(critterLifetimeMs(END_MS * 2)).toBe(PEST_SMASH.lifetimeEndMs);
  });

  it('in der zweiten Hälfte tauchen mehr Tiere auf als in der ersten', () => {
    let state = createSmashState();
    let firstHalf = 0;
    let secondHalf = 0;
    for (let t = 0; t <= END_MS; t += 16) {
      const before = state.nextId;
      state = stepSmash(state, t, 0.9, 0.5);
      const spawned = state.nextId - before;
      if (t < END_MS / 2) firstHalf += spawned;
      else secondHalf += spawned;
    }
    expect(secondHalf).toBeGreaterThan(firstHalf);
  });
});

describe('Schädlings-Smash: Tiere', () => {
  it('Zufall verteilt auf Marienkäfer, Spinnmilbe, Trauermücke', () => {
    expect(critterKindFor(0)).toBe('ladybug');
    expect(critterKindFor(PEST_SMASH.ladybugChance - 0.001)).toBe('ladybug');
    expect(critterKindFor(PEST_SMASH.ladybugChance)).toBe('mite');
    expect(critterKindFor(0.999)).toBe('gnat');
  });

  it('freies Loch: nie ein belegtes, -1 wenn voll', () => {
    const taken = [critter({ hole: 0 }), critter({ id: 2, hole: 1 })];
    for (const r of [0, 0.5, 0.999]) {
      expect([2]).toContain(pickFreeHole(r, taken, 3));
    }
    expect(pickFreeHole(0.5, [...taken, critter({ id: 3, hole: 2 })], 3)).toBe(-1);
  });

  it('Schritt: Tier taucht auf, verschwindet nach Ablauf', () => {
    const s1 = stepSmash(createSmashState(), 0, 0.9, 0);
    expect(s1.critters).toHaveLength(1);
    expect(s1.critters[0]).toMatchObject({ hole: 0, kind: 'gnat', spawnedAtMs: 0 });
    expect(s1.nextSpawnAtMs).toBe(PEST_SMASH.spawnIntervalStartMs);

    const quiet = { ...s1, nextSpawnAtMs: Number.MAX_SAFE_INTEGER };
    expect(stepSmash(quiet, 10, 0.9, 0)).toBe(quiet);
    expect(stepSmash(quiet, s1.critters[0].lifetimeMs, 0.9, 0).critters).toHaveLength(0);
  });

  it('alle Löcher voll: kein neues Tier, nächster Versuch im nächsten Frame', () => {
    const full = Array.from({ length: holeCount() }, (_, i) => critter({ id: i + 1, hole: i, lifetimeMs: 10_000 }));
    const state = withCritters(full, { nextSpawnAtMs: 0 });
    expect(stepSmash(state, 5, 0.5, 0.5)).toBe(state);
  });
});

describe('Schädlings-Smash: Treffer und Kombo', () => {
  it('Schädling treffen gibt Punkte, Fehltipp nichts', () => {
    const state = withCritters([critter({ hole: 4 })]);
    expect(tapHole(state, 3, 100, 0).points).toBe(0);
    const hit = tapHole(state, 4, 100, 0);
    expect(hit.points).toBe(PEST_SMASH.pointsPerPest);
    expect(hit.kind).toBe('mite');
    expect(hit.state.combo).toBe(1);
    // Schon getroffen: zweiter Tipp zählt nicht.
    expect(tapHole(hit.state, 4, 120, 1).points).toBe(0);
  });

  it('abgelaufenes Tier zählt nicht', () => {
    expect(tapHole(withCritters([critter({ lifetimeMs: 500 })]), 0, 500, 0).points).toBe(0);
  });

  it('schnelle Treffer steigern die Kombo und den Multiplikator', () => {
    const critters = Array.from({ length: 12 }, (_, i) => critter({ id: i + 1, hole: i, lifetimeMs: 100_000 }));
    let state = withCritters(critters);
    const points: number[] = [];
    for (let i = 0; i < 12; i++) {
      const r = tapHole(state, i, i * 100, 0);
      points.push(r.points);
      state = r.state;
    }
    expect(state.combo).toBe(12);
    expect(points.slice(0, PEST_SMASH.comboStep).every((p) => p === 1)).toBe(true);
    expect(points[PEST_SMASH.comboStep]).toBe(2);
    expect(Math.max(...points)).toBeLessThanOrEqual(PEST_SMASH.maxComboMultiplier);
  });

  it('langsamer Treffer startet die Kombo neu, Kombo verfällt im Schritt', () => {
    const state = withCritters(
      [critter({ hole: 0, lifetimeMs: 100_000 }), critter({ id: 2, hole: 1, lifetimeMs: 100_000 })],
      { combo: 7, lastHitAtMs: 0 },
    );
    expect(tapHole(state, 0, PEST_SMASH.comboWindowMs + 1, 0).state.combo).toBe(1);
    expect(stepSmash(state, PEST_SMASH.comboWindowMs + 1, 0.5, 0.5).combo).toBe(0);
  });

  it('Marienkäfer: Abzug nie unter 0, Kombo vorbei', () => {
    const state = withCritters([critter({ kind: 'ladybug' })], { combo: 4, lastHitAtMs: 0 });
    const hit = tapHole(state, 0, 100, 20);
    expect(hit.points).toBe(-PEST_SMASH.ladybugPenalty);
    expect(hit.state.combo).toBe(0);
    expect(tapHole(state, 0, 100, 1).points).toBe(-1);
    expect(tapHole(state, 0, 100, 0).points).toBe(0);
  });

  it('Multiplikator: 1 ohne Kombo, gedeckelt', () => {
    expect(comboMultiplier(0)).toBe(1);
    expect(comboMultiplier(1)).toBe(1);
    expect(comboMultiplier(1000)).toBe(PEST_SMASH.maxComboMultiplier);
  });

  it('getroffenes Tier bleibt kurz stehen, dann weg', () => {
    const hit = tapHole(withCritters([critter({ lifetimeMs: 100_000 })]), 0, 100, 0).state;
    expect(stepSmash(hit, 100 + PEST_SMASH.hitShowMs - 1, 0.5, 0.5).critters).toHaveLength(1);
    expect(stepSmash(hit, 100 + PEST_SMASH.hitShowMs, 0.5, 0.5).critters).toHaveLength(0);
  });
});

describe('Schädlings-Smash: Blatt und Löcher', () => {
  it('Lochmitte trifft das Loch, Rand zwischen Löchern nicht', () => {
    for (let h = 0; h < holeCount(); h++) {
      const { x, y } = holeLayout(h, 300, 400);
      expect(holeAt(x, y, 300, 400)).toBe(h);
    }
    expect(holeAt(0, 0, 300, 400)).toBe(-1);
    expect(holeAt(-5, 50, 300, 400)).toBe(-1);
    expect(holeAt(50, 50, 0, 0)).toBe(-1);
  });

  it('Schutz erst ab Mindestpunkten', () => {
    expect(earnsPestProtection(PEST_SMASH.protectionMinScore)).toBe(true);
    expect(earnsPestProtection(PEST_SMASH.protectionMinScore - 1)).toBe(false);
  });
});
