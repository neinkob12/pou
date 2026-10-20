import { MINIGAME_FEEL } from '../../../../game/config';
import {
  burst,
  comboAfterHit,
  consumeHitStop,
  createFx,
  particleAt,
  pruneFx,
  shake,
  shakeOffset,
  shakeStrength,
} from '../fx/fxLogic';

const half = () => 0.5;

describe('Partikel', () => {
  it('burst legt die gewünschte Zahl an der Stelle an', () => {
    const fx = burst(createFx(), 10, 20, 1000, { count: 6, color: 1 }, half);
    expect(fx.particles).toHaveLength(6);
    expect(fx.particles.every((p) => p.x === 10 && p.y === 20 && p.color === 1 && p.bornMs === 1000)).toBe(true);
  });

  it('upward streut nur nach oben', () => {
    const fx = burst(createFx(), 0, 0, 0, { count: 8, color: 0, upward: true }, Math.random);
    expect(fx.particles.every((p) => p.vy < 0)).toBe(true);
  });

  it('hält die Obergrenze und behält die neuesten', () => {
    let fx = createFx();
    for (let i = 0; i < 30; i++) fx = burst(fx, i, 0, i, { count: 10, color: 0 }, half);
    expect(fx.particles).toHaveLength(MINIGAME_FEEL.maxParticles);
    expect(fx.particles[fx.particles.length - 1].bornMs).toBe(29);
  });

  it('bewegt sich, fällt und schrumpft bis unsichtbar', () => {
    const p = { x: 0, y: 0, vx: 100, vy: 0, bornMs: 0, lifeMs: 500, size: 4, color: 0 };
    const mid = particleAt(p, 250);
    expect(mid.x).toBeCloseTo(25);
    expect(mid.y).toBeGreaterThan(0);
    expect(mid.r).toBeCloseTo(2);
    expect(particleAt(p, 500).r).toBe(0);
    expect(particleAt(p, -1).r).toBe(0);
  });

  it('pruneFx wirft abgelaufene weg und gibt sonst denselben Zustand zurück', () => {
    const fx = burst(createFx(), 0, 0, 0, { count: 3, color: 0 }, half);
    expect(pruneFx(fx, 10)).toBe(fx);
    expect(pruneFx(fx, 10_000).particles).toHaveLength(0);
  });
});

describe('Wackeln', () => {
  it('klingt linear ab', () => {
    const fx = shake(createFx(), 100, 200, 8);
    expect(shakeStrength(fx, 100)).toBe(8);
    expect(shakeStrength(fx, 200)).toBe(4);
    expect(shakeStrength(fx, 300)).toBe(0);
    expect(shakeOffset(fx, 400)).toEqual({ x: 0, y: 0 });
  });

  it('ein schwaches Wackeln überschreibt kein starkes', () => {
    const strong = shake(createFx(), 0, 300, 9);
    expect(shake(strong, 10, 100, 2)).toBe(strong);
  });

  it('Ausschlag bleibt innerhalb der Stärke', () => {
    const fx = shake(createFx(), 0, 1000, 5);
    for (let t = 0; t < 1000; t += 37) {
      const { x, y } = shakeOffset(fx, t);
      expect(Math.abs(x)).toBeLessThanOrEqual(5);
      expect(Math.abs(y)).toBeLessThanOrEqual(5);
    }
  });
});

describe('Kurzes Anhalten', () => {
  it('verbraucht zuerst die Anhaltezeit', () => {
    expect(consumeHitStop(50, 16)).toEqual({ leftMs: 34, dtMs: 0 });
    expect(consumeHitStop(10, 16)).toEqual({ leftMs: 0, dtMs: 6 });
    expect(consumeHitStop(0, 16)).toEqual({ leftMs: 0, dtMs: 16 });
  });
});

describe('Kombo', () => {
  it('steigt bei schnellen Treffern und beginnt sonst neu', () => {
    expect(comboAfterHit(0, null, 100)).toBe(1);
    expect(comboAfterHit(3, 100, 100 + MINIGAME_FEEL.comboWindowMs)).toBe(4);
    expect(comboAfterHit(3, 100, 101 + MINIGAME_FEEL.comboWindowMs)).toBe(1);
  });
});
