import { useCallback } from 'react';
import {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

/** Stauchen beim Antippen, dann federnd über die volle Größe hinaus und zurück. */
const SQUASH = 0.93;
const SQUASH_MS = 80;

/**
 * Kurzes Aufploppen (ART-5), etwa einer Karte nach dem Kauf: staucht sich, federt über und kommt
 * zur Ruhe. `style` anhängen, `pop()` auslösen.
 */
export function usePop() {
  const reduced = useReducedMotion();
  const scale = useSharedValue(1);
  const pop = useCallback(() => {
    if (reduced) return;
    scale.set(
      withSequence(withTiming(SQUASH, { duration: SQUASH_MS }), withSpring(1, { damping: 6, stiffness: 320, velocity: 6 })),
    );
  }, [reduced, scale]);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return { style, pop };
}
