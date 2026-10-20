import { BUDI_JUMP } from '../../../../game/config';
import { colors, gameColors } from '../../../../lib/theme';
import { budiShape, landingBetween, mixColor, skyAt, SQUASH_MS, starsVisibility } from '../jumpFeel';
import { createWorld } from '../jumpWorld';

describe('Budi Jump: Spielgefühl', () => {
  it('mischt Farben', () => {
    expect(mixColor('#000000', '#ffffff', 0)).toBe('#000000');
    expect(mixColor('#000000', '#ffffff', 1)).toBe('#FFFFFF');
    expect(mixColor('#000000', '#ffffff', 0.5)).toBe('#808080');
    expect(mixColor('#102030', '#102030', 0.3)).toBe('#102030');
  });

  it('Himmel geht mit der Höhe vom Tag in die Nacht', () => {
    expect(skyAt(0)).toEqual({ top: gameColors.sky, bottom: colors.cream });
    expect(skyAt(BUDI_JUMP.difficultyHeight * 5).top).toBe(colors.night);
    expect(skyAt(-50)).toEqual(skyAt(0));
  });

  it('Sterne erst ab dem Abend', () => {
    expect(starsVisibility(0)).toBe(0);
    expect(starsVisibility(BUDI_JUMP.difficultyHeight)).toBe(1);
  });

  it('erkennt Landung auf Blatt und Feder', () => {
    const w = createWorld(1);
    const falling = { ...w, vy: -50 };
    expect(landingBetween(falling, { ...falling, vy: BUDI_JUMP.jumpVelocity })).toBe('leaf');
    expect(landingBetween(falling, { ...falling, vy: BUDI_JUMP.springVelocity })).toBe('spring');
    expect(landingBetween(falling, { ...falling, vy: -55 })).toBe('none');
    expect(landingBetween(falling, { ...falling, vy: BUDI_JUMP.jumpVelocity, fallen: true })).toBe('none');
  });

  it('Budi staucht nach der Landung und streckt sich im Steigen', () => {
    const squash = budiShape(SQUASH_MS / 2, 0);
    expect(squash.sx).toBeGreaterThan(1);
    expect(squash.sy).toBeLessThan(1);
    const rising = budiShape(SQUASH_MS * 3, BUDI_JUMP.springVelocity);
    expect(rising.sy).toBeGreaterThan(1);
    expect(budiShape(SQUASH_MS * 3, 0)).toEqual({ sx: 1, sy: 1 });
  });
});
