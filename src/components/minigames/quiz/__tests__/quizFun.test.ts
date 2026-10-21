import { MINIGAME_FUN } from '../../../../game/config';
import { jokerHides, questionSecondsLeft, questionTimedOut, questionTimeMs } from '../quizFun';

const secs = MINIGAME_FUN.quiz.questionSeconds;

describe('Quiz: Bedenkzeit je Frage (Auftrag 45)', () => {
  it('wird von Frage zu Frage knapper und bleibt danach bei der knappsten', () => {
    expect(questionTimeMs(0)).toBe(secs[0] * 1000);
    expect(questionTimeMs(1)).toBeLessThan(questionTimeMs(0));
    expect(questionTimeMs(99)).toBe(secs[secs.length - 1] * 1000);
  });

  it('zählt ab dem Start der Frage herunter und läuft ab', () => {
    expect(questionSecondsLeft(5000, 5000, 0)).toBe(secs[0]);
    expect(questionSecondsLeft(5001, 5000, 0)).toBe(secs[0]);
    expect(questionTimedOut(5000 + secs[0] * 1000 - 1, 5000, 0)).toBe(false);
    expect(questionTimedOut(5000 + secs[0] * 1000, 5000, 0)).toBe(true);
    expect(questionSecondsLeft(1e9, 0, 0)).toBe(0);
  });
});

describe('Quiz: 50:50-Joker (Auftrag 45)', () => {
  it('nimmt immer eine falsche Antwort weg', () => {
    for (const rand of [0, 0.49, 0.5, 0.999]) {
      const hidden = jokerHides(3, 1, rand);
      expect(hidden).not.toBe(1);
      expect([0, 2]).toContain(hidden);
    }
    expect(jokerHides(1, 0, 0.5)).toBe(-1);
  });
});
