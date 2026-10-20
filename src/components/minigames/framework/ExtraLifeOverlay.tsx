import { Text } from 'react-native';

import { minigameFramework as t } from '../../../content/strings';
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
      <Text className="text-center font-heading text-3xl text-ink">{t.extraLifeQuestion}</Text>
      <GameButton label={t.extraLifeAccept} onPress={onAccept} />
      <GameButton label={t.extraLifeDecline} onPress={onDecline} variant="secondary" />
    </Overlay>
  );
}
