import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { artColors } from '../../../lib/theme';
import { roomLayout } from './roomLayout';

// Leben im Zimmer (WEB-4): Staubkörnchen im Sonnenlicht, funkelnde Sterne im Fenster.
// Kleine Views mit Reanimated statt Leinwand: kein Neuzeichnen, im Browser kein WebGL-Kontext.

const MOTE_MS = 6000;
const TWINKLE_MS = 1400;

interface Spot {
  /** Lage im Fenster bzw. Sonnenstrahl, 0 bis 1. */
  fx: number;
  fy: number;
  delay: number;
  size: number;
}

const MOTES: readonly Spot[] = [
  { fx: 0.2, fy: 0.35, delay: 0, size: 3 },
  { fx: 0.55, fy: 0.55, delay: 1500, size: 2.5 },
  { fx: 0.8, fy: 0.25, delay: 3000, size: 3.5 },
  { fx: 0.4, fy: 0.8, delay: 4200, size: 2.5 },
];
const STARS: readonly Spot[] = [
  { fx: 0.3, fy: 0.12, delay: 0, size: 3 },
  { fx: 0.85, fy: 0.72, delay: 600, size: 2.5 },
  { fx: 0.12, fy: 0.42, delay: 1100, size: 2.5 },
];

function Mote({ x, y, rise, spot }: { x: number; y: number; rise: number; spot: Spot }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withDelay(spot.delay, withRepeat(withTiming(1, { duration: MOTE_MS, easing: Easing.inOut(Easing.sin) }), -1));
    return () => cancelAnimation(t);
  }, [t, spot.delay]);
  const style = useAnimatedStyle(() => ({
    opacity: Math.sin(t.value * Math.PI) * 0.9,
    transform: [{ translateY: -t.value * rise }, { translateX: Math.sin(t.value * Math.PI * 2) * 6 }],
  }));
  return (
    <Animated.View
      style={[
        styles.dot,
        { left: x, top: y, width: spot.size, height: spot.size, borderRadius: spot.size, backgroundColor: artColors.moon },
        style,
      ]}
    />
  );
}

function Star({ x, y, spot }: { x: number; y: number; spot: Spot }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withDelay(spot.delay, withRepeat(withTiming(1, { duration: TWINKLE_MS }), -1, true));
    return () => cancelAnimation(t);
  }, [t, spot.delay]);
  const style = useAnimatedStyle(() => ({ opacity: 0.25 + t.value * 0.75, transform: [{ scale: 0.6 + t.value * 0.7 }] }));
  return (
    <Animated.View
      style={[
        styles.dot,
        { left: x, top: y, width: spot.size, height: spot.size, borderRadius: spot.size, backgroundColor: artColors.moon },
        style,
      ]}
    />
  );
}

/** Bewegte Kleinigkeiten über dem gezeichneten Zimmer. */
export function RoomAmbience({ width, height, isDay }: { width: number; height: number; isDay: boolean }) {
  const l = roomLayout(width, height);
  const u = width / 100;
  const { x, y, w, h } = l.window;
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {isDay
        ? MOTES.map((m) => (
            <Mote
              key={m.fx}
              spot={m}
              x={(x + w * 0.3 + (w + 12) * m.fx) * u}
              y={(y + h + (l.floorY - y - h) * m.fy) * u}
              rise={8 * u}
            />
          ))
        : STARS.map((s) => <Star key={s.fx} spot={s} x={(x + w * s.fx) * u} y={(y + h * s.fy) * u} />)}
    </View>
  );
}

const styles = StyleSheet.create({
  dot: { position: 'absolute' },
});
