import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';

import { QUALITY_STARS, STRAINS } from '../../game/config';
import { harvestScreen } from '../../content/strings';
import { harvest as harvestAssets } from '../../lib/assets';
import { useGameStore } from '../../store/gameStore';
import { AssetImage } from '../ui/AssetImage';
import { Button } from '../ui/Button';
import { DoubleCoinsSlot } from './DoubleCoinsSlot';
import type { HarvestResult } from './harvestFlow';

/** Abschluss: Sterne, Ertrag, Münzen vom Kräutermarkt, Samen-Fragmente, neue Sorten. */
export function HarvestSummary({ result }: { result: HarvestResult }) {
  const router = useRouter();
  const clear = useGameStore((s) => s.clearHarvestResult);
  const stars =
    harvestScreen.starFull.repeat(result.stars) + harvestScreen.starEmpty.repeat(QUALITY_STARS.max - result.stars);

  const next = () => {
    clear();
    router.push('/seed-select');
  };

  return (
    <View className="items-center gap-3">
      <Text className="font-heading text-3xl text-ink">{harvestScreen.summaryTitle}</Text>
      <AssetImage source={harvestAssets.b8_crate} label={harvestScreen.summaryCrate} color="terracotta" size={180} height={120} />
      <Text accessibilityLabel={harvestScreen.summaryStars(result.stars)} className="font-heading text-4xl text-coral">
        {stars}
      </Text>
      <Text className="font-body text-base text-ink">{STRAINS[result.strainId].name}</Text>
      <Text className="font-body text-base text-ink">{harvestScreen.summaryYield(result.yieldUnits)}</Text>
      <View className="w-full items-center gap-1 rounded-2xl bg-white/80 p-3">
        <Text className="font-body text-sm text-inkMuted">{harvestScreen.summaryMarket}</Text>
        <Text className="font-heading text-2xl text-ink">{harvestScreen.summaryCoins(result.coins)}</Text>
        {result.coinsDoubled ? (
          <Text className="font-body-bold text-sm text-coral">{harvestScreen.summaryCoinsDoubled}</Text>
        ) : null}
        <Text className="font-body text-base text-ink">
          {result.seedFragments > 0
            ? harvestScreen.summaryFragments(result.seedFragments)
            : harvestScreen.summaryNoFragments}
        </Text>
      </View>
      {result.newStrains.map((id) => (
        <Text key={id} className="text-center font-body-bold text-base text-plantDark">
          {harvestScreen.summaryNewStrain(STRAINS[id].name)}
        </Text>
      ))}
      <View className="w-full gap-2">
        <DoubleCoinsSlot result={result} />
        <Button label={harvestScreen.summaryNext} onPress={next} />
      </View>
    </View>
  );
}
