import { Button } from '../../ui/Button';

interface GameButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
}

/** Großer Knopf für Overlays im Minigame: der 3D-Spielknopf aus dem Design-System (ART-1). */
export function GameButton({ label, onPress, variant = 'primary' }: GameButtonProps) {
  return <Button label={label} onPress={onPress} variant={variant} size={variant === 'primary' ? 'lg' : 'md'} />;
}
