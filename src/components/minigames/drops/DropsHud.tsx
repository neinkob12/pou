import { StyleSheet, Text, View } from 'react-native';

import { dropsGame as t } from '../../../content/strings';
import { DROPS_GAME } from '../../../game/config';
import { gameRadii, outline, tones, type Tone } from '../../../lib/theme';
import { GlossFill } from '../../ui/game/GlossFill';
import { GameText } from '../../ui/GameText';
import { StrokeText } from '../framework/StrokeText';
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
function GainBar({ label, value, tone }: { label: string; value: number; tone: Tone }) {
  const max = DROPS_GAME.maxBarGainPerRound;
  return (
    <View className="min-w-24 gap-1">
      <GameText variant="small" color={tone.edge}>
        {`${label} +${value}/${max}`}
      </GameText>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${(100 * value) / max}%` }]}>
          <GlossFill tone={tone} radius={5} shine={false} />
        </View>
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
            <View key={i} style={{ opacity: i < lives ? 1 : 0.3 }}>
              <StrokeText size={24} color={i < lives ? tones.coral.base : tones.stone.base} stroke={2}>
                {HEART}
              </StrokeText>
            </View>
          ))}
        </View>
        <GainBar label={t.water} value={shown.water} tone={tones.sky} />
        <GainBar label={t.nutrients} value={shown.nutrients} tone={tones.leaf} />
      </View>
      {reward === null && <Text className="font-body text-sm text-inkMuted">{t.noReward}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 14,
    overflow: 'hidden',
    borderRadius: gameRadii.pill,
    borderWidth: outline.thin,
    borderColor: outline.color,
    backgroundColor: tones.cream.light,
  },
  fill: { height: 10, borderRadius: 5, overflow: 'hidden' },
});
