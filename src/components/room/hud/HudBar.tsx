import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { radii } from '../../../lib/theme';
import { hud } from './hudStyle';

interface HudBarProps {
  /** 0 bis 1. */
  value: number;
  fill: string;
  deep: string;
  height?: number;
  accessibilityLabel?: string;
}

/** Dicker Fortschrittsbalken im Spielstil (ART-4): Kontur, Glanz, dunkle Unterkante, federt auf den Wert. */
export function HudBar({ value, fill, deep, height = 16, accessibilityLabel }: HudBarProps) {
  const clamped = Math.min(1, Math.max(0, value));
  const w = useSharedValue(clamped);
  useEffect(() => {
    w.value = withSpring(clamped, { damping: 16, stiffness: 110 });
  }, [clamped, w]);
  const style = useAnimatedStyle(() => ({ width: `${Math.max(w.value, clamped > 0 ? 0.04 : 0) * 100}%` }));
  return (
    <View
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(clamped * 100) }}
      style={{ height, borderRadius: radii.pill, borderWidth: hud.line, borderColor: hud.outline, backgroundColor: hud.track, overflow: 'hidden' }}
    >
      <Animated.View
        style={[{ height: '100%', borderRadius: radii.pill, backgroundColor: fill, borderBottomWidth: 3, borderBottomColor: deep }, style]}
      >
        <View style={{ marginTop: 2, marginHorizontal: 5, height: Math.max(2, height * 0.22), borderRadius: radii.pill, backgroundColor: hud.gloss }} />
      </Animated.View>
    </View>
  );
}
