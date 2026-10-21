// Größe von Budi im Zimmer, ohne React, damit testbar. Nur Darstellung.

/** Budi ist die Hauptfigur: so groß, wie es die Bildschirmhöhe hergibt, in festen Grenzen. */
export const BUDI_STAGE_MIN = 220;
export const BUDI_STAGE_MAX = 330;
const SHARE_OF_HEIGHT = 0.36;

export function budiStageSize(windowHeight: number): number {
  return Math.round(Math.min(BUDI_STAGE_MAX, Math.max(BUDI_STAGE_MIN, windowHeight * SHARE_OF_HEIGHT)));
}
