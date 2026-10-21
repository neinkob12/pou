// Budis Aussehen ohne React, damit testbar: welche Ebenen (Pflanze, Gesicht, Topf) gerade
// zu sehen sind, abgeleitet aus Phase, Sorte und dem Zustand aus src/game/needs.ts.
// Das sind Darstellungsregeln, keine Balancing-Werte.

import type { PhaseId, StrainId } from '../../game/config';
import type { CareActionId } from '../../game/events';
import type { Condition } from '../../game/needs';
import type { BudiFaceId, BudiPlantId, BudiPotId, BudiVariantId } from '../../lib/assets';
import type { ColorName } from '../../lib/theme';
import type { CareFeedback } from '../room/care/careLogic';

/** Ab diesem Phasenfortschritt zeigt Budi die große Ebene (B4 statt B3, B6 statt B5). */
export const LATE_PHASE_PROGRESS = 0.5;

/** Phasen, in denen Budi geerntet ist: kein Topf, kein Gesicht, nur die Ernte-Ebene. */
const HARVESTED_PHASES: readonly PhaseId[] = ['drying', 'done'];

/**
 * Mimiken ohne eigene Bilddatei (ART-3), nur gezeichnet: verliebt (oft gestreichelt), kichern
 * (gekitzelt), mampfen (gedüngt), gähnen (Einschlafen und Aufwachen).
 */
export type ExtraFaceId = 'love' | 'giggle' | 'yum' | 'yawn';
export type BudiFace = BudiFaceId | ExtraFaceId;

/** Ab so vielen Streichlern kurz hintereinander kichert Budi (gekitzelt), ab LOVE_STREAK ist er verliebt. */
export const TICKLE_STREAK = 2;
export const LOVE_STREAK = 4;

/** Gesichter, bei denen Budi blinzeln darf (offene Augen). */
const BLINK_FACES: readonly BudiFace[] = [
  'b10_face_neutral',
  'b10_face_happy',
  'b10_face_thirsty',
  'b10_face_hungry',
  'b10_face_stressed',
];

const CONDITION_FACES: Record<Condition, BudiFaceId> = {
  ok: 'b10_face_neutral',
  thirsty: 'b10_face_thirsty',
  hungry: 'b10_face_hungry',
  stressed: 'b10_face_stressed',
  sick: 'b10_face_sick',
  coma: 'b10_face_coma',
};

export interface StrainStyle {
  /** Breite und Höhe der Pflanzen-Ebene relativ zur Grundgröße (Sascha höher, Anton kompakter). */
  scaleX: number;
  scaleY: number;
  /** Farbschleier über der Pflanze, solange keine eigene Varianten-Datei (B9) existiert. */
  tint: ColorName | null;
  tintPhases: readonly PhaseId[];
  /** Breite der Fiederblätter (1 = normal): Sativa schmal und gefingert, Indica breit. */
  leafWidth: number;
}

const NO_STRAIN_STYLE: StrainStyle = { scaleX: 1, scaleY: 1, tint: null, tintPhases: [], leafWidth: 1 };

/** Sorten-Varianten laut docs/ASSETS.md (B9). */
export const STRAIN_STYLES: Record<StrainId, StrainStyle> = {
  gustav: NO_STRAIN_STYLE,
  lotte: { ...NO_STRAIN_STYLE, tint: 'lavender', tintPhases: ['flowering', 'ready'], leafWidth: 1.15 },
  sascha: { ...NO_STRAIN_STYLE, scaleX: 0.88, scaleY: 1.12, leafWidth: 0.6 },
  anton: { ...NO_STRAIN_STYLE, scaleX: 0.85, scaleY: 0.85, leafWidth: 1.4 },
  koelsch: { ...NO_STRAIN_STYLE, tint: 'lamp', tintPhases: ['seedling', 'vegetative', 'flowering', 'ready'], leafWidth: 0.85 },
};

export function plantLayerFor(phase: PhaseId, phaseProgress: number): BudiPlantId {
  const late = phaseProgress >= LATE_PHASE_PROGRESS;
  switch (phase) {
    case 'germination':
      return 'b01_germination';
    case 'seedling':
      return 'b02_seedling';
    case 'vegetative':
      return late ? 'b04_vegetative_large' : 'b03_vegetative_small';
    case 'flowering':
      return late ? 'b06_flowering_full' : 'b05_flowering_early';
    case 'ready':
      return 'b06_flowering_full';
    case 'drying':
      return 'b07_drying';
    case 'done':
      return 'b08_harvest_ready';
  }
}

/** Letzte Pflege, auf die Budi gerade reagiert (aus CareStage, P10). */
export interface BudiReaction {
  type: CareActionId;
  feedback: CareFeedback;
  /** Wievielter Streichler kurz hintereinander (budiMood.ts). Fehlt = 1. */
  streak?: number;
}

