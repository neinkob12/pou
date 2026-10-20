import { Text, View } from 'react-native';

import { dropsGame as t } from '../../../content/strings';
import { DROPS_GAME } from '../../../game/config';
import { colors } from '../../../lib/theme';
import type { DropsReward } from './dropsLogic';

interface DropsHudProps {
  lives: number;
  /** Zuwachs während der Runde (schon gedeckelt). */
  gain: DropsReward;
  /** Am Rundenende: was wirklich auf die Balken kam. undefined = Runde läuft, null = nichts gefüllt. */
  reward?: DropsReward | null;
}

const HEART = '♥';

/** Kleiner Balken unter der Zahl, damit man den Zuwachs auf einen Blick sieht (Auftrag 40). */
function GainBar({
  label,
  value,
  color,
  textClass,
}: {
  label: string;
  value: number;
  color: string;
  textClass: string;
}) {
  const max = DROPS_GAME.maxBarGainPerRound;
  return (
    <View className="min-w-24 gap-1">
      <Text className={`font-body-bold text-sm ${textClass}`}>
        {label} +{value}/{max}
      </Text>
      <View className="h-2 overflow-hidden rounded-full bg-white">
        <View className="h-2 rounded-full" style={{ width: `${(100 * value) / max}%`, backgroundColor: color }} />
      </View>
    </View>
  );
}

/** Leben als Herzen und Balken-Zuwachs über dem Spielfeld. */
export function DropsHud({ lives, gain, reward }: DropsHudProps) {
  const shown = reward ?? gain;
  return (
    <View className="gap-1 px-4 pb-2" pointerEvents="none">
      <View className="flex-row items-center justify-between gap-3">
        <View accessibilityLabel={`${t.lives}: ${lives}`} className="flex-row">
          {Array.from({ length: Math.max(DROPS_GAME.lives, lives) }, (_, i) => (
            <Text key={i} style={{ fontSize: 24, color: colors.coral, opacity: i < lives ? 1 : 0.2 }}>
              {HEART}
            </Text>
          ))}
        </View>
        <GainBar label={t.water} value={shown.water} color={colors.night} textClass="text-night" />
        <GainBar label={t.nutrients} value={shown.nutrients} color={colors.plantDark} textClass="text-plantDark" />
      </View>
      {reward === null && <Text className="font-body text-sm text-inkMuted">{t.noReward}</Text>}
    </View>
  );
}
