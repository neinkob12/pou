import { DROPS_GAME } from '../../../../game/config';
import {
  barGain,
  clampPot,
  createField,
  fallSpeed,
  grantExtraLife,
  pickKind,
  potTop,
  roundReward,
  spawnInterval,
  stepField,
  type Drop,
  type DropsField,
} from '../dropsLogic';

const W = 300;
const H = 600;
const catchY = potTop(H);

function fieldWith(drops: Drop[], over: Partial<DropsField> = {}): DropsField {
  // nextSpawnMs weit in der Zukunft, damit kein neuer Tropfen dazukommt.
  return { ...createField(W), drops, nextSpawnMs: 1e9, ...over };
}

describe('Tempo', () => {
  it('Fallgeschwindigkeit steigt mit der Zeit und ist gedeckelt', () => {
    expect(fallSpeed(0)).toBe(DROPS_GAME.startFallSpeed);
    expect(fallSpeed(10_000)).toBeGreaterThan(fallSpeed(0));
    expect(fallSpeed(10_000_000)).toBe(DROPS_GAME.maxFallSpeed);
  });

  it('Abstand zwischen Tropfen sinkt bis zur Untergrenze', () => {
    expect(spawnInterval(0)).toBe(DROPS_GAME.startSpawnIntervalMs);
    expect(spawnInterval(10_000)).toBeLessThan(spawnInterval(0));
    expect(spawnInterval(10_000_000)).toBe(DROPS_GAME.minSpawnIntervalMs);
  });
});

describe('pickKind', () => {
  it('verteilt nach spawnWeights', () => {
    const { water, fertilizer } = DROPS_GAME.spawnWeights;
    expect(pickKind(0)).toBe('water');
    expect(pickKind(water + 0.001)).toBe('fertilizer');
    expect(pickKind(water + fertilizer + 0.001)).toBe('salt');
    expect(pickKind(0.999)).toBe('salt');
  });
});

describe('clampPot', () => {
  it('hält den Topf ganz im Feld', () => {
    const half = DROPS_GAME.potWidth / 2;
    expect(clampPot(-50, W)).toBe(half);
    expect(clampPot(W + 50, W)).toBe(W - half);
    expect(clampPot(150, W)).toBe(150);
  });
});

describe('stepField', () => {
  it('Start: Topf mittig, volle Leben, erster Tropfen fällt sofort', () => {
    const f = createField(W);
    expect(f.potX).toBe(W / 2);
    expect(f.lives).toBe(DROPS_GAME.lives);
    const { field } = stepField(f, 16, 0, W, H, 0, 0.5);
    expect(field.drops).toHaveLength(1);
    expect(field.drops[0]!.kind).toBe('water');
    expect(field.nextSpawnMs).toBe(DROPS_GAME.startSpawnIntervalMs);
  });

  it('Wasser über dem Topf wird gefangen und zählt Punkte', () => {
    const f = fieldWith([{ id: 1, kind: 'water', x: W / 2, y: catchY - 1 }]);
    const { field, events } = stepField(f, 100, 0, W, H, 0, 0);
    expect(events).toEqual({ points: DROPS_GAME.pointsPerDrop, livesLost: 0 });
    expect(field.caughtWater).toBe(1);
    expect(field.drops).toHaveLength(0);
  });

  it('Dünger zählt für den Nährstoffbalken', () => {
    const f = fieldWith([{ id: 1, kind: 'fertilizer', x: W / 2, y: catchY - 1 }]);
    expect(stepField(f, 100, 0, W, H, 0, 0).field.caughtFertilizer).toBe(1);
  });

  it('Salz im Topf kostet ein Leben, keine Punkte', () => {
    const f = fieldWith([{ id: 1, kind: 'salt', x: W / 2, y: catchY - 1 }]);
    const { field, events } = stepField(f, 100, 0, W, H, 0, 0);
    expect(events).toEqual({ points: 0, livesLost: 1 });
    expect(field.lives).toBe(DROPS_GAME.lives - 1);
  });

  it('Leben fallen nie unter 0', () => {
    const salt: Drop[] = [1, 2].map((id) => ({ id, kind: 'salt', x: W / 2, y: catchY - 1 }));
    expect(stepField(fieldWith(salt, { lives: 1 }), 100, 0, W, H, 0, 0).field.lives).toBe(0);
  });

  it('daneben: Tropfen fällt weiter und verschwindet unten ohne Strafe', () => {
    const f = fieldWith([{ id: 1, kind: 'salt', x: 5, y: catchY - 1 }], { potX: W - 60 });
    const mid = stepField(f, 100, 0, W, H, 0, 0);
    expect(mid.field.drops).toHaveLength(1);
    expect(mid.field.lives).toBe(DROPS_GAME.lives);
    const gone = stepField(mid.field, 10_000, 0, W, H, 0, 0);
    expect(gone.field.drops).toHaveLength(0);
    expect(gone.events.livesLost).toBe(0);
  });

  it('später fällt alles schneller', () => {
    const f = fieldWith([{ id: 1, kind: 'water', x: 10, y: 0 }], { potX: W - 60 });
    const early = stepField(f, 100, 0, W, H, 0, 0).field.drops[0]!.y;
    const late = stepField(f, 100, 60_000, W, H, 0, 0).field.drops[0]!.y;
    expect(late).toBeGreaterThan(early);
  });

  it('ändert das alte Feld nicht', () => {
    const f = fieldWith([{ id: 1, kind: 'water', x: 10, y: 0 }]);
    stepField(f, 100, 0, W, H, 0, 0);
    expect(f.drops[0]!.y).toBe(0);
  });
});

describe('grantExtraLife', () => {
  it('gibt ein Leben zurück und räumt Salz ab', () => {
    const f = fieldWith(
      [
        { id: 1, kind: 'salt', x: 10, y: 10 },
        { id: 2, kind: 'water', x: 20, y: 10 },
      ],
      { lives: 0 },
    );
    const next = grantExtraLife(f);
    expect(next.lives).toBe(1);
    expect(next.drops.map((d) => d.kind)).toEqual(['water']);
  });
});

describe('Balken-Zuwachs', () => {
  it('ist je Balken auf maxBarGainPerRound gedeckelt', () => {
    expect(DROPS_GAME.maxBarGainPerRound).toBe(40);
    expect(barGain(2)).toBe(2 * DROPS_GAME.barGainPerDrop);
    expect(barGain(1000)).toBe(DROPS_GAME.maxBarGainPerRound);
  });

  it('füllt Wasser nur bis zur Überwässerungs-Grenze, Nährstoffe bis voll', () => {
    const r = roundReward(1000, 1000, { water: 85.5, nutrients: 90 }, { water: 100, nutrients: 100 });
    expect(r).toEqual({ water: 14, nutrients: 10 });
  });

  it('nie negativ, auch über der Grenze', () => {
    expect(roundReward(5, 5, { water: 80, nutrients: 100 }, { water: 70, nutrients: 100 })).toEqual({
      water: 0,
      nutrients: 0,
    });
  });
});
