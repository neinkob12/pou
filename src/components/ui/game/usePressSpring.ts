import { useCallback } from 'react';
import { useAnimatedStyle, useSharedValue, withSequence, withSpring } from 'react-native-reanimated';

import { cue } from '../../../lib/audio';
import { pressScale, springs } from '../../../lib/theme';

interface PressSpringOptions {
  /** Wie weit die Fläche beim Drücken einsinkt (Tiefe der Kante). */
  sink: number;
  disabled?: boolean;
  /** Ohne Klick-Klang und Vibration, etwa für sehr häufige Knöpfe. */
  quiet?: boolean;
}

/**
 * Federung für alles, was man drückt: beim Drücken sinkt die Fläche ein und staucht (Squash),
 * beim Loslassen federt sie mit Überschwingen zurück (Stretch). Dazu Klick und Vibration aus
 * lib/audio (respektiert die Einstellungen).
 */
export function usePressSpring({ sink, disabled = false, quiet = false }: PressSpringOptions) {
  const pressed = useSharedValue(0);
  const scale = useSharedValue(1);

  const onPressIn = useCallback(() => {
    if (disabled) return;
    pressed.set(withSpring(1, springs.press));
    scale.set(withSpring(pressScale.down, springs.press));
    if (!quiet) cue('tap');
  }, [disabled, quiet, pressed, scale]);

  const onPressOut = useCallback(() => {
    pressed.set(withSpring(0, springs.release));
    scale.set(withSequence(withSpring(pressScale.up, springs.press), withSpring(1, springs.release)));
  }, [pressed, scale]);

  const outerStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const faceStyle = useAnimatedStyle(() => ({ transform: [{ translateY: pressed.value * sink }] }));

  return { onPressIn, onPressOut, outerStyle, faceStyle };
}
