import { useEffect } from 'react';

import { gameEvents } from '../../../game/events';
import { applyLightDisturbance } from '../../../hooks/useNeeds';
import { playCareHaptic } from './haptics';

/**
 * Hört auf `lightDisturbed` (P11): Laune sinkt, Budi schüttelt sich mit Warn-Vibration.
 * Im CareStageProvider eingehängt, damit es genau einmal pro Ereignis läuft.
 */
export function useLightDisturbStress(onStress: () => void): void {
  useEffect(
    () =>
      gameEvents.on('lightDisturbed', ({ atMs }) => {
        if (!applyLightDisturbance(atMs)) return;
        playCareHaptic('warning');
        onStress();
      }),
    [onStress],
  );
}
