import { useEffect } from 'react';
import {
  cancelAnimation,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
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
/** Im Schlaf atmet Budi langsamer und tiefer. */
const SLEEP_BREATH_MS = 2600;
const SLEEP_BREATH_SCALE = 0.04;
const SWAY_MS = 2600;
const SWAY_DEG = 2.5;
/** Pausen zwischen zwei Blinzlern, im Wechsel, damit es nicht mechanisch wirkt. */
const BLINK_PAUSES_MS = [3200, 4700, 2100, 5200] as const;
const BLINK_HALF_MS = 70;
/** Ab und zu schaut Budi kurz zur Seite (Leinwand-Einheiten). */
const GAZE_PAUSES_MS = [5200, 7800, 6100] as const;
const GAZE_OFFSETS = [-1.4, 1.4, 0] as const;
const GAZE_MS = 260;
/** Budi wird größer, wenn ein Werkzeug über ihm schwebt ("Mund auf"). */
const HOVER_SCALE = 0.08;
const SQUASH = { x: 1.18, y: 0.82 };
const STRETCH = { x: 0.9, y: 1.14 };
const SQUASH_MS = 90;
const SHAKE_PX = 8;
const SHAKE_MS = 60;
/** Streicheln: Budi wackelt vor Freude hin und her. */
const WIGGLE_DEG = 6;
const WIGGLE_MS = 110;

interface BudiMotion {
  bodyStyle: ReturnType<typeof useAnimatedStyle>;
  plantStyle: ReturnType<typeof useAnimatedStyle>;
  /** Augen-Ebene: Blinzeln (scaleY) und Blick zur Seite. */
  eyeStyle: ReturnType<typeof useAnimatedStyle>;
}

/**
 * Blinzeln und Blick per Timer statt Dauer-Animation: Es läuft nur etwas, wenn sich die Augen
 * wirklich bewegen. Das hält den Browser bei 60 fps.
 */
function useEyeLife(active: boolean): { lid: SharedValue<number>; gaze: SharedValue<number> } {
  const lid = useSharedValue(1);
  const gaze = useSharedValue(0);
  useEffect(() => {
    if (!active) {
      lid.value = 1;
      gaze.value = withTiming(0, { duration: GAZE_MS });
      return;
    }
    let blinkIndex = 0;
    let gazeIndex = 0;
    let blinkTimer: ReturnType<typeof setTimeout>;
    let gazeTimer: ReturnType<typeof setTimeout>;
    const blink = () => {
      lid.value = withSequence(
        withTiming(0, { duration: BLINK_HALF_MS }),
        withTiming(1, { duration: BLINK_HALF_MS }),
      );
      blinkIndex = (blinkIndex + 1) % BLINK_PAUSES_MS.length;
      blinkTimer = setTimeout(blink, BLINK_PAUSES_MS[blinkIndex]);
    };
    const look = () => {
      gaze.value = withTiming(GAZE_OFFSETS[gazeIndex], { duration: GAZE_MS });
      gazeIndex = (gazeIndex + 1) % GAZE_OFFSETS.length;
      gazeTimer = setTimeout(look, GAZE_PAUSES_MS[gazeIndex]);
    };
    blinkTimer = setTimeout(blink, BLINK_PAUSES_MS[0]);
    gazeTimer = setTimeout(look, GAZE_PAUSES_MS[0]);
    return () => {
      clearTimeout(blinkTimer);
      clearTimeout(gazeTimer);
    };
  }, [active, lid, gaze]);
  return { lid, gaze };
}

/**
 * Idle (Atmen, Wippen der Pflanze, Blinzeln, Blick) und Reaktionen (Squash-and-Stretch bei Erfolg,
 * Wackeln beim Streicheln, Kopfschütteln bei Warnung). `idle = false` hält Budi still (Koma, geerntet).
 */
export function useBudiMotion(
  idle: boolean,
  eyesOpen: boolean,
  asleep: boolean,
  reaction: CareReaction | null,
  hovering: SharedValue<number>,
  size: number,
): BudiMotion {
  const breath = useSharedValue(0);
  const sway = useSharedValue(0);
  const squashX = useSharedValue(1);
  const squashY = useSharedValue(1);
  const shake = useSharedValue(0);
  const wiggle = useSharedValue(0);

  useEffect(() => {
    if (!idle) {
      cancelAnimation(breath);
      cancelAnimation(sway);
      breath.value = withTiming(0);
      sway.value = withTiming(0);
      return;
    }
    breath.value = 0;
    breath.value = withRepeat(withTiming(1, { duration: asleep ? SLEEP_BREATH_MS : BREATH_MS }), -1, true);
    sway.value = withSequence(
      withTiming(-1, { duration: SWAY_MS / 2 }),
      withRepeat(withTiming(1, { duration: SWAY_MS }), -1, true),
    );
  }, [idle, asleep, breath, sway]);

  const { lid, gaze } = useEyeLife(idle && eyesOpen);

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
      if (reaction.type === 'pet') {
        wiggle.value = withSequence(
          withTiming(-1, { duration: WIGGLE_MS }),
          withTiming(1, { duration: WIGGLE_MS * 2 }),
          withTiming(-1, { duration: WIGGLE_MS * 2 }),
          withSpring(0),
        );
      }
    } else {
      shake.value = withSequence(
        withTiming(SHAKE_PX, { duration: SHAKE_MS }),
        withTiming(-SHAKE_PX, { duration: SHAKE_MS }),
        withTiming(SHAKE_PX, { duration: SHAKE_MS }),
        withTiming(0, { duration: SHAKE_MS }),
      );
    }
  }, [reaction, squashX, squashY, shake, wiggle]);

  const hover = useDerivedValue(() => withSpring(hovering.get()));
  const breathScale = asleep ? SLEEP_BREATH_SCALE : BREATH_SCALE;

  const bodyStyle = useAnimatedStyle(() => {
    const grow = 1 + hover.value * HOVER_SCALE;
    return {
      transform: [
        { translateX: shake.value },
        { rotate: `${wiggle.value * WIGGLE_DEG}deg` },
        { scaleX: squashX.value * grow * (1 + breath.value * breathScale * 0.4) },
        { scaleY: squashY.value * grow * (1 + breath.value * breathScale) },
      ],
    };
  });
  const plantStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${sway.value * SWAY_DEG}deg` }] }));

  const eyeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: (gaze.value * size) / 100 }, { scaleY: Math.max(0.08, lid.value) }],
  }));

  return { bodyStyle, plantStyle, eyeStyle };
}
