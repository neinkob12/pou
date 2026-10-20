import { DROPS_GAME, MINIGAME_FEEL } from '../../../../game/config';
import { createField, potTop, type DropsField } from '../dropsLogic';
import { movePotByKeys, POT_BOUNCE_MS, potSquash, vanishedDrops } from '../dropsFeel';

const W = 300;
const H = 600;

function field(over: Partial<DropsField>): DropsField {
  return { ...createField(W), nextSpawnMs: 1e9, ...over };
}

describe('Tropfen fangen: Feedback', () => {
  it('erkennt gefangene und daneben gefallene Tropfen', () => {
    const before = field({
      potX: 150,
      drops: [
        { id: 1, kind: 'water', x: 150, y: potTop(H) - 1 },
        { id: 2, kind: 'salt', x: 20, y: H + 5 },
        { id: 3, kind: 'fertilizer', x: 60, y: 100 },
      ],
    });
    const after = field({ potX: 150, drops: [{ id: 3, kind: 'fertilizer', x: 60, y: 110 }] });
    expect(vanishedDrops(before, after, H)).toEqual([
      { kind: 'water', x: 150, caught: true },
      { kind: 'salt', x: 20, caught: false },
    ]);
  });

  it('neue Tropfen zählen nicht', () => {
    const before = field({ drops: [] });
    const after = field({ drops: [{ id: 9, kind: 'water', x: 10, y: -14 }] });
    expect(vanishedDrops(before, after, H)).toEqual([]);
  });

  it('Tastatur fährt den Topf und hält ihn im Feld', () => {
    expect(movePotByKeys(150, 0, 16, W)).toBe(150);
    expect(movePotByKeys(150, 1, 100, W)).toBeCloseTo(150 + MINIGAME_FEEL.keyboardPotSpeed / 10);
    expect(movePotByKeys(60, -1, 1000, W)).toBe(DROPS_GAME.potWidth / 2);
  });

  it('Topf federt nach dem Fang und kommt zur Ruhe', () => {
    expect(potSquash(0)).toBe(1);
    expect(potSquash(POT_BOUNCE_MS / 2)).toBeLessThan(1);
    expect(potSquash(POT_BOUNCE_MS)).toBe(1);
    expect(potSquash(-5)).toBe(1);
  });
});
