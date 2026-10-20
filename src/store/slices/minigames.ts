// Minigames-Slice: Highscore je Spiel und Anzahl gespielter Runden (Auftrag P08).
// Persistenz kommt automatisch mit P02 (alle Slices werden mitgespeichert).

import { withHighscore } from '../../components/minigames/framework/session';
import type { SliceCreator } from './types';

export interface MinigamesSlice {
  /** Bester Punktestand je Spiel-ID. */
  minigameHighscores: Record<string, number>;
  /** Abgeschlossene Runden je Spiel-ID. */
  minigameRounds: Record<string, number>;
  /** Trägt eine beendete Runde ein. Rückgabe: ob es ein neuer Highscore ist. */
  recordMinigameRound: (gameId: string, score: number) => boolean;
}

export const createMinigamesSlice: SliceCreator<MinigamesSlice> = (set, get) => ({
  minigameHighscores: {},
  minigameRounds: {},
  recordMinigameRound: (gameId, score) => {
    const { minigameHighscores, minigameRounds } = get();
    const highscores = withHighscore(minigameHighscores, gameId, score);
    set({
      minigameHighscores: highscores,
      minigameRounds: { ...minigameRounds, [gameId]: (minigameRounds[gameId] ?? 0) + 1 },
    });
    return highscores !== minigameHighscores;
  },
});
