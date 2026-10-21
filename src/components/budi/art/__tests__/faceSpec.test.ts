import { CHEEK_X, EYE_RX, EYE_X, EYE_Y, FACES, hasMovingIris, MOUTH_Y } from '../faceSpec';
import { POT_BODY } from '../potShape';

const numbers = (d: string) => (d.match(/-?\d+(\.\d+)?/g) ?? []).map(Number);

describe('FACES', () => {
  it('hat mindestens 7 verschiedene Mimiken, auch die neuen', () => {
    const specs = new Set(Object.values(FACES).map((f) => JSON.stringify(f)));
    expect(specs.size).toBeGreaterThanOrEqual(7);
    for (const id of ['love', 'giggle', 'yum', 'yawn'] as const) expect(FACES[id]).toBeDefined();
  });

  it('nur offene Augen schauen umher', () => {
    expect(hasMovingIris('b10_face_neutral')).toBe(true);
    expect(hasMovingIris('b10_face_surprised')).toBe(true);
    expect(hasMovingIris('love')).toBe(false);
    expect(hasMovingIris('b10_face_snoring')).toBe(false);
  });
});

describe('Gesicht liegt auf dem Topf', () => {
  const xs = numbers(POT_BODY).filter((_, i) => i % 2 === 0);
  const ys = numbers(POT_BODY).filter((_, i) => i % 2 === 1);

  it('Augen, Wangen und Mund innerhalb des Topfbauchs', () => {
    expect(EYE_X[0] - EYE_RX).toBeGreaterThan(Math.min(...xs));
    expect(EYE_X[1] + EYE_RX).toBeLessThan(Math.max(...xs));
    expect(CHEEK_X[0]).toBeGreaterThan(Math.min(...xs));
    expect(EYE_Y).toBeGreaterThan(Math.min(...ys));
    expect(MOUTH_Y).toBeLessThan(Math.max(...ys));
  });
});
