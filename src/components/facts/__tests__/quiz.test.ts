import { FACT_CARDS, factById } from '../../../content/facts';
import { FACT_QUIZ } from '../../../game/config';
import { canStartQuiz, pickQuizQuestions, pointsForAnswer, quizScore } from '../quiz';

/** Deterministischer Zufall (LCG), damit Tests reproduzierbar sind. */
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

const allIds = FACT_CARDS.map((c) => c.id);

describe('Fakten-Quiz', () => {
  it('braucht mindestens drei freigeschaltete Karten', () => {
    expect(canStartQuiz([])).toBe(false);
    expect(canStartQuiz(allIds.slice(0, 2))).toBe(false);
    expect(canStartQuiz(allIds.slice(0, 3))).toBe(true);
  });

  it('ignoriert unbekannte IDs', () => {
    expect(canStartQuiz(['gibt-es-nicht', ...allIds.slice(0, 2)])).toBe(false);
  });

  it('zieht drei verschiedene Fragen nur aus freigeschalteten Karten', () => {
    const unlocked = allIds.slice(0, 4);
    for (let seed = 1; seed < 20; seed++) {
      const qs = pickQuizQuestions(unlocked, seeded(seed));
      expect(qs).toHaveLength(FACT_QUIZ.questionsPerRound);
      expect(new Set(qs.map((q) => q.cardId)).size).toBe(qs.length);
      expect(qs.every((q) => unlocked.includes(q.cardId))).toBe(true);
    }
  });

  it('behält beim Mischen die richtige Antwort', () => {
    for (let seed = 1; seed < 20; seed++) {
      for (const q of pickQuizQuestions(allIds, seeded(seed))) {
        const card = factById(q.cardId)!;
        expect(q.options[q.correctIndex]).toBe(card.quiz.options[card.quiz.correctIndex]);
        expect([...q.options].sort()).toEqual([...card.quiz.options].sort());
      }
    }
  });

  it('verdoppelt die Punkte bei voller Punktzahl', () => {
    const total = FACT_QUIZ.questionsPerRound;
    expect(quizScore(total, total)).toBe(2 * total * FACT_QUIZ.pointsPerCorrect);
    expect(quizScore(total - 1, total)).toBe((total - 1) * FACT_QUIZ.pointsPerCorrect);
    expect(quizScore(0, total)).toBe(0);
  });

  it('pointsForAnswer summiert sich zu quizScore', () => {
    const total = FACT_QUIZ.questionsPerRound;
    const patterns = [
      [true, true, true],
      [true, false, true],
      [false, true, true],
      [false, false, false],
    ];
    for (const answers of patterns) {
      let correct = 0;
      let sum = 0;
      for (const ok of answers) {
        sum += pointsForAnswer(ok, correct, total);
        if (ok) correct++;
      }
      expect(sum).toBe(quizScore(correct, total));
    }
  });
});
