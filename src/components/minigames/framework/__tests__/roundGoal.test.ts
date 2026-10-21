import { beatsRecord, roundGoal } from '../roundGoal';

const table = { demo: [10, 20, 30] as const };

describe('Rundenziel (Auftrag 45)', () => {
  it('zeigt die nächste Sterne-Grenze', () => {
    expect(roundGoal('demo', 0, table)).toEqual({ nextStars: 1, points: 10 });
    expect(roundGoal('demo', 10, table)).toEqual({ nextStars: 2, points: 20 });
    expect(roundGoal('demo', 29, table)).toEqual({ nextStars: 3, points: 30 });
  });

  it('alle Sterne geholt: kein weiteres Ziel, unbekanntes Spiel: gar keins', () => {
    expect(roundGoal('demo', 30, table)).toEqual({ nextStars: null, points: null });
    expect(roundGoal('nix', 5, table)).toBeNull();
  });

  it('Rekord fällt einmal, nur wenn es einen alten gab', () => {
    expect(beatsRecord(11, 10, false)).toBe(true);
    expect(beatsRecord(10, 10, false)).toBe(false);
    expect(beatsRecord(11, 10, true)).toBe(false);
    expect(beatsRecord(5, 0, false)).toBe(false);
  });
});
