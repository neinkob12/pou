// Lichtbonus für Budi über `minigameFinished` (P08): Am Ende einer Runde Budi Jump wandert der Bonus
// ins Licht-Guthaben des Jump-Slices. Der Licht-Balken holt es ab, sobald es ihn gibt (takeJumpLight).

import { gameEvents, type GameEvents } from '../../../game/events';
import { useGameStore } from '../../../store/gameStore';
import { JUMP_GAME_ID, lightBonusForRound } from './jumpReward';

/**
 * Hört während einer Runde auf `minigameFinished` und schreibt bei Budi Jump den Lichtbonus gut.
 * `lights` liefert die gesammelten Lichtpunkte im Moment des Endes. Rückgabe: abmelden.
 */
export function listenForJumpLightBonus(lights: () => number): () => void {
  return gameEvents.on('minigameFinished', (event: GameEvents['minigameFinished']) => {
    if (event.gameId !== JUMP_GAME_ID) return;
    const bonus = lightBonusForRound(lights());
    if (bonus > 0) useGameStore.getState().addJumpLight(bonus);
  });
}
