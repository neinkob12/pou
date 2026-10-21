import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { gameRadii, outline, spacing, springs, tones, type ColorName, type ToneName } from '../../lib/theme';
import { GameText } from './GameText';
import { gradientStyle, toneGradient } from './game/gradient';
import { needsTextShadow } from './buttonLook';
import { toneForColor } from './toneMap';

interface BadgeProps {
  label: string;
  color?: ColorName;
  tone?: ToneName;
  /** Veraltet, die Schriftfarbe kommt aus dem Farbton. Bleibt für alte Aufrufe. */
  light?: boolean;
  /** Mittig statt links, etwa in zentrierten Karten. */
  center?: boolean;
}

/** Plakette im Spiel-Look (ART-1): Verlauf, Kontur, ploppt beim Erscheinen mit Federung auf. */
export function Badge({ label, color = 'lamp', tone, center = false }: BadgeProps) {
  const t = tones[tone ?? toneForColor(color)];
  const scale = useSharedValue(0.6);

  useEffect(() => {
    scale.set(withSpring(1, springs.pop));
  }, [scale]);

  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View style={[{ alignSelf: center ? 'center' : 'flex-start' }, style]}>
      <View
        style={[
          gradientStyle(toneGradient(t), t.base),
          {
            borderRadius: gameRadii.pill,
            borderWidth: outline.thin,
            borderColor: outline.color,
            borderBottomWidth: outline.thin + 1,
            paddingHorizontal: spacing.sm + 2,
            paddingVertical: 1,
          },
        ]}
      >
        <GameText variant="small" color={t.text} shadow={needsTextShadow(t)}>
          {label}
        </GameText>
      </View>
    </Animated.View>
  );
}
