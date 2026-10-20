// Plant Budis Benachrichtigungen (Auftrag P18). Einmal global einhängen.
// - Nach der ersten Pflege (careAction) fragt die App einmal nach der Erlaubnis, nicht beim Start.
// - Geht die App in den Hintergrund, wird der Plan aus dem Spielstand neu berechnet.
// - Kommt sie zurück, wird alles Geplante verworfen (Budi ist ja gerade zu sehen).

import { useEffect } from 'react';
import { AppState } from 'react-native';

import { gameEvents } from '../game/events';
import {
  cancelPendingNotifications,
  configureNotifications,
  permissionAsked,
  requestPermission,
  rescheduleNotifications,
} from '../lib/notifications';
import { useGameStore } from '../store/gameStore';

function reschedule(): void {
  const { plant, needs } = useGameStore.getState();
  rescheduleNotifications(plant, needs, Date.now()).catch(() => undefined);
}

export function useNotificationScheduler(): void {
  useEffect(() => {
    configureNotifications().catch(() => undefined);
    if (AppState.currentState === 'active') cancelPendingNotifications(Date.now()).catch(() => undefined);

    const offCare = gameEvents.on('careAction', () => {
      if (permissionAsked()) return;
      requestPermission().catch(() => undefined);
    });

    const appState = AppState.addEventListener('change', (state) => {
      if (state === 'active') cancelPendingNotifications(Date.now()).catch(() => undefined);
      else if (state === 'background') reschedule();
    });

    return () => {
      offCare();
      appState.remove();
    };
  }, []);
}
