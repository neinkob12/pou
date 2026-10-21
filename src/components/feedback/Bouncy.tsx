import { useEffect, type ReactNode } from 'react';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

const HOP_MS = 260;
const LAND_MS = 140;
const REST_MS = 900;
const HOP_HEIGHT = 14;

/**
 * Hüpft in Ruhe immer wieder (ART-5): staucht sich zum Absprung, streckt sich im Flug und federt
 * bei der Landung (Squash & Stretch). Für Budi auf der Altersfrage und in Feiern.
 */
export function Bouncy({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();
  const t = useSharedValue(0);
  useEffect(() => {
    if (reduced) return;
    // 0 Ruhe, -1 gestaucht, 1 oben in der Luft.
    t.value = withRepeat(
      withSequence(
        withTiming(-1, { duration: LAND_MS, easing: Easing.out(Easing.quad) }),
        withTiming(1, { duration: HOP_MS, easing: Easing.out(Easing.quad) }),
        withTiming(-0.6, { duration: HOP_MS, easing: Easing.in(Easing.quad) }),
        withTiming(0, { duration: LAND_MS, easing: Easing.out(Easing.back(3)) }),
        withTiming(0, { duration: REST_MS }),
      ),
      -1,
    );
  }, [reduced, t]);
  const style = useAnimatedStyle(() => {
    const up = Math.max(0, t.value);
    const squash = Math.min(0, t.value);
    return {
      transform: [
        { translateY: -up * HOP_HEIGHT },
        { scaleX: 1 - squash * 0.14 - up * 0.06 },
        { scaleY: 1 + squash * 0.16 + up * 0.08 },
      ],
    };
  });
  return <Animated.View style={style}>{children}</Animated.View>;
}
