import { minigameFramework as t } from '../../../content/strings';
import { GameText } from '../../ui/GameText';
import { GameButton } from './GameButton';
import { Overlay } from './Overlay';

interface ExtraLifeOverlayProps {
  onAccept: () => void;
  onDecline: () => void;
}

/** Nur sichtbar, wenn ein Anbieter angemeldet ist (P29, Rewarded Ad). */
export function ExtraLifeOverlay({ onAccept, onDecline }: ExtraLifeOverlayProps) {
  return (
    <Overlay>
      <GameText variant="title" align="center">
        {t.extraLifeQuestion}
      </GameText>
      <GameButton label={t.extraLifeAccept} onPress={onAccept} />
      <GameButton label={t.extraLifeDecline} onPress={onDecline} variant="secondary" />
    </Overlay>
  );
}
