import { Pressable, Text } from 'react-native';

interface DebugButtonProps {
  label: string;
  onPress?: () => void;
  active?: boolean;
  disabled?: boolean;
}

/** Kleiner Knopf für das Debug-Menü. */
export function DebugButton({ label, onPress, active = false, disabled = false }: DebugButtonProps) {
  const tone = disabled ? 'bg-cream opacity-50' : active ? 'bg-plantDark' : 'bg-coral';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled, selected: active }}
      disabled={disabled}
      onPress={onPress}
      className={`rounded-full px-4 py-2 active:opacity-70 ${tone}`}
    >
      <Text className={`font-body-bold text-base ${disabled ? 'text-inkMuted' : 'text-white'}`}>{label}</Text>
    </Pressable>
  );
}
