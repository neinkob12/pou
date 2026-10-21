import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { SKY } from './roomPalette';
import type { Box } from './roomLayout';

// Leben im Zimmer (WEB-4, ART-4): Staub im Sonnenlicht. Wolken, Regen und Sterne: SkyLife.
// CSS-Animationen von Reanimated: laufen im Browser im Compositor und nativ im UI-Thread, ohne
// JavaScript pro Frame (mit Shared Values kostete das bei 4-facher CPU-Drosselung 15 fps).

const MOTE_MS = 6500;

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

/** Staubkörnchen, die im Lichtstrahl unter dem Fenster schweben. `beam` in Punkten. */
export function DustMotes({ beam }: { beam: Box }) {
  const rise = beam.h * 0.25;
  const anim = useMemo(
    () =>
      ({
        animationName: {
          '0%': { opacity: 0, transform: [{ translateY: 0 }, { translateX: 0 }] },
          '25%': { transform: [{ translateY: -rise * 0.25 }, { translateX: 6 }] },
          '50%': { opacity: 0.9, transform: [{ translateY: -rise * 0.5 }, { translateX: 0 }] },
          '75%': { transform: [{ translateY: -rise * 0.75 }, { translateX: -6 }] },
          '100%': { opacity: 0, transform: [{ translateY: -rise }, { translateX: 0 }] },
        },
        animationDuration: `${MOTE_MS}ms`,
        animationTimingFunction: 'ease-in-out',
        animationIterationCount: 'infinite',
        animationFillMode: 'backwards',
      }) as const,
    [rise],
  );
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {MOTES.map((m) => (
        <Animated.View
          key={m.fx}
          style={[
            styles.abs,
            {
              left: beam.x + beam.w * m.fx,
              top: beam.y + beam.h * m.fy,
              width: m.size,
              height: m.size,
              borderRadius: m.size,
              backgroundColor: SKY.moon,
            },
            anim,
            { animationDelay: `${m.delay}ms` },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  abs: { position: 'absolute' },
});
