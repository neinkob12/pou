import { MINIGAME_ART, BUDI_JUMP } from '../../../../game/config';
import { skyBlend } from '../../jump/jumpFeel';
import type { Critter } from '../../smash/pestSmash';
import { emergeAt } from '../../smash/smashMotion';
import { popIn, springBack } from '../art/motion';
import { tones } from '../art/palette';
import { countUpValue } from '../countUp';
import { ringColor } from '../example/tapRing';
import {
  comboLevel,
  comboSlowMo,
  consumeSlowMo,
  createFx,
  crossesSlowMo,
  flash,
  flashAlpha,
  fxBusy,
  pruneFx,
  ring,
  ringAt,
} from '../fx/fxLogic';

describe('Ringe und Blitz (Auftrag 51)', () => {
  it('Ring wächst, wird dünner und verschwindet', () => {
    const fx = ring(createFx(), 10, 20, 1000, 2);
    const r = fx.rings![0];
    const early = ringAt(r, 1000 + MINIGAME_ART.ringLifeMs * 0.1);
    const late = ringAt(r, 1000 + MINIGAME_ART.ringLifeMs * 0.9);
    expect(late.radius).toBeGreaterThan(early.radius);
    expect(late.width).toBeLessThan(early.width);
    expect(late.alpha).toBeLessThan(early.alpha);
    expect(ringAt(r, 1000 + MINIGAME_ART.ringLifeMs).alpha).toBe(0);
  });

  it('höchstens 12 Ringe, alte fliegen raus', () => {
    let fx = createFx();
    for (let i = 0; i < 20; i++) fx = ring(fx, 0, 0, i, 0);
    expect(fx.rings).toHaveLength(12);
    expect(fx.rings![0].bornMs).toBe(8);
  });

  it('pruneFx räumt Ringe auf und lässt den Zustand gleich, wenn nichts abläuft', () => {
    const fx = ring(createFx(), 0, 0, 0, 0);
    expect(pruneFx(fx, 10)).toBe(fx);
    expect(fxBusy(fx)).toBe(true);
    const later = pruneFx(fx, MINIGAME_ART.ringLifeMs + 1);
    expect(later.rings).toHaveLength(0);
    expect(fxBusy(later)).toBe(false);
  });

  it('Blitz fällt von voller Deckkraft auf 0', () => {
    const fx = flash(createFx(), 500);
    expect(flashAlpha(fx, 500)).toBeCloseTo(MINIGAME_ART.flashOpacity);
    expect(flashAlpha(fx, 500 + MINIGAME_ART.flashMs / 2)).toBeLessThan(MINIGAME_ART.flashOpacity / 2);
    expect(flashAlpha(fx, 500 + MINIGAME_ART.flashMs)).toBe(0);
    expect(flashAlpha(createFx(), 500)).toBe(0);
  });
});

describe('Zeitlupe (Auftrag 51)', () => {
  it('bremst nur, solange Zeitlupe übrig ist, und verbraucht sie in echter Zeit', () => {
    expect(consumeSlowMo(0, 16, 0.35)).toEqual({ leftMs: 0, dtMs: 16 });
    const a = consumeSlowMo(100, 16, 0.5);
    expect(a.leftMs).toBe(84);
    expect(a.dtMs).toBeCloseTo(8);
    const b = consumeSlowMo(10, 16, 0.5);
    expect(b.leftMs).toBe(0);
    expect(b.dtMs).toBeCloseTo(5 + 6);
  });

  it('kostet über die ganze Dauer genau slowMoMs × (1 - Faktor) Spielzeit', () => {
    let left: number = MINIGAME_ART.slowMoMs;
    let game = 0;
    for (let i = 0; i < 60; i++) {
      const r = consumeSlowMo(left, 16, MINIGAME_ART.slowMoFactor);
      left = r.leftMs;
      game += r.dtMs;
    }
    expect(game).toBeCloseTo(60 * 16 - MINIGAME_ART.slowMoMs * (1 - MINIGAME_ART.slowMoFactor));
  });

  it('kommt bei jeder vollen Kombo-Stufe', () => {
    expect(comboSlowMo(4)).toBe(false);
    expect(comboSlowMo(MINIGAME_ART.slowMoEveryCombo)).toBe(true);
    expect(comboSlowMo(MINIGAME_ART.slowMoEveryCombo * 2)).toBe(true);
    expect(comboSlowMo(0)).toBe(false);
  });

  it('erkennt das Überschreiten einer Stufe auch bei Sprüngen (goldener Tropfen +3)', () => {
    expect(crossesSlowMo(3, 6, 5)).toBe(true);
    expect(crossesSlowMo(5, 6, 5)).toBe(false);
    expect(crossesSlowMo(9, 10, 5)).toBe(true);
    expect(crossesSlowMo(6, 0, 5)).toBe(false);
  });

  it('Kombo-Stufe für die Farbe steigt bis 2', () => {
    expect(comboLevel(3, 5)).toBe(0);
    expect(comboLevel(5, 5)).toBe(1);
    expect(comboLevel(12, 5)).toBe(2);
    expect(comboLevel(40, 5)).toBe(2);
  });
});

