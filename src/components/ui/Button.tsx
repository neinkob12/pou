import type { ReactNode } from 'react';
import { Pressable, Text } from 'react-native';

import { artColors, colors, surface } from '../../lib/theme';

type Variant = 'primary' | 'secondary' | 'success';

interface ButtonProps {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  variant?: Variant;
  /** Kleines Bild vor dem Text, etwa die Münze am Preis (WEB-5). */
  leading?: ReactNode;
  /** Kompakt für Karten: 40 statt 48 hoch. */
  size?: 'md' | 'sm';
}

const LOOK: Record<Variant, { bg: string; edge: string; text: string }> = {
  primary: { bg: 'bg-coral', edge: artColors.curtainShade, text: 'text-white' },
  secondary: { bg: 'bg-white', edge: colors.plantDark, text: 'text-ink' },
  success: { bg: 'bg-plantLight', edge: colors.plantDark, text: 'text-ink' },
};

/**
 * Runder Standard-Button: Koralle für Hauptaktionen, Weiß für Nebenaktionen, Grün für "fertig".
 * Kontur und Kante unten, sinkt beim Drücken ein (WEB-1). Gesperrt wirkt er stumpf statt blass (WEB-5).
 */
export function Button({ label, onPress, disabled = false, variant = 'primary', leading, size = 'md' }: ButtonProps) {
  const look = LOOK[variant];
  const height = size === 'sm' ? 'min-h-10 px-4 py-2' : 'min-h-12 px-5 py-3';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      className={`flex-row items-center justify-center gap-2 rounded-full ${height} ${disabled ? '' : look.bg}`}
      style={({ pressed }) => ({
        backgroundColor: disabled ? surface.cardMuted : undefined,
        borderWidth: surface.line,
        borderColor: disabled ? surface.cardEdgeMuted : colors.plantDark,
        borderBottomWidth: pressed || disabled ? surface.line : surface.edge,
        borderBottomColor: disabled ? surface.cardEdgeMuted : look.edge,
        transform: [{ translateY: pressed && !disabled ? surface.edge - surface.line : 0 }],
      })}
    >
      {leading}
      <Text className={`font-body-bold ${size === 'sm' ? 'text-sm' : 'text-base'} ${disabled ? 'text-inkMuted' : look.text}`}>
        {label}
      </Text>
    </Pressable>
  );
}
