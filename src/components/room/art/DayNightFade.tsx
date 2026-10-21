import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

/** Dauer der Überblendung, wenn die Lampe an- oder ausgeht. Reine Darstellung. */
const FADE_MS = 1400;

function Layer({ fadeIn, onDone, children }: { fadeIn: boolean; onDone: () => void; children: ReactNode }) {
  // Eine neue Ebene startet unsichtbar: kein Aufblitzen im ersten Frame.
  const t = useSharedValue(fadeIn ? 0 : 1);
  useEffect(() => {
    if (!fadeIn) return;
    t.value = withTiming(1, { duration: FADE_MS, easing: Easing.inOut(Easing.quad) }, (done) => {
      if (done) scheduleOnRN(onDone);
    });
  }, [t, fadeIn, onDone]);
  const style = useAnimatedStyle(() => ({ opacity: t.value }));
  return (
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, style]}>
      {children}
    </Animated.View>
  );
}

/**
 * Blendet zwischen Tag- und Nachtbild über (ART-4). Beide Bilder sind still; nur während der
 * Überblendung liegen zwei übereinander. Die neue Ebene bleibt danach dieselbe (kein Neuzeichnen).
 */
export function DayNightFade({ isDay, render }: { isDay: boolean; render: (isDay: boolean) => ReactNode }) {
  const [shown, setShown] = useState(isDay);
  // Stabil, solange isDay gleich bleibt: sonst startet jeder Uhr-Tick die Überblendung neu.
  const finish = useCallback(() => setShown(isDay), [isDay]);
  const modes = shown === isDay ? [isDay] : [shown, isDay];
  return (
    <>
      {modes.map((mode) => (
        <Layer key={String(mode)} fadeIn={mode !== shown} onDone={finish}>
          {render(mode)}
        </Layer>
      ))}
    </>
  );
}
