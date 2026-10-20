import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';
import Animated, { FadeIn, FadeInUp, ZoomIn } from 'react-native-reanimated';

import { QUALITY_STARS, STRAINS } from '../../game/config';
import { harvestScreen } from '../../content/strings';
import { cue } from '../../lib/audio';
import { harvest as harvestAssets } from '../../lib/assets';
import { useGameStore } from '../../store/gameStore';
import { coinsStartMs, COUNT_UP_MS } from '../feedback/celebration';
import { CountUpText } from '../feedback/CountUpText';
import { RevealBox } from '../feedback/RevealBox';
import { Sparkles } from '../feedback/Sparkles';
import { StarRow } from '../feedback/StarRow';
import { AssetImage } from '../ui/AssetImage';
import { Button } from '../ui/Button';
import { DoubleCoinsSlot } from './DoubleCoinsSlot';
import type { HarvestResult } from './harvestFlow';

/**
 * Abschluss als Höhepunkt (WEB-3): Erntekiste wackelt, Antippen deckt auf, Sterne springen
 * nacheinander herein, die Münzen zählen hoch, neue Sorten kommen als Banner.
 */
export function HarvestSummary({ result }: { result: HarvestResult }) {
  const router = useRouter();
  const clear = useGameStore((s) => s.clearHarvestResult);
  const [open, setOpen] = useState(false);
  const coinsAt = coinsStartMs(QUALITY_STARS.max);
  const afterCoins = coinsAt + COUNT_UP_MS;

  const next = () => {
    clear();
    router.push('/seed-select');
  };

  const crate = (
    <AssetImage
      source={harvestAssets.b8_crate}
      label={harvestScreen.summaryCrate}
      color="terracotta"
      size={180}
      height={120}
    />
  );

  if (!open) {
    return (
      <View className="items-center gap-4 py-6">
        <Text className="font-heading text-3xl text-ink">{harvestScreen.revealTitle}</Text>
        <RevealBox
          hint={harvestScreen.revealHint}
          accessibilityLabel={harvestScreen.revealHint}
          onOpen={() => {
            cue('harvest');
            setOpen(true);
          }}
        >
          {crate}
        </RevealBox>
      </View>
    );
  }

  return (
    <View className="items-center gap-3">
      <Animated.View entering={ZoomIn.springify().damping(10)}>
        <Text className="font-heading text-3xl text-ink">{harvestScreen.summaryTitle}</Text>
      </Animated.View>
      <View className="items-center justify-center">
        <Sparkles />
        <Animated.View entering={ZoomIn.springify().damping(8)}>{crate}</Animated.View>
      </View>
      <StarRow
        stars={result.stars}
        max={QUALITY_STARS.max}
        full={harvestScreen.starFull}
        empty={harvestScreen.starEmpty}
        accessibilityLabel={harvestScreen.summaryStars(result.stars)}
      />
      <Animated.View entering={FadeIn.delay(coinsAt - 200)} style={{ alignItems: 'center' }}>
        <Text className="font-body text-base text-ink">{STRAINS[result.strainId].name}</Text>
        <Text className="font-body text-base text-ink">{harvestScreen.summaryYield(result.yieldUnits)}</Text>
      </Animated.View>
      {/* Reanimated-Views bekommen Layout per style, NativeWind-Klassen nur innen (Web). */}
      <Animated.View entering={FadeInUp.delay(coinsAt - 200)} style={{ width: '100%' }}>
        <View className="w-full items-center gap-1 rounded-2xl bg-white/80 p-3">
          <Text className="font-body text-sm text-inkMuted">{harvestScreen.summaryMarket}</Text>
          <CountUpText
            value={result.coins}
            format={harvestScreen.summaryCoins}
            delayMs={coinsAt}
            onDone={() => cue('coins')}
            className="font-heading text-3xl text-coral"
          />
          {result.coinsDoubled ? (
            <Text className="font-body-bold text-sm text-coral">{harvestScreen.summaryCoinsDoubled}</Text>
          ) : null}
          <Text className="font-body text-base text-ink">
            {result.seedFragments > 0
              ? harvestScreen.summaryFragments(result.seedFragments)
              : harvestScreen.summaryNoFragments}
          </Text>
        </View>
      </Animated.View>
      {result.newStrains.map((id) => (
        <Animated.View key={id} entering={ZoomIn.delay(afterCoins).springify().damping(9)} style={{ width: '100%' }}>
          <View className="w-full items-center rounded-2xl bg-lavender p-3">
            <Text className="text-center font-heading text-lg text-white">
              {harvestScreen.summaryNewStrain(STRAINS[id].name)}
            </Text>
          </View>
        </Animated.View>
      ))}
      <Animated.View entering={FadeIn.delay(afterCoins)} style={{ width: '100%' }}>
        <View className="w-full gap-2">
          <DoubleCoinsSlot result={result} />
          <Button label={harvestScreen.summaryNext} onPress={next} />
        </View>
      </Animated.View>
    </View>
  );
}
