// Drei Sterne im Ergebnis (Auftrag 40), nacheinander aufploppend. Leere Sterne bleiben blass.

import { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { minigameFeel as t } from '../../../content/strings';
import { colors } from '../../../lib/theme';
import type { StarCount } from './stars';

/** Abstand zwischen den Sternen beim Aufploppen. */
const STEP_MS = 220;
const STAR = '★';

function Star({ index, filled }: { index: number; filled: boolean }) {
  const scale = useSharedValue(filled ? 0 : 1);
  useEffect(() => {
    if (!filled) return;
    scale.set(
      withDelay(
        index * STEP_MS,
        withSequence(withTiming(1.4, { duration: 140 }), withSpring(1, { damping: 7, stiffness: 200 })),
      ),
    );
  }, [filled, index, scale]);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.get() }, { rotate: `${(index - 1) * 12}deg` }] }));
  return (
    <Animated.View style={style}>
      <Text
        style={{
          fontSize: index === 1 ? 58 : 46,
          color: filled ? colors.lamp : colors.inkMuted,
          opacity: filled ? 1 : 0.25,
        }}
      >
        {STAR}
      </Text>
    </Animated.View>
  );
}

export function ResultStars({ stars }: { stars: StarCount }) {
  return (
    <View accessibilityLabel={t.starsLabel(stars)} className="flex-row items-end justify-center gap-2">
      {[0, 1, 2].map((i) => (
        <Star key={i} index={i} filled={i < stars} />
      ))}
    </View>
  );
}