/** Reaktionsgesicht nach erfolgreicher Pflege. */
function successFace(reaction: BudiReaction): BudiFace {
  if (reaction.type === 'water') return 'b10_face_happy';
  if (reaction.type !== 'pet') return 'yum';
  const streak = reaction.streak ?? 1;
  if (streak >= LOVE_STREAK) return 'love';
  if (streak >= TICKLE_STREAK) return 'giggle';
  return 'b10_face_very_happy';
}

/**
 * Gesicht: Reaktion auf Pflege (kurz) vor Schweben eines Werkzeugs vor dem Zustand aus needs.ts.
 * Koma und krank lassen sich nicht wegstreicheln: dann bleibt das Zustandsgesicht.
 */
export function faceFor(
  condition: Condition,
  reaction: BudiReaction | null,
  hovering: boolean,
  asleep = false,
  /** Gerade am Einschlafen oder Aufwachen: Budi gähnt. */
  drowsy = false,
): BudiFace {
  if (condition === 'coma' || condition === 'sick') return CONDITION_FACES[condition];
  // 'error' = Pflege hat nicht gewirkt (z. B. keine Pflanze): kein Reaktionsgesicht.
  if (reaction && reaction.feedback !== 'error') {
    if (reaction.feedback === 'warning') return 'b10_face_offended';
    return successFace(reaction);
  }
  if (hovering) return 'b10_face_surprised';
  if (drowsy && condition === 'ok') return 'yawn';
  // Nachts schläft Budi, wenn ihm nichts fehlt. Durst oder Hunger wecken ihn (Zustandsgesicht).
  if (asleep && condition === 'ok') return 'b10_face_snoring';
  return CONDITION_FACES[condition];
}

export function canBlink(face: BudiFace): boolean {
  return BLINK_FACES.includes(face);
}

export interface PlantLayer {
  /** Schlüssel in `budi` (assets.ts): Sorten-Variante, falls vorhanden, sonst Grundebene. */
  key: BudiPlantId | BudiVariantId;
  /** Grundebene der Phase, falls die Variante doch fehlt. */
  base: BudiPlantId;
  tint: ColorName | null;
  scaleX: number;
  scaleY: number;
  leafWidth: number;
}

/** Sorten-Variante: eigene Datei gewinnt, sonst Grundebene mit Farbschleier und Form. */
export function plantLayerWithStrain(
  plant: BudiPlantId,
  phase: PhaseId,
  strainId: StrainId,
  hasAsset: (key: BudiVariantId) => boolean,
): PlantLayer {
  const style = STRAIN_STYLES[strainId];
  const variant: BudiVariantId = `${plant}_${strainId}`;
  // Ernte-Ebenen (Leine, Kiste) bleiben in Form, sonst sähe die Kiste verzerrt aus.
  const shaped = !HARVESTED_PHASES.includes(phase);
  const scaleX = shaped ? style.scaleX : 1;
  const scaleY = shaped ? style.scaleY : 1;
  const { leafWidth } = style;
  if (hasAsset(variant)) return { key: variant, base: plant, tint: null, scaleX, scaleY, leafWidth };
  const tint = style.tintPhases.includes(phase) ? style.tint : null;
  return { key: plant, base: plant, tint, scaleX, scaleY, leafWidth };
}

export interface BudiLook {
  /** null = noch kein Samen: nur der leere Topf. */
  plant: PlantLayer | null;
  pot: BudiPotId | null;
  face: BudiFace | null;
  blink: boolean;
}

export interface BudiLookInput {
  phase: PhaseId | null;
  phaseProgress: number;
  strainId: StrainId | null;
  condition: Condition | null;
  reaction: BudiReaction | null;
  hovering: boolean;
  /** Dunkelphase im Lichtplan: Budi schläft (nur Darstellung). */
  isNight?: boolean;
  /** Übergang Schlafen und Wachen (budiMood.ts): Budi gähnt. */
  drowsy?: boolean;
}

/** Erntereif: Blütenhärchen werden bernsteinfarben. */
export function isRipe(phase: PhaseId | null): boolean {
  return phase === 'ready';
}

export function computeBudiLook(
  input: BudiLookInput,
  hasAsset: (key: BudiVariantId) => boolean,
): BudiLook {
  const { phase, strainId, condition } = input;
  if (phase === null || strainId === null) {
    return { plant: null, pot: 'u01_pot_standard', face: null, blink: false };
  }
  const plant = plantLayerWithStrain(plantLayerFor(phase, input.phaseProgress), phase, strainId, hasAsset);
  if (HARVESTED_PHASES.includes(phase)) return { plant, pot: null, face: null, blink: false };
  const face = faceFor(condition ?? 'ok', input.reaction, input.hovering, input.isNight ?? false, input.drowsy ?? false);
  return { plant, pot: 'u01_pot_standard', face, blink: canBlink(face) };
}
