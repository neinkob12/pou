import { idleFidget, nextPetStreak, PET_STREAK_WINDOW_MS, reactionMotionFor, sleepTransition } from '../budiMood';

describe('nextPetStreak', () => {
  it('zählt Streichler kurz hintereinander als Serie', () => {
    const first = nextPetStreak(null, 1000);
    expect(first).toEqual({ count: 1, atMs: 1000 });
    const second = nextPetStreak(first, 1000 + PET_STREAK_WINDOW_MS);
    expect(second.count).toBe(2);
    expect(nextPetStreak(second, second.atMs + 200).count).toBe(3);
  });

  it('beginnt nach einer Pause neu, auch wenn die Uhr springt', () => {
    const s = { count: 5, atMs: 10_000 };
    expect(nextPetStreak(s, 10_000 + PET_STREAK_WINDOW_MS + 1).count).toBe(1);
    expect(nextPetStreak(s, 9_000).count).toBe(1);
  });
});

describe('reactionMotionFor', () => {
  const pet = (streak?: number) => ({ type: 'pet' as const, feedback: 'success' as const, streak });

  it('wählt je Pflege eine Bewegung', () => {
    expect(reactionMotionFor({ type: 'water', feedback: 'success' }, 2, 4)).toBe('gulp');
    expect(reactionMotionFor({ type: 'fertilize', feedback: 'success' }, 2, 4)).toBe('chomp');
    expect(reactionMotionFor({ type: 'fertilizeBloom', feedback: 'success' }, 2, 4)).toBe('chomp');
    expect(reactionMotionFor({ type: 'water', feedback: 'warning' }, 2, 4)).toBe('pout');
  });

  it('streicheln, kitzeln, verliebt nach Länge der Serie', () => {
    expect(reactionMotionFor(pet(), 2, 4)).toBe('wiggle');
    expect(reactionMotionFor(pet(2), 2, 4)).toBe('tickle');
    expect(reactionMotionFor(pet(3), 2, 4)).toBe('tickle');
    expect(reactionMotionFor(pet(4), 2, 4)).toBe('love');
  });

  it('nichts bei wirkungsloser Pflege', () => {
    expect(reactionMotionFor(null, 2, 4)).toBeNull();
    expect(reactionMotionFor({ type: 'pet', feedback: 'error' }, 2, 4)).toBeNull();
  });
});

describe('sleepTransition', () => {
  it('erkennt Einschlafen und Aufwachen', () => {
    expect(sleepTransition(false, true)).toBe('fallAsleep');
    expect(sleepTransition(true, false)).toBe('wakeUp');
    expect(sleepTransition(true, true)).toBeNull();
    expect(sleepTransition(false, false)).toBeNull();
  });
});

describe('idleFidget', () => {
  it('wechselt die Gesten ab', () => {
    const seen = new Set(Array.from({ length: 6 }, (_, i) => idleFidget(i, 'ok')));
    expect(seen).toEqual(new Set(['lookAround', 'tilt', 'hop']));
  });

  it('hüpft nicht, wenn Budi etwas fehlt', () => {
    for (let i = 0; i < 12; i++) expect(idleFidget(i, 'thirsty')).not.toBe('hop');
  });

  it('verträgt negative Zähler', () => {
    expect(['lookAround', 'tilt', 'hop']).toContain(idleFidget(-1, 'ok'));
  });
});
