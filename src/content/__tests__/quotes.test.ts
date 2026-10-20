import { STRAINS, type PhaseId, type StrainId } from '../../game/config';
import { phaseLabels } from '../strings';
import {
  PHASE_CHANGE_QUOTES,
  QUOTES,
  STRAIN_QUOTES,
  pickPhaseChangeQuote,
  pickQuote,
  type QuoteSituation,
} from '../quotes';

const strainIds = Object.keys(STRAINS) as StrainId[];
const phaseIds = Object.keys(phaseLabels) as PhaseId[];
const situations = Object.keys(QUOTES) as QuoteSituation[];

describe('quotes', () => {
  it('hat rund 60 Sprüche', () => {
    const total =
      situations.reduce((n, s) => n + QUOTES[s].length, 0) +
      phaseIds.reduce((n, p) => n + PHASE_CHANGE_QUOTES[p].length, 0) +
      strainIds.reduce((n, id) => n + STRAIN_QUOTES[id].length, 0);
    expect(total).toBeGreaterThanOrEqual(55);
  });

  it('jede Situation hat mindestens fünf Sprüche', () => {
    expect(situations.sort()).toEqual(
      ['greeting', 'hungry', 'nightDisturbed', 'petted', 'thirsty'].sort(),
    );
    for (const s of situations) expect(QUOTES[s].length).toBeGreaterThanOrEqual(5);
  });

  it('jede Phase hat einen Phasenwechsel-Spruch', () => {
    for (const p of phaseIds) expect(PHASE_CHANGE_QUOTES[p].length).toBeGreaterThanOrEqual(1);
  });

  it('jede Sorte aus STRAINS hat mindestens drei eigene Sprüche', () => {
    for (const id of strainIds) expect(STRAIN_QUOTES[id].length).toBeGreaterThanOrEqual(3);
  });

  it('kein Spruch ist leer oder doppelt', () => {
    const all = [
      ...situations.flatMap((s) => QUOTES[s]),
      ...phaseIds.flatMap((p) => PHASE_CHANGE_QUOTES[p]),
      ...strainIds.flatMap((id) => STRAIN_QUOTES[id]),
    ];
    for (const q of all) expect(q.trim()).not.toBe('');
    expect(new Set(all).size).toBe(all.length);
  });

  it('pickQuote wählt deterministisch aus dem Pool', () => {
    expect(pickQuote('thirsty', undefined, () => 0)).toBe(QUOTES.thirsty[0]);
    expect(pickQuote('thirsty', undefined, () => 0.9999)).toBe(
      QUOTES.thirsty[QUOTES.thirsty.length - 1],
    );
  });

  it('pickQuote mischt Sortensprüche nur bei der Begrüßung dazu', () => {
    expect(pickQuote('greeting', 'koelsch', () => 0.9999)).toBe(
      STRAIN_QUOTES.koelsch[STRAIN_QUOTES.koelsch.length - 1],
    );
    expect(pickQuote('hungry', 'koelsch', () => 0.9999)).toBe(
      QUOTES.hungry[QUOTES.hungry.length - 1],
    );
  });

  it('pickPhaseChangeQuote liefert einen Spruch der Phase', () => {
    for (const p of phaseIds) {
      expect(PHASE_CHANGE_QUOTES[p]).toContain(pickPhaseChangeQuote(p, () => 0.5));
    }
  });
});
