// Budis Bewegungen als Folgen von Federn und Zeitkurven (ART-3). Jede Funktion setzt nur Shared
// Values; gerechnet wird im UI-Thread, React rendert dabei nichts neu (60 fps, auch im Browser).

import {
  Easing,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

import type { ReactionMotion, SleepTransition } from '../budiMood';
import * as M from './constants';

/** Alle beweglichen Teile von Budi. Ruhewerte: 0 für Versatz und Winkel, 1 für Maßstab. */
export interface BudiBody {
  /** Sprung nach oben in Punkten (negativ = oben). */
  hop: SharedValue<number>;
  sqX: SharedValue<number>;
  sqY: SharedValue<number>;
  /** Neigung, 1 = TILT_DEG. */
  tilt: SharedValue<number>;
  /** Seitlicher Versatz in Punkten (Zittern, Kopfschütteln). */
  shift: SharedValue<number>;
  /** Nachfedern der Pflanze (Follow-through), -1 bis 1. */
  plant: SharedValue<number>;
  /** Mund-Maßstab (Kauen, Schlucken, Gähnen, Ploppen). */
  mouthX: SharedValue<number>;
  mouthY: SharedValue<number>;
  /** Herzklopfen der Augen. */
  pulse: SharedValue<number>;
  /** Lid: 1 offen, 0 zu. */
  lid: SharedValue<number>;
  gazeX: SharedValue<number>;
  gazeY: SharedValue<number>;
}

const ease = (duration: number) => ({ duration, easing: Easing.inOut(Easing.quad) });
const up = (duration: number) => ({ duration, easing: Easing.out(Easing.quad) });
const down = (duration: number) => ({ duration, easing: Easing.in(Easing.quad) });

/** Pflanze federt nach (schwingt nach, während der Topf schon steht). */
function kickPlant(b: BudiBody, side = 1) {
  b.plant.value = withSequence(withTiming(side, { duration: 90 }), withSpring(0, M.WOBBLY));
}

/** Freude-Hüpfer: ausholen (Squash), abspringen (Stretch), landen (Squash), nachfedern. */
export function joyHop(b: BudiBody, size: number, height = M.HOP_HEIGHT, delay = 0) {
  const h = -size * height;
  const air = M.RISE_MS + M.FALL_MS;
  const squash = (v: { x: number; y: number }, key: 'x' | 'y') => v[key];
  for (const key of ['x', 'y'] as const) {
    const sv = key === 'x' ? b.sqX : b.sqY;
    sv.value = withDelay(
      delay,
      withSequence(
        withTiming(squash(M.SQUASH, key), down(M.ANTICIPATION_MS)),
        withTiming(squash(M.STRETCH, key), up(M.RISE_MS * 0.6)),
        withTiming(1, ease(M.RISE_MS * 0.4 + M.FALL_MS * 0.5)),
        withTiming(squash(M.STRETCH, key) * 0.5 + 0.5, down(M.FALL_MS * 0.5)),
        withTiming(squash(M.LAND, key), down(M.LAND_MS)),
        withSpring(1, M.BOUNCY),
      ),
    );
  }
  b.hop.value = withDelay(
    delay + M.ANTICIPATION_MS,
    withSequence(withTiming(h, up(M.RISE_MS)), withTiming(0, down(M.FALL_MS))),
  );
  b.plant.value = withDelay(delay + M.ANTICIPATION_MS + air, withSequence(withTiming(1, { duration: 80 }), withSpring(0, M.WOBBLY)));
}

/** Gestreichelt: wohlig hin und her schaukeln, Pflanze schwingt mit. */
function wiggle(b: BudiBody) {
  b.tilt.value = withSequence(
    withTiming(-1, ease(130)),
    withTiming(1, ease(240)),
    withTiming(-0.7, ease(220)),
    withSpring(0, M.BOUNCY),
  );
  b.sqY.value = withSequence(withTiming(0.92, ease(130)), withSpring(1, M.BOUNCY));
  b.sqX.value = withSequence(withTiming(1.08, ease(130)), withSpring(1, M.BOUNCY));
  kickPlant(b, -1);
}

/** Gekitzelt: schnelles Zittern und Zappeln, wie Lachen. */
function tickle(b: BudiBody, size: number) {
  const s = size * M.SHAKE;
  b.shift.value = withSequence(withRepeat(withSequence(withTiming(s, { duration: 45 }), withTiming(-s, { duration: 45 })), 5), withSpring(0, M.BOUNCY));
  b.tilt.value = withSequence(withRepeat(withSequence(withTiming(0.5, { duration: 90 }), withTiming(-0.5, { duration: 90 })), 3), withSpring(0, M.BOUNCY));
  b.sqY.value = withSequence(withRepeat(withSequence(withTiming(0.9, { duration: 70 }), withTiming(1.06, { duration: 70 })), 3), withSpring(1, M.BOUNCY));
  b.sqX.value = withSequence(withRepeat(withSequence(withTiming(1.08, { duration: 70 }), withTiming(0.96, { duration: 70 })), 3), withSpring(1, M.BOUNCY));
  kickPlant(b);
}

/** Verliebt: Herzaugen klopfen, Budi schmiegt sich langsam zur Seite und hüpft klein. */
function love(b: BudiBody, size: number) {
  const beat = withSequence(withTiming(1 + M.HEARTBEAT, up(M.HEARTBEAT_MS)), withTiming(1, down(M.HEARTBEAT_MS)));
  b.pulse.value = withSequence(beat, withTiming(1, { duration: 90 }), beat, withTiming(1, { duration: 300 }), beat, beat);
  b.tilt.value = withSequence(withTiming(0.8, ease(420)), withTiming(-0.5, ease(520)), withSpring(0, M.SOFT));
  joyHop(b, size, M.SMALL_HOP_HEIGHT, 900);
}

/** Gegossen: dreimal schlucken (Mund und Körper), dann ein Freude-Hüpfer. */
function gulp(b: BudiBody, size: number) {
  const g = withSequence(withTiming(0.55, down(M.GULP_MS)), withTiming(1.15, up(M.GULP_MS)));
  b.mouthY.value = withSequence(withRepeat(g, M.GULPS), withSpring(1, M.BOUNCY));
  const stretch = M.GULP_MS * 2 * M.GULPS;
  b.sqY.value = withSequence(withTiming(1.08, ease(stretch)), withTiming(1, ease(120)));
  b.sqX.value = withSequence(withTiming(0.95, ease(stretch)), withTiming(1, ease(120)));
  joyHop(b, size, M.HOP_HEIGHT, stretch + 120);
}

/** Gedüngt: mampfen (Mund kaut, Körper wippt mit), dann ein kleiner Hüpfer. */
function chomp(b: BudiBody, size: number) {
  const chew = withSequence(withTiming(0.5, down(M.CHEW_MS)), withTiming(1.12, up(M.CHEW_MS)));
  b.mouthY.value = withSequence(withRepeat(chew, M.CHEWS), withSpring(1, M.BOUNCY));
  b.mouthX.value = withSequence(withRepeat(withSequence(withTiming(1.18, { duration: M.CHEW_MS }), withTiming(0.95, { duration: M.CHEW_MS })), M.CHEWS), withSpring(1, M.BOUNCY));
  const bob = withSequence(withTiming(0.95, { duration: M.CHEW_MS }), withTiming(1.03, { duration: M.CHEW_MS }));
  b.sqY.value = withSequence(withRepeat(bob, M.CHEWS), withSpring(1, M.BOUNCY));
  joyHop(b, size, M.SMALL_HOP_HEIGHT, M.CHEW_MS * 2 * M.CHEWS);
}

/** Zu viel des Guten: schmollen. Duckt sich, dreht sich weg, schüttelt den Kopf, federt zurück. */
function pout(b: BudiBody, size: number) {
  const s = size * M.SHAKE;
  b.sqY.value = withSequence(withTiming(0.9, ease(160)), withDelay(700, withSpring(1, M.SOFT)));
  b.sqX.value = withSequence(withTiming(1.06, ease(160)), withDelay(700, withSpring(1, M.SOFT)));
  b.tilt.value = withSequence(withTiming(-0.9, ease(200)), withDelay(500, withSpring(0, M.SOFT)));
  b.shift.value = withSequence(
    withTiming(s, { duration: 70 }),
    withTiming(-s, { duration: 70 }),
    withTiming(s, { duration: 70 }),
    withTiming(-s * 0.5, { duration: 70 }),
    withSpring(0, M.BOUNCY),
  );
  b.mouthX.value = withSequence(withTiming(0.8, ease(160)), withDelay(700, withSpring(1, M.BOUNCY)));
}

export function playReaction(b: BudiBody, motion: ReactionMotion, size: number) {
  switch (motion) {
    case 'wiggle':
      return wiggle(b);
    case 'tickle':
      return tickle(b, size);
    case 'love':
      return love(b, size);
    case 'gulp':
      return gulp(b, size);
    case 'chomp':
      return chomp(b, size);
    case 'pout':
      return pout(b, size);
  }
}

/** Aufwachen (oder Licht geht an): langes Strecken, Gähnen, kurzes Schütteln, nachfedern. */
function wake(b: BudiBody, size: number) {
  const s = size * M.SHAKE * 0.6;
  b.sqY.value = withSequence(withTiming(M.WAKE_STRETCH.y, ease(M.STRETCH_MS)), withDelay(M.STRETCH_HOLD_MS, withSpring(1, M.BOUNCY)));
  b.sqX.value = withSequence(withTiming(M.WAKE_STRETCH.x, ease(M.STRETCH_MS)), withDelay(M.STRETCH_HOLD_MS, withSpring(1, M.BOUNCY)));
  b.mouthY.value = withSequence(withTiming(1.35, ease(M.STRETCH_MS)), withDelay(M.STRETCH_HOLD_MS, withSpring(1, M.SOFT)));
  b.shift.value = withDelay(
    M.STRETCH_MS + M.STRETCH_HOLD_MS + 120,
    withSequence(withRepeat(withSequence(withTiming(s, { duration: 50 }), withTiming(-s, { duration: 50 })), 3), withSpring(0, M.BOUNCY)),
  );
  b.plant.value = withDelay(M.STRETCH_MS + M.STRETCH_HOLD_MS, withSequence(withTiming(-1, { duration: 90 }), withSpring(0, M.WOBBLY)));
}

/** Einschlafen: gähnen, langsam einsacken, Kopf nickt weg. */
function doze(b: BudiBody) {
  b.mouthY.value = withSequence(withTiming(1.3, ease(500)), withSpring(1, M.SOFT));
  b.sqY.value = withSequence(withTiming(1.06, ease(400)), withTiming(M.DOZE.y, ease(M.DOZE_MS)), withSpring(1, M.SOFT));
  b.sqX.value = withSequence(withTiming(0.97, ease(400)), withTiming(M.DOZE.x, ease(M.DOZE_MS)), withSpring(1, M.SOFT));
  b.tilt.value = withSequence(withDelay(400, withTiming(0.5, ease(M.DOZE_MS))), withSpring(0, M.SOFT));
}

export function playSleepTransition(b: BudiBody, transition: SleepTransition, size: number) {
  if (transition === 'wakeUp') wake(b, size);
  else doze(b);
}

/** Mimikwechsel: Mund ploppt mit Overshoot auf, Augen zwinkern einmal durch. */
export function popFace(b: BudiBody, blink: boolean) {
  b.mouthX.value = withSequence(withTiming(0.6, { duration: 60 }), withSpring(1, M.BOUNCY));
  b.mouthY.value = withSequence(withTiming(0.4, { duration: 60 }), withSpring(1, M.BOUNCY));
  if (blink) b.lid.value = withSequence(withTiming(0.1, { duration: M.BLINK_HALF_MS }), withSpring(1, M.BOUNCY));
}

/** Kopf neugierig zur Seite neigen, mit Nachfedern. */
export function curiousTilt(b: BudiBody, side: number) {
  b.tilt.value = withSequence(withTiming(side * 0.7, ease(260)), withDelay(600, withSpring(0, M.BOUNCY)));
  kickPlant(b, side);
}

/** Umschauen: links, rechts, zurück; der Körper neigt sich leicht mit. */
export function lookAround(b: BudiBody) {
  const hold = (v: number) => withSequence(withTiming(v, ease(M.GAZE_MS)), withDelay(M.GAZE_HOLD_MS, withTiming(v, { duration: 0 })));
  b.gazeX.value = withSequence(hold(-M.GAZE_X), hold(M.GAZE_X), withTiming(0, ease(M.GAZE_MS)));
  b.gazeY.value = withSequence(hold(-M.GAZE_Y), hold(-M.GAZE_Y * 0.3), withTiming(0, ease(M.GAZE_MS)));
  b.tilt.value = withSequence(hold(-0.25), hold(0.25), withSpring(0, M.SOFT));
}

/** Einmal blinzeln. */
export function blink(b: BudiBody) {
  b.lid.value = withSequence(withTiming(0, { duration: M.BLINK_HALF_MS }), withTiming(1, { duration: M.BLINK_HALF_MS }));
}
