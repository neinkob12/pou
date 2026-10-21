import { useEffect, useMemo, useRef } from 'react';
import { useAnimatedStyle, useDerivedValue, useSharedValue, withSpring, type SharedValue } from 'react-native-reanimated';

import type { Condition } from '../../game/needs';
import type { BudiFace } from './budiLook';
import type { BudiLookState } from './useBudiLook';
import * as M from './motion/constants';
import { playReaction, playSleepTransition, popFace, type BudiBody } from './motion/moves';
import { useBreathAndSway, useIdleLife } from './motion/useIdleLife';

type Style = ReturnType<typeof useAnimatedStyle>;

interface BudiMotion {
  /** Schatten am Boden: wird kleiner und blasser, wenn Budi abhebt. */
  shadowStyle: Style;
  /** Ganzer Budi: Hüpfen, Squash & Stretch, Neigen, Zittern, Atmen, Wachsen beim Schweben. */
  bodyStyle: Style;
  /** Pflanze: Wippen im Wind und Nachfedern (Follow-through). */
  plantStyle: Style;
  /** Augen: Blinzeln und Herzklopfen. */
  eyeStyle: Style;
  /** Iris: Umschauen. */
  pupilStyle: Style;
  /** Mund: Kauen, Schlucken, Gähnen, Ploppen. */
  mouthStyle: Style;
}

function useBody(): BudiBody {
  const hop = useSharedValue(0);
  const sqX = useSharedValue(1);
  const sqY = useSharedValue(1);
  const tilt = useSharedValue(0);
  const shift = useSharedValue(0);
  const plant = useSharedValue(0);
  const mouthX = useSharedValue(1);
  const mouthY = useSharedValue(1);
  const pulse = useSharedValue(1);
  const lid = useSharedValue(1);
  const gazeX = useSharedValue(0);
  const gazeY = useSharedValue(0);
  return useMemo(
    () => ({ hop, sqX, sqY, tilt, shift, plant, mouthX, mouthY, pulse, lid, gazeX, gazeY }),
    [hop, sqX, sqY, tilt, shift, plant, mouthX, mouthY, pulse, lid, gazeX, gazeY],
  );
}

/** Spielt `play`, sobald sich die `id` ändert (nicht beim ersten Rendern). */
function useOnNewId(id: number | null, play: () => void) {
  const last = useRef(id);
  useEffect(() => {
    if (id === null || id === last.current) return;
    last.current = id;
    play();
    // play hängt nur an der id; neue Funktion bei jedem Rendern soll nichts auslösen.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);
}

export interface BudiMotionInput {
  look: Pick<BudiLookState, 'motion' | 'sleep'>;
  face: BudiFace | null;
  /** false hält Budi still (Koma, geerntet). */
  idle: boolean;
  eyesOpen: boolean;
  asleep: boolean;
  condition: Condition | null;
  hovering: SharedValue<number>;
  size: number;
}

/**
 * Budis Leben (ART-3): Idle (Atmen, Wippen, Blinzeln, Umschauen, Kopf neigen, Hüpfer), Reaktionen
 * auf Pflege (Streicheln, Kitzeln, Verliebt, Gießen, Düngen, Schmollen), Einschlafen und Aufwachen.
 * Alles als Transform im UI-Thread, mit Squash & Stretch und Nachfedern.
 */
export function useBudiMotion({ look, face, idle, eyesOpen, asleep, condition, hovering, size }: BudiMotionInput): BudiMotion {
  const body = useBody();
  const { breath, sway } = useBreathAndSway(idle, asleep);
  useIdleLife(body, idle && eyesOpen, idle && !asleep, condition, size, look.motion?.id ?? 0);

  useOnNewId(look.motion?.id ?? null, () => {
    if (look.motion && idle) playReaction(body, look.motion.kind, size);
  });
  useOnNewId(look.sleep?.id ?? null, () => {
    if (look.sleep && idle) playSleepTransition(body, look.sleep.kind, size);
  });
  // Mimikwechsel: weicher Übergang statt hartem Sprung.
  const faceKey = face ?? '';
  const lastFace = useRef(faceKey);
  useEffect(() => {
    if (lastFace.current === faceKey) return;
    lastFace.current = faceKey;
    if (idle) popFace(body, eyesOpen);
  }, [faceKey, idle, eyesOpen, body]);

  const hover = useDerivedValue(() => withSpring(hovering.get(), M.BOUNCY));
  const breathScale = asleep ? M.SLEEP_BREATH_SCALE : M.BREATH_SCALE;
  const lift = size * M.HOP_HEIGHT;

  const shadowStyle = useAnimatedStyle(() => {
    const air = Math.min(1, -body.hop.value / lift);
    return { opacity: 1 - air * 0.55, transform: [{ scaleX: (1 - air * 0.35) * body.sqX.value }, { scaleY: 1 - air * 0.35 }] };
  });
  const bodyStyle = useAnimatedStyle(() => {
    const grow = 1 + hover.value * M.HOVER_SCALE;
    const b = breath.value * breathScale;
    return {
      transform: [
        { translateY: body.hop.value },
        { translateX: body.shift.value },
        { rotate: `${body.tilt.value * M.TILT_DEG}deg` },
        { scaleX: body.sqX.value * grow * (1 - b * 0.4) },
        { scaleY: body.sqY.value * grow * (1 + b) },
      ],
    };
  });
  const plantStyle = useAnimatedStyle(() => {
    const kick = body.plant.value;
    return {
      transform: [
        { rotate: `${sway.value * M.SWAY_DEG + kick * M.PLANT_KICK_DEG}deg` },
        { scaleY: 1 - Math.abs(kick) * M.PLANT_KICK_SCALE },
        { scaleX: 1 + Math.abs(kick) * M.PLANT_KICK_SCALE * 0.5 },
      ],
    };
  });
  const eyeStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: body.pulse.value }, { scaleY: Math.max(0.08, body.lid.value) * body.pulse.value }],
  }));
  const pupilStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: (body.gazeX.value * size) / 100 }, { translateY: (body.gazeY.value * size) / 100 }],
  }));
  const mouthStyle = useAnimatedStyle(() => ({ transform: [{ scaleX: body.mouthX.value }, { scaleY: body.mouthY.value }] }));

  return { shadowStyle, bodyStyle, plantStyle, eyeStyle, pupilStyle, mouthStyle };
}
