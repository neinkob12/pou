import type { ReactNode } from 'react';
import { Animated, Pressable, View } from 'react-native';

import { outline, shadows, spacing } from '../../lib/theme';
import { BUTTON_SIZES, buttonTone, needsTextShadow, type ButtonSize, type ButtonVariant } from './buttonLook';
import { GameText } from './GameText';
import { GlossFill } from './game/GlossFill';
import { usePressSpring } from './game/usePressSpring';

interface ButtonProps {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  variant?: ButtonVariant;
  /** Kleines Bild vor dem Text, etwa die Münze am Preis (WEB-5). */
  leading?: ReactNode;
  /** sm 40, md 50, lg 62 hoch. */
  size?: ButtonSize;
  /** Ohne Klick-Klang und Vibration. */
  quiet?: boolean;
}

/**
 * 3D-Spielknopf (ART-1): Fläche mit Verlauf und Glanzlicht auf einer dunkleren Kante, dicke
 * Kontur, weicher Schatten. Beim Tippen sinkt die Fläche in die Kante, staucht und federt zurück.
 */
export function Button({ label, onPress, disabled = false, variant = 'primary', leading, size = 'md', quiet }: ButtonProps) {
  const tone = buttonTone(variant, disabled);
  const s = BUTTON_SIZES[size];
  const inner = s.radius - outline.regular;
  const press = usePressSpring({ sink: s.depth, disabled, quiet });

  return (
    <Animated.View style={[{ borderRadius: s.radius, boxShadow: disabled ? undefined : shadows.button }, press.outerStyle]}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled }}
        accessibilityLabel={label}
        disabled={disabled}
        onPress={onPress}
        onPressIn={press.onPressIn}
        onPressOut={press.onPressOut}
        // Nur style, kein className: NativeWind verwirft im Web sonst Styles an Pressable.
        style={{
          minHeight: s.minHeight,
          borderRadius: s.radius,
          borderWidth: outline.regular,
          borderColor: outline.color,
          backgroundColor: tone.edge,
          paddingBottom: s.depth,
        }}
      >
        <Animated.View style={[{ flexGrow: 1, borderRadius: inner }, press.faceStyle]}>
          <GlossFill tone={tone} radius={inner} />
          <View
            style={{
              flexGrow: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: spacing.sm,
              paddingHorizontal: s.paddingHorizontal,
              paddingVertical: spacing.xs,
              minHeight: s.minHeight - s.depth - outline.regular * 2,
            }}
          >
            {leading}
            <GameText variant={size === 'sm' ? 'buttonSm' : size === 'lg' ? 'title' : 'button'} color={tone.text} shadow={needsTextShadow(tone)}>
              {label}
            </GameText>
          </View>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}
