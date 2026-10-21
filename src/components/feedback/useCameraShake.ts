import { useCallback } from 'react';
import {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { SHAKE_STEP_MS, shakeSteps } from './rewardFx';

/**
 * Kamera-Wackeln (ART-5): `style` an die Fläche hängen, die wackeln soll, `shake(stärke)` auslösen.
 * Stärke 0 bis 1 (Ernte 1, Kauf 0.3). Bei "Bewegung reduzieren" passiert nichts.
 */
export function useCameraShake() {
  const reduced = useReducedMotion();
  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const rot = useSharedValue(0);

  const shake = useCallback(
    (strength = 1) => {
      if (reduced) return;
      const steps = shakeSteps(strength);
      const seq = (pick: (s: (typeof steps)[number]) => number) =>
        withSequence(...steps.map((s) => withTiming(pick(s), { duration: SHAKE_STEP_MS })));
      x.set(seq((s) => s.x));
      y.set(seq((s) => s.y));
      rot.set(seq((s) => s.rotate));
    },
    [reduced, x, y, rot],
  );

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }, { translateY: y.value }, { rotate: `${rot.value}deg` }],
  }));

  return { style, shake };
}
