import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { gameRadii, gloss, insets, outline, shadows, springs, tones, type ColorName, type ToneName } from '../../lib/theme';
import { gradientStyle, toneGradient } from './game/gradient';
import { clamp01, toneForColor } from './toneMap';

interface BarProps {
  /** 0 bis 1, wird auf diesen Bereich begrenzt. */
  value: number;
  /** Alte Palettenfarbe, wird auf einen Spiel-Farbton abgebildet. */
  color?: ColorName;
  /** Spiel-Farbton direkt, hat Vorrang vor color. */
  tone?: ToneName;
  height?: number;
  accessibilityLabel?: string;
}

/**
 * Leiste im Spiel-Look (ART-1): dunkle Rinne mit Kontur, Füllung mit Verlauf und Glanzstreifen.
 * Ändert sich der Wert, füllt sie sich mit Federung nach.
 */
export function Bar({ value, color = 'plantLight', tone, height = 16, accessibilityLabel }: BarProps) {
  const clamped = clamp01(value);
  const t = tones[tone ?? toneForColor(color)];
  const fill = useSharedValue(clamped);

  useEffect(() => {
    fill.set(withSpring(clamped, springs.fill));
  }, [clamped, fill]);

  const fillStyle = useAnimatedStyle(() => ({ width: `${Math.max(0, Math.min(1, fill.value)) * 100}%` }));
  const inner = Math.max(0, height - outline.regular * 2);

  return (
    <View
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(clamped * 100) }}
      style={{
        height,
        borderRadius: gameRadii.pill,
        borderWidth: outline.thin,
        borderColor: outline.color,
        backgroundColor: insets.barTrack,
        boxShadow: shadows.inset,
        overflow: 'hidden',
        padding: 1,
      }}
    >
      <Animated.View
        style={[
          { height: '100%', minWidth: clamped > 0 ? inner : 0, borderRadius: gameRadii.pill, overflow: 'hidden' },
          gradientStyle(toneGradient(t), t.base),
          fillStyle,
        ]}
      >
        <View
          style={{
            marginTop: Math.max(1, inner * 0.14),
            marginHorizontal: Math.max(3, inner * 0.35),
            height: Math.max(2, inner * 0.24),
            borderRadius: gameRadii.pill,
            backgroundColor: gloss.color,
            opacity: gloss.opacity,
          }}
        />
      </Animated.View>
    </View>
  );
}
