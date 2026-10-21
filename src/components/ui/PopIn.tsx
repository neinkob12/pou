import { useEffect, type ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withSpring, withTiming } from 'react-native-reanimated';

import { springs } from '../../lib/theme';

const START_SCALE = 0.55;
const FADE_MS = 140;

interface PopInProps {
  children: ReactNode;
  /** Verzögerung in ms, für mehrere Elemente nacheinander. */
  delay?: number;
  style?: StyleProp<ViewStyle>;
}

/** Ploppt beim Erscheinen mit Überschwingen auf (ART-1): Modals, Belohnungen, Plaketten. */
export function PopIn({ children, delay = 0, style }: PopInProps) {
  const progress = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    progress.set(withDelay(delay, withSpring(1, springs.pop)));
    opacity.set(withDelay(delay, withTiming(1, { duration: FADE_MS })));
  }, [delay, progress, opacity]);

  const animated = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: START_SCALE + (1 - START_SCALE) * progress.value }],
  }));

  return <Animated.View style={[style, animated]}>{children}</Animated.View>;
}
