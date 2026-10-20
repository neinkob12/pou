// Kombo-Zähler (Auftrag 40): springt bei jedem Treffer kurz auf, ab MINIGAME_FEEL.comboShowFrom sichtbar.

import { useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { minigameFeel as t } from '../../../../content/strings';
import { MINIGAME_FEEL } from '../../../../game/config';
import { colors, radii, spacing } from '../../../../lib/theme';

interface ComboBadgeProps {
  combo: number;
  /** Multiplikator, nur gezeigt wenn > 1. */
  multiplier?: number;
}

export function ComboBadge({ combo, multiplier = 1 }: ComboBadgeProps) {
  const scale = useSharedValue(1);
  useEffect(() => {
    if (combo < MINIGAME_FEEL.comboShowFrom) return;
    scale.set(withSequence(withTiming(1.35, { duration: 70 }), withSpring(1, { damping: 8, stiffness: 260 })));
  }, [combo, scale]);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.get() }] }));

  if (combo < MINIGAME_FEEL.comboShowFrom) return null;
  return (
    // Animated.View nimmt keine NativeWind-Klassen, deshalb StyleSheet.
    <Animated.View pointerEvents="none" style={[styles.badge, style]}>
      <Text className="font-heading text-xl text-white">{t.combo(combo)}</Text>
      {multiplier > 1 && <Text className="font-body-bold text-sm text-white">{t.multiplier(multiplier)}</Text>}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    right: spacing.md,
    top: spacing.sm,
    alignItems: 'center',
    borderRadius: radii.md,
    backgroundColor: colors.coral,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
});
