// Budis Mimiken als Bauplan (ART-3): welche Augen, welcher Mund, welche Extras. Ohne React und
// ohne Skia, damit testbar. Koordinaten auf der Budi-Leinwand 100 × 100. Nur Grafik.

import type { BudiFace } from '../budiLook';

/** Augenhöhe: um diese Linie klappen die Lider (useBudiMotion). */
export const EYE_Y = 79;
export const EYE_X = [38.5, 61.5] as const;
export const EYE_RX = 6.6;
export const EYE_RY = 7.6;
/** Mundmitte: um diesen Punkt kaut, gähnt und ploppt der Mund. */
export const MOUTH_Y = 90.5;
export const CHEEK_Y = 88.5;
export const CHEEK_X = [27, 73] as const;

export type EyeKind =
  | 'open'
  | 'big'
  | 'half'
  | 'closedHappy'
  | 'closedSleep'
  | 'cross'
  | 'squint'
  | 'hearts'
  | 'squeeze'
  | 'teary';

export type MouthKind =
  | 'smile'
  | 'grin'
  | 'laugh'
  | 'tongueOut'
  | 'drool'
  | 'flat'
  | 'wavy'
  | 'pout'
  | 'o'
  | 'smallO'
  | 'sickWavy'
  | 'yum'
  | 'yawn'
  | 'kiss';

export type Extra =
  | 'sweat'
  | 'worryBrows'
  | 'angryBrows'
  | 'sickCheeks'
  | 'blush'
  | 'bigBlush'
  | 'droop'
  | 'sparkles'
  | 'eyeBags'
  | 'angerMark'
  | 'pale'
  | 'shock'
  | 'raisedBrows'
  | 'happyBrows'
  | 'dry'
  | 'hearts'
  | 'tear';

export interface FaceSpec {
  eyes: EyeKind;
  mouth: MouthKind;
  extras: readonly Extra[];
}

export const FACES: Record<BudiFace, FaceSpec> = {
  b10_face_neutral: { eyes: 'open', mouth: 'smile', extras: ['blush'] },
  b10_face_happy: { eyes: 'open', mouth: 'grin', extras: ['bigBlush', 'happyBrows'] },
  b10_face_very_happy: { eyes: 'closedHappy', mouth: 'laugh', extras: ['bigBlush', 'sparkles'] },
  b10_face_thirsty: { eyes: 'teary', mouth: 'tongueOut', extras: ['droop', 'dry'] },
  b10_face_hungry: { eyes: 'open', mouth: 'drool', extras: ['worryBrows'] },
  b10_face_tired: { eyes: 'half', mouth: 'flat', extras: ['eyeBags'] },
  b10_face_snoring: { eyes: 'closedSleep', mouth: 'smallO', extras: ['blush'] },
  b10_face_stressed: { eyes: 'open', mouth: 'wavy', extras: ['worryBrows', 'sweat'] },
  b10_face_sick: { eyes: 'half', mouth: 'sickWavy', extras: ['pale', 'sickCheeks', 'sweat', 'eyeBags'] },
  b10_face_offended: { eyes: 'squint', mouth: 'pout', extras: ['angryBrows', 'blush', 'angerMark'] },
  b10_face_coma: { eyes: 'cross', mouth: 'flat', extras: ['pale'] },
  b10_face_surprised: { eyes: 'big', mouth: 'o', extras: ['raisedBrows', 'shock'] },
  b12_blink: { eyes: 'closedSleep', mouth: 'smile', extras: ['blush'] },
  love: { eyes: 'hearts', mouth: 'kiss', extras: ['bigBlush', 'hearts'] },
  giggle: { eyes: 'squeeze', mouth: 'laugh', extras: ['bigBlush', 'happyBrows', 'tear'] },
  yum: { eyes: 'closedHappy', mouth: 'yum', extras: ['bigBlush', 'sparkles'] },
  yawn: { eyes: 'closedSleep', mouth: 'yawn', extras: ['raisedBrows', 'tear'] },
};

/** Augen mit beweglicher Iris: nur diese schauen umher (eigene Ebene, siehe FaceArt). */
export function hasMovingIris(face: BudiFace): boolean {
  const { eyes } = FACES[face];
  return eyes === 'open' || eyes === 'big' || eyes === 'teary';
}
