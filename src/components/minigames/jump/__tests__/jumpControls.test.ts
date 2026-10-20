import { BUDI_JUMP } from '../../../../game/config';
import { speedForTilt, tapDirection, tiltFromAccelerometer } from '../jumpControls';

describe('tiltFromAccelerometer', () => {
  it('dreht Android um, iOS bleibt', () => {
    expect(tiltFromAccelerometer(0.2, 'ios')).toBe(0.2);
    expect(tiltFromAccelerometer(0.2, 'android')).toBe(-0.2);
  });
});

describe('speedForTilt', () => {
  it('Totzone, dann linear, dann gedeckelt', () => {
    expect(speedForTilt(BUDI_JUMP.tiltDeadZone / 2)).toBe(0);
    expect(speedForTilt(BUDI_JUMP.tiltFullAt)).toBeCloseTo(BUDI_JUMP.maxSideSpeed);
    expect(speedForTilt(-1)).toBeCloseTo(-BUDI_JUMP.maxSideSpeed);
    const mid = (BUDI_JUMP.tiltDeadZone + BUDI_JUMP.tiltFullAt) / 2;
    expect(speedForTilt(mid)).toBeCloseTo(BUDI_JUMP.maxSideSpeed / 2);
  });
});

describe('tapDirection', () => {
  it('linke Hälfte links, rechte rechts, letzter Finger gewinnt', () => {
    expect(tapDirection([], 400)).toBe(0);
    expect(tapDirection([50], 400)).toBe(-1);
    expect(tapDirection([350], 400)).toBe(1);
    expect(tapDirection([50, 350], 400)).toBe(1);
    expect(tapDirection([350, 50], 400)).toBe(-1);
    expect(tapDirection([50], 0)).toBe(0);
  });
});
