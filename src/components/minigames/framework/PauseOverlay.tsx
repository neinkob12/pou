import { minigameFramework as t } from '../../../content/strings';
import { GameText } from '../../ui/GameText';
import { GameButton } from './GameButton';
import { Overlay } from './Overlay';

interface PauseOverlayProps {
  onResume: () => void;
  onQuit: () => void;
}

export function PauseOverlay({ onResume, onQuit }: PauseOverlayProps) {
  return (
    <Overlay>
      <GameText variant="title" align="center">
        {t.paused}
      </GameText>
      <GameButton label={t.resume} onPress={onResume} />
      <GameButton label={t.quit} onPress={onQuit} variant="secondary" />
    </Overlay>
  );
}
