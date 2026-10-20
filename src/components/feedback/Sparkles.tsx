import { useEffect, useMemo } from 'react';
import { View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';

import { colors } from '../../lib/theme';
import { makeSparkles, type Sparkle } from './celebration';

const SPARKLE_COLORS = [colors.lamp, colors.coral, colors.lavender, colors.plantLight];
const FLY_MS = 1300;

function Dot({ sparkle, playKey }: { sparkle: Sparkle; playKey: number }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = 0;
    t.value = withDelay(sparkle.delayMs, withTiming(1, { duration: FLY_MS, easing: Easing.out(Easing.cubic) }));
  }, [playKey, sparkle.delayMs, t]);
  const rad = (sparkle.angle * Math.PI) / 180;
  const style = useAnimatedStyle(() => ({
    opacity: t.value < 0.7 ? 1 : 1 - (t.value - 0.7) / 0.3,
    transform: [
      { translateX: Math.cos(rad) * sparkle.distance * t.value },
      { translateY: Math.sin(rad) * sparkle.distance * t.value },
      { scale: 1 - t.value * 0.5 },
    ],
  }));
  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          width: sparkle.size,
          height: sparkle.size,
          borderRadius: sparkle.size / 2,
          backgroundColor: SPARKLE_COLORS[sparkle.colorIndex],
        },
        style,
      ]}
    />
  );
}

/** Funken fliegen aus der Mitte nach außen (WEB-3). Neuer `playKey` startet sie neu. */
export function Sparkles({ count = 24, playKey = 0 }: { count?: number; playKey?: number }) {
  const sparkles = useMemo(() => makeSparkles(count, SPARKLE_COLORS.length), [count]);
  return (
    <View pointerEvents="none" className="absolute inset-0 items-center justify-center">
      {sparkles.map((s, i) => (
        <Dot key={i} sparkle={s} playKey={playKey} />
      ))}
    </View>
  );
}
