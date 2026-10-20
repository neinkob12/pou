// Fakten-Quiz (P17), reine Logik ohne React: Fragen aus freigeschalteten Karten ziehen, Antworten
// mischen, Punkte berechnen. Doppelte Münzen bei voller Punktzahl laufen über die Punkte, damit
// das Minigame-Gerüst (P08) Münzen, Anzeige und `minigameFinished` ohne Sonderweg richtig meldet.

import { FACT_CARDS, type FactCard } from '../../content/facts';
import { FACT_QUIZ } from '../../game/config';

export interface QuizQuestion {
  cardId: string;
  question: string;
  options: string[];
  correctIndex: number;
}

type Random = () => number;

/** Fisher-Yates mit injizierbarem Zufall, gibt eine neue Liste zurück. */
function shuffle<T>(items: readonly T[], random: Random): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Genug Karten für eine Runde? */
export function canStartQuiz(unlockedIds: readonly string[], count: number = FACT_QUIZ.questionsPerRound): boolean {
  return FACT_CARDS.filter((card) => unlockedIds.includes(card.id)).length >= count;
}

function toQuestion(card: FactCard, random: Random): QuizQuestion {
  const order = shuffle([0, 1, 2], random);
  return {
    cardId: card.id,
    question: card.quiz.question,
    options: order.map((i) => card.quiz.options[i]),
    correctIndex: order.indexOf(card.quiz.correctIndex),
  };
}

/** Zieht `count` verschiedene Fragen aus den freigeschalteten Karten, Antworten gemischt. */
export function pickQuizQuestions(
  unlockedIds: readonly string[],
  random: Random = Math.random,
  count: number = FACT_QUIZ.questionsPerRound,
): QuizQuestion[] {
  const pool = FACT_CARDS.filter((card) => unlockedIds.includes(card.id));
  return shuffle(pool, random)
    .slice(0, count)
    .map((card) => toQuestion(card, random));
}

/** Punkte für eine richtige Antwort. Die letzte richtige Antwort einer fehlerfreien Runde bringt den Bonus mit. */
export function pointsForAnswer(
  correct: boolean,
  correctSoFar: number,
  total: number,
  quiz: typeof FACT_QUIZ = FACT_QUIZ,
): number {
  if (!correct) return 0;
  const perfect = correctSoFar + 1 === total;
  return perfect ? quiz.pointsPerCorrect * (total * (quiz.perfectMultiplier - 1) + 1) : quiz.pointsPerCorrect;
}

/** Gesamtpunkte einer Runde. */
export function quizScore(correctCount: number, total: number, quiz: typeof FACT_QUIZ = FACT_QUIZ): number {
  const base = correctCount * quiz.pointsPerCorrect;
  return correctCount === total && total > 0 ? base * quiz.perfectMultiplier : base;
}
