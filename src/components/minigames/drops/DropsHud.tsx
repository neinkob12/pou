import { Text, View } from 'react-native';

import { dropsGame as t } from '../../../content/strings';
import { DROPS_GAME } from '../../../game/config';
import type { DropsReward } from './dropsLogic';

interface DropsHudProps {
  lives: number;
  /** Zuwachs während der Runde (schon gedeckelt). */
  gain: DropsReward;
  /** Am Rundenende: was wirklich auf die Balken kam. undefined = Runde läuft, null = nichts gefüllt. */
  reward?: DropsReward | null;
}

/** Leben und Balken-Zuwachs über dem Spielfeld. */
export function DropsHud({ lives, gain, reward }: DropsHudProps) {
  const shown = reward ?? gain;
  const max = DROPS_GAME.maxBarGainPerRound;
  return (
    <View className="gap-1 px-4 pb-2" pointerEvents="none">
      <View className="flex-row justify-between">
        <Text className="font-body-bold text-base text-ink">
          {t.lives}: {lives}
        </Text>
        <Text className="font-body-bold text-base text-night">
          {t.water} +{shown.water}/{max}
        </Text>
        <Text className="font-body-bold text-base text-plantDark">
          {t.nutrients} +{shown.nutrients}/{max}
        </Text>
      </View>
      {reward === null && <Text className="font-body text-sm text-inkMuted">{t.noReward}</Text>}
    </View>
  );
}
