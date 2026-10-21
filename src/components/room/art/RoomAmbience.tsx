import { useEffect, type ReactNode } from 'react';
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

import { SKY } from './roomPalette';
import type { Box } from './roomLayout';

// Leben im Zimmer (WEB-4, ART-4): Staub im Sonnenlicht, wehende Vorhänge, pulsierende Lichter.
// Nur Transform und Deckkraft von Views laufen pro Frame; die Leinwände darin bleiben still.

const MOTE_MS = 6500;
const CURTAIN_MS = 3800;
const CURTAIN_DEG = 1.6;
const GLOW_MS = 2200;

interface Mote {
  /** Lage im Lichtstrahl, 0 bis 1. */
  fx: number;
  fy: number;
  delay: number;
  size: number;
}

const MOTES: readonly Mote[] = [
  { fx: 0.15, fy: 0.3, delay: 0, size: 3 },
  { fx: 0.5, fy: 0.5, delay: 1300, size: 2.5 },
  { fx: 0.8, fy: 0.2, delay: 2600, size: 3.5 },
  { fx: 0.35, fy: 0.8, delay: 3900, size: 2.5 },
  { fx: 0.65, fy: 0.65, delay: 5200, size: 2 },
];

function MoteDot({ x, y, rise, mote }: { x: number; y: number; rise: number; mote: Mote }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withDelay(mote.delay, withRepeat(withTiming(1, { duration: MOTE_MS, easing: Easing.inOut(Easing.sin) }), -1));
    return () => cancelAnimation(t);
  }, [t, mote.delay]);
  const style = useAnimatedStyle(() => ({
    opacity: Math.sin(t.value * Math.PI) * 0.9,
    transform: [{ translateY: -t.value * rise }, { translateX: Math.sin(t.value * Math.PI * 2) * 6 }],
  }));
  return (
    <Animated.View
      style={[styles.abs, { left: x, top: y, width: mote.size, height: mote.size, borderRadius: mote.size, backgroundColor: SKY.moon }, style]}
    />
  );
}

/** Staubkörnchen, die im Lichtstrahl unter dem Fenster schweben. `beam` in Punkten. */
export function DustMotes({ beam }: { beam: Box }) {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {MOTES.map((m) => (
        <MoteDot key={m.fx} mote={m} x={beam.x + beam.w * m.fx} y={beam.y + beam.h * m.fy} rise={beam.h * 0.25} />
      ))}
    </View>
  );
}

/** Vorhang wiegt sich leicht, aufgehängt an der Stange. `mirror` dreht die Richtung für rechts. */
export function SwayingCurtain({ box, mirror, delay, children }: { box: Box; mirror: boolean; delay: number; children: ReactNode }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withDelay(delay, withRepeat(withTiming(1, { duration: CURTAIN_MS, easing: Easing.inOut(Easing.sin) }), -1, true));
    return () => cancelAnimation(t);
  }, [t, delay]);
  const style = useAnimatedStyle(() => ({
    transform: [{ rotate: `${(t.value - 0.5) * 2 * CURTAIN_DEG * (mirror ? -1 : 1)}deg` }, { scaleY: 1 + t.value * 0.012 }],
  }));
  return (
    <Animated.View pointerEvents="none" style={[styles.abs, styles.top, { left: box.x, top: box.y, width: box.w, height: box.h }, style]}>
      {children}
    </Animated.View>
  );
}

/** Weicher Schein, der langsam heller und dunkler wird (Lichterkette, Nachtlicht). */
export function GlowPulse({ children }: { children: ReactNode }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withRepeat(withTiming(1, { duration: GLOW_MS, easing: Easing.inOut(Easing.sin) }), -1, true);
    return () => cancelAnimation(t);
  }, [t]);
  const style = useAnimatedStyle(() => ({ opacity: 0.6 + t.value * 0.4 }));
  return (
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, style]}>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  abs: { position: 'absolute' },
  top: { transformOrigin: 'top' },
});
