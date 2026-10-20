import { usePanGesture } from 'react-native-gesture-handler';
import { useSharedValue } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

/** So weit (Punkte, summiert) muss der Finger über Budi streichen, damit es als Streicheln zählt. */
const STROKE_DISTANCE = 120;

/** Wisch-Geste auf Budi. Einmal Streicheln je Berührung, damit Wischen nicht spammt. */
export function usePetGesture(enabled: boolean, onPet: () => void) {
  const distance = useSharedValue(0);
  const done = useSharedValue(false);
  return usePanGesture({
    enabled,
    minDistance: 8,
    onActivate: () => {
      'worklet';
      distance.value = 0;
      done.value = false;
    },
    onUpdate: (e) => {
      'worklet';
      if (done.value) return;
      distance.value += Math.abs(e.changeX) + Math.abs(e.changeY);
      if (distance.value >= STROKE_DISTANCE) {
        done.value = true;
        scheduleOnRN(onPet);
      }
    },
  });
}
