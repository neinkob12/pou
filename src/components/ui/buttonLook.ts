import { depth, gameRadii, tones, typography, type Tone, type ToneName } from '../../lib/theme';

export type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'gold';
export type ButtonSize = 'sm' | 'md' | 'lg';

/** Farbton je Variante: Koralle für Hauptaktionen, Creme für Nebenaktionen, Rot für Gefahr. */
export const VARIANT_TONE: Record<ButtonVariant, ToneName> = {
  primary: 'coral',
  secondary: 'cream',
  success: 'leaf',
  danger: 'danger',
  gold: 'gold',
};

export const BUTTON_SIZES = {
  sm: { minHeight: 40, paddingHorizontal: 16, depth: depth.sm, radius: gameRadii.chip, text: typography.buttonSm },
  md: { minHeight: 50, paddingHorizontal: 22, depth: depth.md, radius: gameRadii.button, text: typography.button },
  lg: { minHeight: 62, paddingHorizontal: 30, depth: depth.lg, radius: gameRadii.button + 4, text: typography.title },
} as const;

/** Gesperrte Knöpfe werden grau statt blass, damit sie wie ein Spielknopf "aus" wirken. */
export function buttonTone(variant: ButtonVariant, disabled: boolean): Tone {
  return tones[disabled ? 'stone' : VARIANT_TONE[variant]];
}

/** Heller Text bekommt einen dunklen Schatten, dunkler Text nicht. */
export function needsTextShadow(tone: Tone): boolean {
  return tone.text.toUpperCase() === '#FFFFFF';
}
