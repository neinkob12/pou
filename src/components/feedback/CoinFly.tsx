import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { colors } from '../../lib/theme';
import type { Point } from './coinTarget';

const COIN_SIZE = 22;
const COIN_COUNT = 8;
const FLY_MS = 650;
const STAGGER_MS = 60;
/** Bogenhöhe: Münzen fliegen erst hoch, dann zum Zähler. */
const ARC = 80;

function Coin({ from, to, index, onDone }: { from: Point; to: Point; index: number; onDone?: () => void }) {
  const t = useSharedValue(0);
  const jitter = (index % 4) * 10 - 15;
  useEffect(() => {
    t.value = withDelay(
      index * STAGGER_MS,
      withTiming(1, { duration: FLY_MS, easing: Easing.in(Easing.quad) }, (finished) => {
        if (finished && onDone) runOnJS(onDone)();
      }),
    );
  }, [index, onDone, t]);
  const style = useAnimatedStyle(() => ({
    opacity: t.value > 0.95 ? 0 : 1,
    transform: [
      { translateX: from.x + jitter * (1 - t.value) + (to.x - from.x) * t.value - COIN_SIZE / 2 },
      { translateY: from.y + (to.y - from.y) * t.value - ARC * Math.sin(Math.PI * t.value) - COIN_SIZE / 2 },
      { scale: 1 - 0.3 * t.value },
    ],
  }));
  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: 0,
          top: 0,
          width: COIN_SIZE,
          height: COIN_SIZE,
          borderRadius: COIN_SIZE / 2,
          backgroundColor: colors.lamp,
          borderWidth: 2,
          borderColor: colors.terracotta,
        },
        style,
      ]}
    />
  );
}

/** Münzen fliegen im Bogen von `from` zum Münzzähler `to` (WEB-3). Koordinaten relativ zur Ebene. */
export function CoinFly({ from, to, onDone }: { from: Point; to: Point; onDone: () => void }) {
  return (
    <View pointerEvents="none" className="absolute inset-0">
      {Array.from({ length: COIN_COUNT }, (_, i) => (
        <Coin key={i} from={from} to={to} index={i} onDone={i === COIN_COUNT - 1 ? onDone : undefined} />
      ))}
    </View>
  );
}
