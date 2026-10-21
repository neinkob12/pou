// Start-Countdown (Auftrag 40, Auftrag 51): jede Zahl knallt mit Überschwingen und leichter Drehung
// auf, dahinter läuft ein Ring nach außen; "Los!" springt größer auf und fliegt weg.

import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { minigameFeel } from '../../../content/strings';
import { MINIGAME_FEEL } from '../../../game/config';
import { springs } from '../../../lib/theme';
import { sparks, tones } from './art/palette';
import { Overlay } from './Overlay';
import type { MinigamePhase } from './session';
import { StrokeText } from './StrokeText';

/** Farbe je Zahl: 3 Koralle, 2 Gold, 1 Grün. */
const COLORS: Record<number, string> = { 3: tones.coral.base, 2: tones.gold.base, 1: tones.leaf.base };

function Burst({ text, color, size }: { text: string; color: string; size: number }) {
  const scale = useSharedValue(0.2);
  const spin = useSharedValue(-14);
  const ring = useSharedValue(0);
  useEffect(() => {
    scale.set(withSequence(withTiming(1.3, { duration: 130, easing: Easing.out(Easing.quad) }), withSpring(1, springs.pop)));
    spin.set(withSpring(0, springs.release));
    ring.set(withTiming(1, { duration: 650, easing: Easing.out(Easing.cubic) }));
  }, [ring, scale, spin, text]);
  const textStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.get() }, { rotate: `${spin.get()}deg` }] }));
  const ringStyle = useAnimatedStyle(() => ({
    opacity: 0.8 * (1 - ring.get()),
    transform: [{ scale: 0.4 + ring.get() * 1.6 }],
  }));
  return (
    <View style={styles.center}>
      <Animated.View style={[styles.ring, { borderColor: color }, ringStyle]} />
      <Animated.View style={textStyle}>
        <StrokeText size={size} color={color}>
          {text}
        </StrokeText>
      </Animated.View>
    </View>
  );
}

/** Großer Start-Countdown (3, 2, 1) über dem Spielfeld. */
export function CountdownOverlay({ value }: { value: number }) {
  return (
    <Overlay card={false}>
      <Burst key={value} text={String(value)} color={COLORS[value] ?? sparks.white} size={112} />
    </Overlay>
  );
}

/** "Los!" kurz nach dem Countdown: springt auf und fliegt nach oben weg. Einmal je Runde. */
export function GoFlash({ phase }: { phase: MinigamePhase }) {
  const [visible, setVisible] = useState(false);
  const shown = useRef(false);
  const lift = useSharedValue(0);
  useEffect(() => {
    if (phase !== 'playing' || shown.current) return;
    shown.current = true;
    setVisible(true);
    lift.set(withDelay(MINIGAME_FEEL.goFlashMs * 0.6, withTiming(1, { duration: MINIGAME_FEEL.goFlashMs * 0.4 })));
    const timer = setTimeout(() => setVisible(false), MINIGAME_FEEL.goFlashMs);
    return () => clearTimeout(timer);
  }, [lift, phase]);
  const style = useAnimatedStyle(() => ({
    opacity: 1 - lift.get(),
    transform: [{ translateY: -60 * lift.get() }, { scale: 1 + lift.get() * 0.3 }],
  }));
  if (!visible) return null;
  return (
    <Overlay card={false} passThrough>
      <Animated.View style={style}>
        <Burst text={minigameFeel.go} color={tones.gold.light} size={96} />
      </Animated.View>
    </Overlay>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
  ring: { position: 'absolute', width: 160, height: 160, borderRadius: 80, borderWidth: 10 },
});
