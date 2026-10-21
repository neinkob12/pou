import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';
import Animated, { FadeIn, FadeInUp, ZoomIn } from 'react-native-reanimated';

import { QUALITY_STARS, STRAINS } from '../../game/config';
import { harvestScreen, screenUi } from '../../content/strings';
import { cue } from '../../lib/audio';
import { harvest as harvestAssets } from '../../lib/assets';
import { useGameStore } from '../../store/gameStore';
import { coinsStartMs, COUNT_UP_MS } from '../feedback/celebration';
import { CountUpText } from '../feedback/CountUpText';
import { GlowRays } from '../feedback/GlowRays';
import { RevealBox } from '../feedback/RevealBox';
import { Sparkles } from '../feedback/Sparkles';
import { StarRow } from '../feedback/StarRow';
import { AssetImage } from '../ui/AssetImage';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { DoubleCoinsSlot } from './DoubleCoinsSlot';
import type { HarvestResult } from './harvestFlow';
import { HarvestSteps } from './HarvestSteps';

const GLOW_SIZE = 280;

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
      <View className="gap-4">
        <HarvestSteps current={3} />
        <Card tone="highlight" padding={24}>
          <View className="items-center gap-4">
            <Text className="text-center font-heading text-3xl text-ink">{harvestScreen.revealTitle}</Text>
            <View
              style={{ height: GLOW_SIZE * 0.75, alignSelf: 'stretch', alignItems: 'center', justifyContent: 'center' }}
            >
              <GlowRays size={GLOW_SIZE} />
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
          </View>
        </Card>
      </View>
    );
  }

  return (
    <View className="items-center gap-3">
      <Card tone="highlight" padding={20} style={{ alignSelf: 'stretch', overflow: 'hidden' }}>
        <View className="items-center gap-2">
          <Animated.View entering={ZoomIn.springify().damping(10)}>
            <Text className="font-heading text-3xl text-ink">{harvestScreen.summaryTitle}</Text>
          </Animated.View>
          <Badge label={STRAINS[result.strainId].name} color="plantLight" />
          <View
            style={{ height: GLOW_SIZE * 0.6, alignSelf: 'stretch', alignItems: 'center', justifyContent: 'center' }}
          >
            <GlowRays size={GLOW_SIZE} />
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
            <Text className="font-body-bold text-base text-ink">{harvestScreen.summaryYield(result.yieldUnits)}</Text>
          </Animated.View>
        </View>
      </Card>
      {/* Reanimated-Views bekommen Layout per style, NativeWind-Klassen nur innen (Web). */}
      <Animated.View entering={FadeInUp.delay(coinsAt - 200)} style={{ width: '100%' }}>
        <Card>
          <View className="w-full items-center gap-1">
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
        </Card>
      </Animated.View>
      {result.newStrains.map((id) => (
        <Animated.View key={id} entering={ZoomIn.delay(afterCoins).springify().damping(9)} style={{ width: '100%' }}>
          <Card tone="rare">
            <View className="items-center gap-1">
              <Badge label={screenUi.newBadge} color="lavender" light />
              <Text className="text-center font-heading text-lg text-ink">
                {harvestScreen.summaryNewStrain(STRAINS[id].name)}
              </Text>
            </View>
          </Card>
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
