// PotPou Kosmetik gegen Münzen (P25): Besitz, Kauf, Ausrüsten, Anprobieren (reine Logik, kein React).
// Nur Optik: nichts hier wirkt auf Bedürfnisse, Gesundheit oder Ertrag.

import { COSMETIC_ITEMS, type CosmeticId } from './config';

export function isCosmeticId(value: unknown): value is CosmeticId {
  return typeof value === 'string' && Object.prototype.hasOwnProperty.call(COSMETIC_ITEMS, value);
}

/** Gekaufte Accessoires ohne Doppelte und ohne unbekannte IDs aus alten Spielständen. */
export function ownedCosmetics(owned: readonly unknown[] | undefined): CosmeticId[] {
  return [...new Set((owned ?? []).filter(isCosmeticId))];
}

export function ownsCosmetic(owned: readonly unknown[] | undefined, id: CosmeticId): boolean {
  return ownedCosmetics(owned).includes(id);
}

/** Kaufbar, wenn noch nicht gekauft und genug Münzen da sind. */
export function canBuyCosmetic(owned: readonly unknown[] | undefined, id: CosmeticId, coins: number): boolean {
  return !ownsCosmetic(owned, id) && coins >= COSMETIC_ITEMS[id].priceCoins;
}

/** Besitzliste nach dem Kauf. */
export function addCosmetic(owned: readonly unknown[] | undefined, id: CosmeticId): CosmeticId[] {
  const list = ownedCosmetics(owned);
  return list.includes(id) ? list : [...list, id];
}

/** Ausgerüstetes Accessoire, aber nur, wenn es gekauft und bekannt ist. */
export function equippedCosmetic(owned: readonly unknown[] | undefined, equipped: unknown): CosmeticId | null {
  return isCosmeticId(equipped) && ownsCosmetic(owned, equipped) ? equipped : null;
}

/**
 * Was Budi trägt: beim Anprobieren das anprobierte Teil (auch ungekauft), sonst das ausgerüstete.
 * `tryOn === null` heißt: nicht anprobieren.
 */
export function shownCosmetic(
  owned: readonly unknown[] | undefined,
  equipped: unknown,
  tryOn: CosmeticId | null,
): CosmeticId | null {
  return tryOn ?? equippedCosmetic(owned, equipped);
}
