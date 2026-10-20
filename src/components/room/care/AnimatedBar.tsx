import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { colors, radii, type ColorName } from '../../../lib/theme';

const FILL_MS = 450;

interface AnimatedBarProps {
  /** 0 bis 1, wird auf diesen Bereich begrenzt. */
  value: number;
  color: ColorName;
  height?: number;
  accessibilityLabel?: string;
}

/** Bedürfnisbalken, der weich auf den neuen Wert läuft (z. B. nach dem Gießen). */
export function AnimatedBar({ value, color, height = 10, accessibilityLabel }: AnimatedBarProps) {
  const clamped = Math.min(1, Math.max(0, value));
  const fill = useSharedValue(clamped);
  useEffect(() => {
    fill.value = withTiming(clamped, { duration: FILL_MS });
  }, [clamped, fill]);
  const fillStyle = useAnimatedStyle(() => ({ width: `${fill.value * 100}%` }));

  return (
    <View
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(clamped * 100) }}
      style={{
        height,
        borderRadius: radii.pill,
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.plantDark,
        overflow: 'hidden',
      }}
    >
      <Animated.View style={[{ height: '100%', backgroundColor: colors[color] }, fillStyle]} />
    </View>
  );
}
