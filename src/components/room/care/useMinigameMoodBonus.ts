import { useEffect } from 'react';

import { gameEvents } from '../../../game/events';
import { applyMinigameMoodBonus } from '../../../hooks/useNeeds';

/** Hört auf `minigameFinished` (P08) und hebt Budis Laune. Im RoomScreen eingehängt. */
export function useMinigameMoodBonus(): void {
  useEffect(() => gameEvents.on('minigameFinished', applyMinigameMoodBonus), []);
}
