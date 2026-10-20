// Abschluss einer Runde, ohne React: Münzen gutschreiben, Highscore eintragen, Ereignis melden.
// Den Laune-Bonus für Budi gibt P10 als Reaktion auf `minigameFinished` (MINIGAME_REWARDS.moodPerRound).

import { gameEvents } from '../../../game/events';
import { useGameStore } from '../../../store/gameStore';
import { coinsForScore } from './session';

export interface RoundResult {
  gameId: string;
  score: number;
  coins: number;
  highscore: number;
  isNewHighscore: boolean;
}

export function finishRound(gameId: string, score: number, nowMs: number = Date.now()): RoundResult {
  const store = useGameStore.getState();
  const coins = coinsForScore(score);
  if (coins > 0) store.addCoins(coins);
  const isNewHighscore = store.recordMinigameRound(gameId, score);
  const highscore = useGameStore.getState().minigameHighscores[gameId] ?? 0;
  gameEvents.emit('minigameFinished', { gameId, score, coins, atMs: nowMs });
  return { gameId, score, coins, highscore, isNewHighscore };
}
