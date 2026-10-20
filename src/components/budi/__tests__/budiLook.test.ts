import type { PhaseId } from '../../../game/config';
import type { BudiVariantId } from '../../../lib/assets';
import {
  canBlink,
  computeBudiLook,
  faceFor,
  LATE_PHASE_PROGRESS,
  plantLayerFor,
  plantLayerWithStrain,
  type BudiLookInput,
} from '../budiLook';

const none = () => false;
const base: BudiLookInput = {
  phase: 'vegetative',
  phaseProgress: 0,
  strainId: 'gustav',
  condition: 'ok',
  reaction: null,
  hovering: false,
};

describe('plantLayerFor', () => {
  it('wählt je Phase eine Pflanzen-Ebene', () => {
    const cases: [PhaseId, number, string][] = [
      ['germination', 0, 'b01_germination'],
      ['seedling', 0.9, 'b02_seedling'],
      ['vegetative', 0, 'b03_vegetative_small'],
      ['vegetative', LATE_PHASE_PROGRESS, 'b04_vegetative_large'],
      ['flowering', 0.2, 'b05_flowering_early'],
      ['flowering', 0.8, 'b06_flowering_full'],
      ['ready', 0, 'b06_flowering_full'],
      ['drying', 0, 'b07_drying'],
      ['done', 1, 'b08_harvest_ready'],
    ];
    for (const [phase, progress, layer] of cases) {
      expect(plantLayerFor(phase, progress)).toBe(layer);
    }
  });
});

describe('faceFor', () => {
  it('folgt dem Zustand aus needs.ts', () => {
    expect(faceFor('ok', null, false)).toBe('b10_face_neutral');
    expect(faceFor('thirsty', null, false)).toBe('b10_face_thirsty');
    expect(faceFor('hungry', null, false)).toBe('b10_face_hungry');
    expect(faceFor('stressed', null, false)).toBe('b10_face_stressed');
    expect(faceFor('sick', null, false)).toBe('b10_face_sick');
    expect(faceFor('coma', null, false)).toBe('b10_face_coma');
  });

  it('zeigt kurz die Reaktion auf Pflege', () => {
    expect(faceFor('thirsty', { type: 'water', feedback: 'success' }, false)).toBe('b10_face_happy');
    expect(faceFor('ok', { type: 'pet', feedback: 'success' }, false)).toBe('b10_face_very_happy');
    expect(faceFor('ok', { type: 'water', feedback: 'warning' }, false)).toBe('b10_face_offended');
  });

  it('ignoriert wirkungslose Pflege und schaut beim Schweben überrascht', () => {
    expect(faceFor('hungry', { type: 'water', feedback: 'error' }, false)).toBe('b10_face_hungry');
    expect(faceFor('ok', null, true)).toBe('b10_face_surprised');
  });

  it('Koma und krank lassen sich nicht überspielen', () => {
    expect(faceFor('coma', { type: 'pet', feedback: 'success' }, true)).toBe('b10_face_coma');
    expect(faceFor('sick', null, true)).toBe('b10_face_sick');
  });
});

describe('canBlink', () => {
  it('blinzelt nur mit offenen Augen', () => {
    expect(canBlink('b10_face_neutral')).toBe(true);
    expect(canBlink('b10_face_coma')).toBe(false);
    expect(canBlink('b10_face_snoring')).toBe(false);
  });
});

describe('plantLayerWithStrain', () => {
  it('färbt Lila Lotte erst in der Blüte ein', () => {
    expect(plantLayerWithStrain('b03_vegetative_small', 'vegetative', 'lotte', none).tint).toBeNull();
    expect(plantLayerWithStrain('b06_flowering_full', 'flowering', 'lotte', none).tint).toBe('lavender');
  });

  it('nimmt eine eigene Varianten-Datei statt Farbschleier', () => {
    const has = (key: BudiVariantId) => key === 'b06_flowering_full_lotte';
    const layer = plantLayerWithStrain('b06_flowering_full', 'flowering', 'lotte', has);
    expect(layer).toMatchObject({ key: 'b06_flowering_full_lotte', base: 'b06_flowering_full', tint: null });
  });

  it('formt Sascha höher und Anton kleiner, nicht aber die Ernte-Ebenen', () => {
    const sascha = plantLayerWithStrain('b04_vegetative_large', 'vegetative', 'sascha', none);
    expect(sascha.scaleY).toBeGreaterThan(1);
    expect(sascha.scaleX).toBeLessThan(1);
    const anton = plantLayerWithStrain('b04_vegetative_large', 'vegetative', 'anton', none);
    expect(anton.scaleX).toBeLessThan(1);
    expect(anton.scaleY).toBeLessThan(1);
    expect(plantLayerWithStrain('b08_harvest_ready', 'done', 'anton', none)).toMatchObject({ scaleX: 1, scaleY: 1 });
  });
});

describe('computeBudiLook', () => {
  it('ohne Samen nur der leere Topf', () => {
    const look = computeBudiLook({ ...base, phase: null, strainId: null, condition: null }, none);
    expect(look).toEqual({ plant: null, pot: 'u01_pot_standard', face: null, blink: false });
  });

  it('baut Ebenen aus Pflanze, Topf und Gesicht', () => {
    const look = computeBudiLook({ ...base, condition: 'thirsty' }, none);
    expect(look.plant?.key).toBe('b03_vegetative_small');
    expect(look.pot).toBe('u01_pot_standard');
    expect(look.face).toBe('b10_face_thirsty');
    expect(look.blink).toBe(true);
  });

  it('im Koma kein Blinzeln', () => {
    const look = computeBudiLook({ ...base, condition: 'coma' }, none);
    expect(look.face).toBe('b10_face_coma');
    expect(look.blink).toBe(false);
  });

  it('nach der Ernte nur die Ernte-Ebene, ohne Topf und Gesicht', () => {
    const look = computeBudiLook({ ...base, phase: 'drying' }, none);
    expect(look.plant?.key).toBe('b07_drying');
    expect(look.pot).toBeNull();
    expect(look.face).toBeNull();
  });
});
