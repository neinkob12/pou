import { StyleSheet, Text, View } from 'react-native';

import { health as healthText } from '../../content/strings';
import { COMA_REVIVE_COINS } from '../../game/config';
import type { Condition } from '../../game/needs';
import { colors, radii } from '../../lib/theme';
import { useGameStore } from '../../store/gameStore';
import { playCareHaptic } from '../room/care/haptics';
import { isRewardedReviveReady, reviveAfterRewardedAd, reviveWithCoins } from '../room/health/healthLogic';
import { Button } from '../ui/Button';

/** Wie stark Budi im Koma ausgegraut wird. */
const COMA_GREY_OPACITY = 0.55;

/**
 * Koma (P21): Budi grau, darüber Wiederbeleben gegen Münzen und der Werbe-Knopf (P29, noch aus).
 * Koma-Wahrheit ist deriveCondition (P04), hier als `condition` aus useNeeds.
 */
export function ComaOverlay({ condition }: { condition: Condition | null }) {
  const coins = useGameStore((s) => s.coins);
  if (condition !== 'coma') return null;

  const affordable = coins >= COMA_REVIVE_COINS;
  const adReady = isRewardedReviveReady();
  const onRevive = () => playCareHaptic(reviveWithCoins(useGameStore.getState(), Date.now()) ? 'success' : 'error');
  const onAd = () => {
    // Hook-Punkt P29: erst die Rewarded Ad zeigen, bei Belohnung dann wiederbeleben.
    reviveAfterRewardedAd(useGameStore.getState(), Date.now());
    playCareHaptic('success');
  };

  return (
    <View style={StyleSheet.absoluteFill}>
      <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.grey]} />
      <View className="flex-1 items-center justify-end gap-2 px-2 pb-2">
        <View className="items-center rounded-2xl bg-white/90 px-3 py-2">
          <Text className="font-heading text-lg text-ink">{healthText.comaTitle}</Text>
          <Text className="text-center font-body text-sm text-ink">{healthText.comaText}</Text>
        </View>
        <Button label={healthText.revive(COMA_REVIVE_COINS)} onPress={onRevive} disabled={!affordable} />
        {affordable ? null : <Text className="font-body-bold text-sm text-white">{healthText.reviveTooPoor}</Text>}
        <Button label={healthText.reviveAd} variant="secondary" onPress={onAd} disabled={!adReady} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  grey: { backgroundColor: colors.inkMuted, opacity: COMA_GREY_OPACITY, borderRadius: radii.lg },
});
