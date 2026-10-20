import { Text } from 'react-native';

import { minigameFramework as t } from '../../../content/strings';
import { GameButton } from './GameButton';
import { Overlay } from './Overlay';

interface PauseOverlayProps {
  onResume: () => void;
  onQuit: () => void;
}

export function PauseOverlay({ onResume, onQuit }: PauseOverlayProps) {
  return (
    <Overlay>
      <Text className="text-center font-heading text-3xl text-ink">{t.paused}</Text>
      <GameButton label={t.resume} onPress={onResume} />
      <GameButton label={t.quit} onPress={onQuit} variant="secondary" />
    </Overlay>
  );
}
