import { PHASE_LABELS } from '../../../game/config';
import type { PlantStatus } from '../../../game/timeEngine';
import { room } from '../../../content/strings';
import { formatRemaining, phaseText } from '../phaseText';

const HOUR = 60 * 60 * 1000;

function status(overrides: Partial<PlantStatus>): PlantStatus {
  return {
    phase: 'seedling',
    ageDays: 8,
    phaseStartDay: 7,
    phaseEndDay: 21,
    phaseProgress: 0.25,
    realMsUntilPhaseEnd: 5 * HOUR,
    canFlipLight: false,
    canHarvest: false,
    ...overrides,
  };
}

describe('formatRemaining', () => {
  it('rundet auf volle Stunden auf', () => {
    expect(formatRemaining(status({ realMsUntilPhaseEnd: 4.2 * HOUR }))).toBe(room.remainingHours(5));
  });

  it('zeigt unter einer Stunde einen eigenen Text', () => {
    expect(formatRemaining(status({ realMsUntilPhaseEnd: 10 * 60 * 1000 }))).toBe(room.remainingLessThanHour);
  });

  it('offenes Ende im Wachstum: Spieler entscheidet', () => {
    expect(formatRemaining(status({ phase: 'vegetative', realMsUntilPhaseEnd: null }))).toBe(room.openEnd);
  });

  it('erntebereit hat eigenen Text', () => {
    expect(formatRemaining(status({ phase: 'ready', realMsUntilPhaseEnd: null }))).toBe(room.readyToHarvest);
  });
});

describe('phaseText', () => {
  it('ohne Pflanze: Hinweis und leerer Balken', () => {
    expect(phaseText(null)).toEqual({ phaseLabel: room.noPlant, remaining: '', progress: 0 });
  });

  it('mit Pflanze: Phasenname, Restzeit, Fortschritt', () => {
    expect(phaseText(status({}))).toEqual({
      phaseLabel: PHASE_LABELS.seedling,
      remaining: room.remainingHours(5),
      progress: 0.25,
    });
  });
});
