import type { ReactNode } from 'react';
import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, radii, spacing, surface } from '../../lib/theme';

export type CardTone = 'plain' | 'muted' | 'success' | 'rare' | 'highlight' | 'night';

const TONES: Record<CardTone, { bg: string; border: string; edge: string; dashed?: boolean }> = {
  plain: { bg: colors.white, border: colors.plantDark, edge: colors.plantDark },
  muted: { bg: surface.cardMuted, border: surface.cardEdgeMuted, edge: surface.cardEdgeMuted, dashed: true },
  success: { bg: surface.leafSoft, border: colors.plantDark, edge: colors.plantDark },
  rare: { bg: surface.lavenderSoft, border: colors.plantDark, edge: colors.plantDark },
  highlight: { bg: surface.lampSoft, border: colors.plantDark, edge: colors.plantDark },
  night: { bg: colors.night, border: colors.ink, edge: colors.ink },
};

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
 * Karte im PotPou-Stil (WEB-5): runde Ecken, dunkelgrüne Kontur und eine Kante unten wie ein
 * Sticker. Mit onPress sinkt sie beim Drücken ein wie ein Knopf. Grundlage aller Screens.
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
  const t = TONES[tone];
  const base: ViewStyle = {
    backgroundColor: t.bg,
    borderRadius: radii.lg,
    borderWidth: surface.line,
    borderStyle: t.dashed ? 'dashed' : 'solid',
    borderColor: selected ? colors.coral : t.border,
    borderBottomColor: selected ? colors.coral : t.edge,
    padding,
    gap: spacing.sm,
  };
  if (!onPress) {
    return (
      <View
        accessibilityLabel={accessibilityLabel}
        accessibilityRole={accessibilityRole}
        style={[base, { borderBottomWidth: t.dashed ? surface.line : surface.edge }, style]}
      >
        {children}
      </View>
    );
  }
  return (
    <Pressable
      accessibilityRole={accessibilityRole ?? 'button'}
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        base,
        {
          borderBottomWidth: pressed ? surface.line : surface.edge,
          transform: [{ translateY: pressed ? surface.edge - surface.line : 0 }],
        },
        style,
      ]}
    >
      {children}
    </Pressable>
  );
}