describe('Bewegungskurven (Auftrag 51)', () => {
  it('popIn beginnt bei 0, schwingt über 1 und endet bei 1', () => {
    expect(popIn(0)).toBe(0);
    expect(popIn(1)).toBe(1);
    const peak = Math.max(...Array.from({ length: 50 }, (_, i) => popIn(i / 50)));
    expect(peak).toBeGreaterThan(1.05);
  });

  it('springBack federt um 1 und klingt aus', () => {
    expect(springBack(-1, 300, 0.2)).toBe(1);
    expect(springBack(0, 300, 0.2)).toBeCloseTo(1.2);
    expect(springBack(300, 300, 0.2)).toBe(1);
    expect(Math.abs(springBack(250, 300, 0.2) - 1)).toBeLessThan(0.02);
  });

  it('Punkte zählen ganzzahlig hoch und enden genau beim Ziel', () => {
    expect(countUpValue(42, 0, 900)).toBe(0);
    expect(countUpValue(42, 900, 900)).toBe(42);
    const mid = countUpValue(42, 450, 900);
    expect(Number.isInteger(mid)).toBe(true);
    expect(mid).toBeGreaterThan(21);
    expect(countUpValue(7, 100, 0)).toBe(7);
  });
});

describe('Spiel-Grafik ohne Skia (Auftrag 51)', () => {
  const critter: Critter = { id: 1, kind: 'mite', hole: 0, spawnedAtMs: 1000, lifetimeMs: 1200, hitAtMs: null };

  it('Tier taucht mit Überschwingen auf und vor dem Ende wieder ab', () => {
    expect(emergeAt(critter, 1000)).toBe(0);
    expect(emergeAt(critter, 1600)).toBe(1);
    expect(emergeAt(critter, 2190)).toBeLessThan(0.2);
    expect(emergeAt({ ...critter, hitAtMs: 2190 }, 2190)).toBe(1);
  });

  it('Zeit-Ring läuft von grün über gelb nach rot, Gold bleibt gold bis es knapp wird', () => {
    expect(ringColor(0.9, false)).toBe(tones.leaf.light);
    expect(ringColor(0.5, false)).toBe(tones.sun.base);
    expect(ringColor(0.2, false)).toBe(tones.coral.base);
    expect(ringColor(0.5, true)).toBe(tones.gold.base);
    expect(ringColor(0.2, true)).toBe(tones.coral.base);
  });

  it('Himmel blendet erst zum Abend, dann zur Nacht', () => {
    expect(skyBlend(0)).toEqual({ dusk: 0, night: 0 });
    expect(skyBlend(BUDI_JUMP.difficultyHeight * 0.5)).toEqual({ dusk: 1, night: 0 });
    expect(skyBlend(BUDI_JUMP.difficultyHeight)).toEqual({ dusk: 1, night: 1 });
    expect(skyBlend(BUDI_JUMP.difficultyHeight * 0.75).night).toBeCloseTo(0.5);
  });
});
