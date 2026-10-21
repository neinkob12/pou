import { useCallback, useState } from 'react';
import { Animated, Platform } from 'react-native';

import { pressScale, springs } from '../../../lib/theme';

interface PressSpringOptions {
  /** Wie weit die Fläche beim Drücken einsinkt (Tiefe der Kante). */
  sink: number;
  disabled?: boolean;
  /** Ohne Klick-Klang und Vibration, etwa für sehr häufige Knöpfe. */
  quiet?: boolean;
}

/**
 * Klick und Vibration. lib/audio (expo-audio) erst beim ersten Tippen laden: Knöpfe stecken in
 * fast jedem Screen, und ein Import soll (auch in Tests) kein Audio-Modul mitziehen.
 */
function playTap() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports -- verzögertes Laden, siehe oben
  const { cue } = require('../../../lib/audio') as typeof import('../../../lib/audio');
  cue('tap');
}

/** Im Web gibt es keinen nativen Treiber; dort rechnet JS die Feder. */
const NATIVE_DRIVER = Platform.OS !== 'web';

function spring(value: Animated.Value, toValue: number, config: { damping: number; stiffness: number; mass: number }) {
  return Animated.spring(value, { toValue, ...config, useNativeDriver: NATIVE_DRIVER });
}

/**
 * Federung für alles, was man drückt: beim Drücken sinkt die Fläche ein und staucht (Squash),
 * beim Loslassen federt sie mit Überschwingen zurück (Stretch). Dazu Klick und Vibration aus
 * lib/audio (respektiert die Einstellungen).
 *
 * Bewusst mit dem eingebauten Animated statt Reanimated: Knöpfe und Karten stecken in fast jedem
 * Screen, und so zieht ein Import (auch in Tests) keine Worklets mit.
 */
export function usePressSpring({ sink, disabled = false, quiet = false }: PressSpringOptions) {
  const [pressed] = useState(() => new Animated.Value(0));
  const [scale] = useState(() => new Animated.Value(1));

  const onPressIn = useCallback(() => {
    if (disabled) return;
    Animated.parallel([spring(pressed, 1, springs.press), spring(scale, pressScale.down, springs.press)]).start();
    if (!quiet) playTap();
  }, [disabled, quiet, pressed, scale]);

  const onPressOut = useCallback(() => {
    Animated.parallel([
      spring(pressed, 0, springs.release),
      Animated.sequence([spring(scale, pressScale.up, springs.press), spring(scale, 1, springs.release)]),
    ]).start();
  }, [pressed, scale]);

  const outerStyle = { transform: [{ scale }] };
  const faceStyle = { transform: [{ translateY: pressed.interpolate({ inputRange: [0, 1], outputRange: [0, sink] }) }] };

  return { onPressIn, onPressOut, outerStyle, faceStyle };
}
