import { useEffect } from 'react';
import {
  cancelAnimation,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

import type { CareReaction } from '../room/care/CareStage';

// Bewegungswerte sind UI-Konstanten, keine Balancing-Werte.
const BREATH_MS = 1800;
const BREATH_SCALE = 0.025;
const SWAY_MS = 2600;
const SWAY_DEG = 2.5;
/** Zwei Pausen im Wechsel, damit das Blinzeln nicht mechanisch wirkt. */
const BLINK_PAUSES_MS = [3200, 4700] as const;
const BLINK_MS = 140;
/** Budi wird größer, wenn ein Werkzeug über ihm schwebt ("Mund auf"). */
const HOVER_SCALE = 0.08;
const SQUASH = { x: 1.18, y: 0.82 };
const STRETCH = { x: 0.9, y: 1.14 };
const SQUASH_MS = 90;
const SHAKE_PX = 8;
const SHAKE_MS = 60;

const instant = { duration: 0 };

interface BudiMotion {
  bodyStyle: ReturnType<typeof useAnimatedStyle>;
  plantStyle: ReturnType<typeof useAnimatedStyle>;
  faceStyle: ReturnType<typeof useAnimatedStyle>;
  blinkStyle: ReturnType<typeof useAnimatedStyle>;
}

/**
 * Idle (Atmen, Wippen der Pflanze, Blinzeln) und Reaktionen (Squash-and-Stretch bei Erfolg,
 * Kopfschütteln bei Warnung). `idle = false` hält Budi still (Koma, geerntet).
 */
export function useBudiMotion(
  idle: boolean,
  blink: boolean,
  reaction: CareReaction | null,
  hovering: SharedValue<number>,
): BudiMotion {
  const breath = useSharedValue(0);
  const sway = useSharedValue(0);
  const blinkT = useSharedValue(0);
  const squashX = useSharedValue(1);
  const squashY = useSharedValue(1);
  const shake = useSharedValue(0);

  useEffect(() => {
    if (!idle) {
      cancelAnimation(breath);
      cancelAnimation(sway);
      breath.value = withTiming(0);
      sway.value = withTiming(0);
      return;
    }
    breath.value = withRepeat(withTiming(1, { duration: BREATH_MS }), -1, true);
    sway.value = withSequence(
      withTiming(-1, { duration: SWAY_MS / 2 }),
      withRepeat(withTiming(1, { duration: SWAY_MS }), -1, true),
    );
  }, [idle, breath, sway]);

  useEffect(() => {
    if (!blink) {
      cancelAnimation(blinkT);
      blinkT.value = 0;
      return;
    }
    const once = (pause: number) =>
      withSequence(withDelay(pause, withTiming(1, instant)), withDelay(BLINK_MS, withTiming(0, instant)));
    blinkT.value = withRepeat(withSequence(once(BLINK_PAUSES_MS[0]), once(BLINK_PAUSES_MS[1])), -1);
  }, [blink, blinkT]);

  useEffect(() => {
    if (!reaction || reaction.feedback === 'error') return;
    if (reaction.feedback === 'success') {
      squashX.value = withSequence(
        withTiming(SQUASH.x, { duration: SQUASH_MS }),
        withTiming(STRETCH.x, { duration: SQUASH_MS }),
        withSpring(1),
      );
      squashY.value = withSequence(
        withTiming(SQUASH.y, { duration: SQUASH_MS }),
        withTiming(STRETCH.y, { duration: SQUASH_MS }),
        withSpring(1),
      );
    } else {
      shake.value = withSequence(
        withTiming(SHAKE_PX, { duration: SHAKE_MS }),
        withTiming(-SHAKE_PX, { duration: SHAKE_MS }),
        withTiming(SHAKE_PX, { duration: SHAKE_MS }),
        withTiming(0, { duration: SHAKE_MS }),
      );
    }
  }, [reaction, squashX, squashY, shake]);

  const hover = useDerivedValue(() => withSpring(hovering.get()));

  const bodyStyle = useAnimatedStyle(() => {
    const grow = 1 + hover.value * HOVER_SCALE;
    return {
      transform: [
        { translateX: shake.value },
        { scaleX: squashX.value * grow },
        { scaleY: squashY.value * grow * (1 + breath.value * BREATH_SCALE) },
      ],
    };
  });
  const plantStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${sway.value * SWAY_DEG}deg` }] }));
  const faceStyle = useAnimatedStyle(() => ({ opacity: 1 - blinkT.value }));
  const blinkStyle = useAnimatedStyle(() => ({ opacity: blinkT.value }));

  return { bodyStyle, plantStyle, faceStyle, blinkStyle };
}
