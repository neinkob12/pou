import { Pressable, Text } from 'react-native';

interface GameButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
}

/** Großer Knopf für Overlays im Minigame. */
export function GameButton({ label, onPress, variant = 'primary' }: GameButtonProps) {
  const primary = variant === 'primary';
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className={`items-center rounded-full px-6 py-3 active:opacity-70 ${primary ? 'bg-coral' : 'bg-white'}`}
    >
      <Text className={`font-body-bold text-lg ${primary ? 'text-white' : 'text-ink'}`}>{label}</Text>
    </Pressable>
  );
}
