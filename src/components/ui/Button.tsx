import { Pressable, Text } from 'react-native';

interface ButtonProps {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
}

/** Runder Standard-Button: Koralle für Hauptaktionen, Weiß für Nebenaktionen. */
export function Button({ label, onPress, disabled = false, variant = 'primary' }: ButtonProps) {
  const primary = variant === 'primary';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      className={`items-center rounded-full px-5 py-3 active:opacity-70 ${primary ? 'bg-coral' : 'bg-white'} ${disabled ? 'opacity-50' : ''}`}
    >
      <Text className={`font-body-bold text-base ${primary ? 'text-white' : 'text-ink'}`}>{label}</Text>
    </Pressable>
  );
}
