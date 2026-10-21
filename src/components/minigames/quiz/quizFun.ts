// Neue Elemente im Fakten-Quiz (Auftrag 45), ohne React: Bedenkzeit je Frage, die von Frage zu Frage
// knapper wird, und der 50:50-Joker. Die Punkte rechnet weiter facts/quiz.ts (pointsForAnswer).

import { MINIGAME_FUN } from '../../../game/config';

type QuizFun = typeof MINIGAME_FUN.quiz;

/** Bedenkzeit (ms) für die Frage mit diesem Index; nach der letzten Stufe bleibt die knappste. */
export function questionTimeMs(index: number, fun: QuizFun = MINIGAME_FUN.quiz): number {
  'worklet';
  const list = fun.questionSeconds;
  return list[Math.min(Math.max(0, index), list.length - 1)] * 1000;
}

/** Restliche Bedenkzeit in ganzen Sekunden (aufgerundet), nie unter 0. */
export function questionSecondsLeft(
  elapsedMs: number,
  startedAtMs: number,
  index: number,
  fun: QuizFun = MINIGAME_FUN.quiz,
): number {
  'worklet';
  return Math.max(0, Math.ceil((questionTimeMs(index, fun) - (elapsedMs - startedAtMs)) / 1000));
}

/** Ist die Bedenkzeit dieser Frage abgelaufen? */
export function questionTimedOut(
  elapsedMs: number,
  startedAtMs: number,
  index: number,
  fun: QuizFun = MINIGAME_FUN.quiz,
): boolean {
  'worklet';
  return elapsedMs - startedAtMs >= questionTimeMs(index, fun);
}

/** Welche falsche Antwort nimmt der Joker weg? `rand` in [0, 1). -1, wenn es keine falsche gibt. */
export function jokerHides(optionCount: number, correctIndex: number, rand: number): number {
  const wrong: number[] = [];
  for (let i = 0; i < optionCount; i += 1) if (i !== correctIndex) wrong.push(i);
  if (wrong.length === 0) return -1;
  return wrong[Math.min(wrong.length - 1, Math.floor(rand * wrong.length))];
}
