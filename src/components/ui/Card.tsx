import type { ReactNode } from 'react';
import { Animated, Pressable, View, type StyleProp, type ViewStyle } from 'react-native';

import { cardTones, depth, gameRadii, insets, outline, shadows, spacing, tones } from '../../lib/theme';
import { gradientStyle } from './game/gradient';
import { usePressSpring } from './game/usePressSpring';

export type CardTone = keyof typeof cardTones;

interface CardProps {
  children: ReactNode;
  tone?: CardTone;
  /** Hervorgehoben, etwa beim Anprobieren: Kontur in Koralle. */
  selected?: boolean;
  padding?: number;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  accessibilityLabel?: string;
  accessibilityRole?: 'button' | 'summary';
}

/**
 * Karte im Spiel-Look (ART-1): zarter Verlauf, dicke Kontur, dicke Unterkante wie ein Sticker,
 * Lichtkante innen oben und weicher Schatten. Mit onPress federt sie beim Drücken wie ein Knopf.
 */
export function Card({
  children,
  tone = 'plain',
  selected = false,
  padding = spacing.md,
  style,
  onPress,
  accessibilityLabel,
  accessibilityRole,
}: CardProps) {
  const t = cardTones[tone];
  const muted = tone === 'muted';
  const border = selected ? tones.coral.edge : t.border;
  const press = usePressSpring({ sink: depth.sm, quiet: false });
  const body: ViewStyle = {
    ...gradientStyle(`linear-gradient(180deg, ${t.top} 0%, ${t.bottom} 100%)`, t.bottom),
    borderRadius: gameRadii.card,
    borderWidth: selected ? outline.thick : outline.regular,
    borderStyle: muted ? 'dashed' : 'solid',
    borderColor: border,
    borderBottomWidth: muted ? outline.regular : outline.regular + depth.sm,
    boxShadow: muted ? undefined : insets.highlight,
    padding,
    gap: spacing.sm,
  };
  const shell: ViewStyle = { borderRadius: gameRadii.card, boxShadow: muted ? undefined : shadows.card };

  if (!onPress) {
    return (
      <View style={[shell, style]}>
        <View accessibilityLabel={accessibilityLabel} accessibilityRole={accessibilityRole} style={[body, { flexGrow: 1 }]}>
          {children}
        </View>
      </View>
    );
  }
  return (
    <Animated.View style={[shell, style, press.outerStyle]}>
      <Pressable
        accessibilityRole={accessibilityRole ?? 'button'}
        accessibilityLabel={accessibilityLabel}
        accessibilityState={{ selected }}
        onPress={onPress}
        onPressIn={press.onPressIn}
        onPressOut={press.onPressOut}
        style={[body, { flexGrow: 1 }]}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}
