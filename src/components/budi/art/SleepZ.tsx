import { Path } from '@shopify/react-native-skia';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { cancelAnimation, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

import { artColors } from '../../../lib/theme';
import { ArtCanvas } from './ArtCanvas';

const FLOAT_MS = 2400;
/** Größe der Z-Leinwand relativ zu Budi. */
const Z_BOX = 0.3;

const Z = (x: number, y: number, s: number) =>
  `M${x - s} ${y - s} L${x + s} ${y - s} L${x - s} ${y + s} L${x + s} ${y + s}`;

/** Schlafende Budi: kleine Zs steigen neben dem Topf auf. */
export function SleepZ({ visible, size }: { visible: boolean; size: number }) {
  const t = useSharedValue(0);
  useEffect(() => {
    if (!visible) {
      cancelAnimation(t);
      t.value = 0;
      return;
    }
    t.value = withRepeat(withTiming(1, { duration: FLOAT_MS }), -1);
  }, [visible, t]);
  const style = useAnimatedStyle(() => ({
    opacity: Math.sin(t.value * Math.PI),
    transform: [{ translateY: -t.value * size * 0.12 }, { translateX: t.value * size * 0.04 }],
  }));
  if (!visible) return null;
  const box = size * Z_BOX;
  return (
    <Animated.View pointerEvents="none" style={[styles.box, { left: size * 0.68, top: size * 0.42 }, style]}>
      <ArtCanvas width={box} height={box} still>
        {[
          { x: 22, y: 76, s: 9 },
          { x: 50, y: 48, s: 12 },
          { x: 80, y: 18, s: 14 },
        ].map(({ x, y, s }) => (
          <Path key={x} path={Z(x, y, s)} color={artColors.zzz} style="stroke" strokeWidth={7} strokeJoin="round" strokeCap="round" />
        ))}
      </ArtCanvas>
    </Animated.View>
  );
}

const styles = StyleSheet.create({ box: { position: 'absolute' } });
