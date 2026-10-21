// Farben einer Pflanze je Sorte und Reife. Reines TypeScript, damit testbar.

import { artColors, colors, type ColorName } from '../../../lib/theme';
import { budiColors } from './budiColors';
import { mix } from './color';

export interface PlantPalette {
  leaf: string;
  leafBack: string;
  /** Verlauf (ART-3): Blattspitzen oben heller, Ansatz unten satter. */
  leafTop: string;
  leafBottom: string;
  leafBackTop: string;
  leafBackBottom: string;
  budLight: string;
  vein: string;
  stem: string;
  bud: string;
  budShade: string;
  pistil: string;
}

/** Wie stark der Sorten-Farbschleier Blätter und Knospen einfärbt. */
const LEAF_TINT = 0.28;
const BUD_TINT = 0.6;

/**
 * Grundfarben, optional mit Sorten-Farbschleier (`tint` aus budiLook, z. B. Lavendel für Lotte).
 * `ripe` färbt die Blütenhärchen bernsteinfarben (erntereif).
 */
export function plantPalette(tint: ColorName | null, ripe: boolean): PlantPalette {
  const t = tint ? colors[tint] : null;
  const leaf = t ? mix(artColors.leaf, t, LEAF_TINT) : artColors.leaf;
  const leafBack = t ? mix(artColors.leafShade, t, LEAF_TINT) : artColors.leafShade;
  const tinted = (base: string, k = LEAF_TINT) => (t ? mix(base, t, k) : base);
  return {
    leaf,
    leafBack,
    leafTop: tinted(budiColors.leafTip),
    leafBottom: tinted(budiColors.leafBase),
    leafBackTop: tinted(budiColors.leafBackTip),
    leafBackBottom: tinted(budiColors.leafBackBase),
    budLight: tinted(artColors.leafLight, BUD_TINT),
    vein: artColors.leafVein,
    stem: artColors.stem,
    bud: t ? mix(artColors.bud, t, BUD_TINT) : artColors.bud,
    budShade: t ? mix(artColors.budShade, t, BUD_TINT) : artColors.budShade,
    pistil: ripe ? artColors.pistilRipe : artColors.pistil,
  };
}
