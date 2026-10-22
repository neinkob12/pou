import type { ReactNode } from 'react';
import { Animated, Pressable, View, type StyleProp, type ViewStyle } from 'react-native';

import { cardTones, chrome, depth, gameRadii, insets, outline, spacing, tones } from '../../lib/theme';
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
 * Karte im Spiel-Look: zarter Verlauf, Lichtkante innen oben, weicher Schatten und eine helle
 * Unterkante wie ein Sticker. Seit dem Redesign ohne dicke dunkle Kontur: Behälter treten zurück,
 * damit Knöpfe und Bilder darin führen. Mit onPress federt sie beim Drücken wie ein Knopf.
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
  const press = usePressSpring({ sink: depth.sm, quiet: false });
  // Getönte Karten (Erfolg, Selten, Highlight) behalten eine feine Kante in ihrer Farbe.
  const line = selected ? tones.coral.edge : muted ? t.border : chrome.cardLine;
  const body: ViewStyle = {
    ...gradientStyle(`linear-gradient(180deg, ${t.top} 0%, ${t.bottom} 100%)`, t.bottom),
    borderRadius: gameRadii.card,
    borderWidth: selected ? outline.regular : muted ? outline.thin : 1,
    borderStyle: muted ? 'dashed' : 'solid',
    borderColor: line,
    borderBottomWidth: muted ? outline.thin : depth.sm + 1,
    borderBottomColor: selected ? tones.coral.edge : muted ? t.border : tone === 'night' ? t.border : chrome.cardEdge,
    boxShadow: muted ? undefined : insets.highlight,
    padding,
    gap: spacing.sm,
  };
  const shell: ViewStyle = { borderRadius: gameRadii.card, boxShadow: muted ? undefined : chrome.cardShadow };

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
