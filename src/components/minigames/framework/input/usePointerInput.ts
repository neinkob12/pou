// Eingabe für Minigames (Auftrag 40): Finger und Maus gleich, über Gesture Handler. Die alten
// onTouchStart-Props von View kommen im Browser bei der Maus nicht an und am Handy-Browser nur
// unzuverlässig; Gesture Handler liefert in beiden Fällen sofort beim Aufsetzen.
// Callbacks sind Worklets (UI-Thread), Koordinaten relativ zum Spielfeld.

import { useManualGesture } from 'react-native-gesture-handler';
import type { GestureTouchEvent } from 'react-native-gesture-handler';

export interface PointerHandlers {
  /** Ein Finger oder die Maus setzt auf. */
  onDown?: (x: number, y: number) => void;
  /** Alle gerade liegenden Finger (x), bei jedem Aufsetzen, Bewegen und Loslassen. */
  onHeld?: (xs: number[]) => void;
}

export function usePointerInput({ onDown, onHeld }: PointerHandlers) {
  const held = (e: GestureTouchEvent, removed: boolean) => {
    'worklet';
    if (!onHeld) return;
    const gone = removed ? e.changedTouches.map((t) => t.id) : [];
    onHeld(e.allTouches.filter((t) => !gone.includes(t.id)).map((t) => t.x));
  };
  return useManualGesture({
    onTouchesDown: (e) => {
      'worklet';
      if (onDown) for (const t of e.changedTouches) onDown(t.x, t.y);
      held(e, false);
    },
    onTouchesMove: (e) => {
      'worklet';
      held(e, false);
    },
    onTouchesUp: (e) => {
      'worklet';
      held(e, true);
    },
    onTouchesCancel: (e) => {
      'worklet';
      held(e, true);
    },
  });
}
