import { Pressable, Text } from 'react-native';

import { artColors, colors } from '../../lib/theme';

interface ButtonProps {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
}

/** Kante unten: der Knopf wirkt gedrückt-bar (WEB-1). Beim Drücken sinkt er ein. */
const EDGE = 4;

/** Runder Standard-Button: Koralle für Hauptaktionen, Weiß für Nebenaktionen. Mindestens 48 hoch. */
export function Button({ label, onPress, disabled = false, variant = 'primary' }: ButtonProps) {
  const primary = variant === 'primary';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      className={`min-h-12 items-center justify-center rounded-full px-5 py-3 ${primary ? 'bg-coral' : 'bg-white'} ${disabled ? 'opacity-50' : ''}`}
      style={({ pressed }) => ({
        borderWidth: 2,
        borderColor: colors.plantDark,
        borderBottomWidth: pressed ? 2 : EDGE,
        borderBottomColor: primary ? artColors.curtainShade : colors.plantDark,
        transform: [{ translateY: pressed ? EDGE - 2 : 0 }],
      })}
    >
      <Text className={`font-body-bold text-base ${primary ? 'text-white' : 'text-ink'}`}>{label}</Text>
    </Pressable>
  );
}
