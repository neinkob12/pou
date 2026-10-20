import * as Haptics from 'expo-haptics';

import type { CareFeedback } from './careLogic';

const NOTIFICATION: Record<CareFeedback, Haptics.NotificationFeedbackType> = {
  success: Haptics.NotificationFeedbackType.Success,
  warning: Haptics.NotificationFeedbackType.Warning,
  error: Haptics.NotificationFeedbackType.Error,
};

/** Vibration nach einer Pflege. Fehler (z. B. Gerät ohne Haptik) ignorieren. */
export function playCareHaptic(feedback: CareFeedback): void {
  Haptics.notificationAsync(NOTIFICATION[feedback]).catch(() => undefined);
}

/** Kurzer Tick beim Aufnehmen eines Werkzeugs. */
export function playPickupHaptic(): void {
  Haptics.selectionAsync().catch(() => undefined);
}
