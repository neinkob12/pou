// Belohnung von Budi Jump, ohne React und ohne Store: Lichtbonus aus den gesammelten Lichtpunkten,
// Licht-Guthaben und Rekordmarke. Gutgeschrieben wird in jumpLightBonus.ts.

import { BUDI_JUMP } from '../../../game/config';
import type { JumpConfig } from './jumpWorld';

export const JUMP_GAME_ID = 'jump';

/** Lichtbonus einer Runde: je Lichtpunkt lightBonusPerPoint, gedeckelt. */
export function lightBonusForRound(lights: number, cfg: JumpConfig = BUDI_JUMP): number {
  return Math.min(cfg.lightBonusMaxPerRound, Math.max(0, Math.floor(lights)) * cfg.lightBonusPerPoint);
}

/** Neues Licht-Guthaben, gedeckelt auf lightBankMax. */
export function addToLightBank(bank: number, bonus: number, cfg: JumpConfig = BUDI_JUMP): number {
  return Math.min(cfg.lightBankMax, Math.max(0, bank) + Math.max(0, bonus));
}

/** Höhe der Rekordmarke in Welt-Einheiten aus dem Rekord (Punkte). Ohne Rekord keine Marke. */
export function recordHeight(highscore: number, cfg: JumpConfig = BUDI_JUMP): number | null {
  'worklet';
  return highscore > 0 ? highscore * cfg.heightPerPoint : null;
}
