import { useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { GoldCoin } from './GoldCoin';
import { COIN_RAIN_FALL_MS, coinRainCount, makeCoinRain, type RainCoin } from './rewardFx';

/** Nach der Landung liegen die Münzen kurz, dann blenden sie aus. */
const REST_MS = 700;
const FADE_MS = 300;

function Coin({ coin, width, height, playKey }: { coin: RainCoin; width: number; height: number; playKey: number }) {
  const fall = useSharedValue(0);
  const fade = useSharedValue(1);
  useEffect(() => {
    fall.value = 0;
    fade.value = 1;
    // Fallen, beim Aufprall federnd überschießen (hüpft kurz hoch), dann liegen bleiben.
    fall.value = withDelay(
      coin.delayMs,
      withSequence(
        withTiming(1, { duration: COIN_RAIN_FALL_MS, easing: Easing.in(Easing.quad) }),
        withSpring(1, { velocity: -3, damping: 6, stiffness: 260 }),
      ),
    );
    fade.value = withDelay(coin.delayMs + COIN_RAIN_FALL_MS + REST_MS, withTiming(0, { duration: FADE_MS }));
  }, [playKey, coin.delayMs, fall, fade]);
  const style = useAnimatedStyle(() => {
    const y = -coin.size + fall.value * (coin.landY * height + coin.size);
    // Kurz vor dem Boden staucht die Münze (Squash), in der Luft ist sie gestreckt.
    const squash = fall.value > 0.97 ? 0.8 : 1.08;
    return {
      opacity: fall.value <= 0 ? 0 : fade.value,
      transform: [
        { translateX: coin.x * width - coin.size / 2 },
        { translateY: y },
        { rotate: `${coin.tilt * (1 - fall.value)}deg` },
        { scaleY: squash },
        { scaleX: 2 - squash },
      ],
    };
  });
  return (
    <Animated.View style={[{ position: 'absolute', left: 0, top: 0 }, style]}>
      <GoldCoin size={coin.size} />
    </Animated.View>
  );
}

/**
 * Münzregen (ART-5): Münzen fallen von oben, landen federnd im unteren Bereich und verschwinden.
 * Die Anzahl wächst mit `coins`, ist aber gedeckelt. Startet mit jedem neuen `playKey`.
 */
export function CoinRain({ coins, playKey = 0 }: { coins: number; playKey?: number }) {
  const reduced = useReducedMotion();
  const count = coinRainCount(coins);
  const rain = useMemo(() => makeCoinRain(count), [count]);
  const [size, setSize] = useState({ width: 0, height: 0 });
  if (reduced || count === 0) return null;
  return (
    <View
      pointerEvents="none"
      style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, overflow: 'hidden' }}
      onLayout={(e) => setSize({ width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height })}
    >
      {size.width > 0
        ? rain.map((c, i) => <Coin key={i} coin={c} width={size.width} height={size.height} playKey={playKey} />)
        : null}
    </View>
  );
}
