// Kosmetik-Slice (P25): gekaufte Accessoires und das ausgerüstete im Accessoire-Slot von Budi.
// Logik in src/game/cosmetics.ts. Nur Optik, kein Spielvorteil. Wird mit dem Spielstand gespeichert.
// Anprobieren ist nur Vorschau im Kosmetik-Tab und wird nicht gespeichert.

import { COSMETIC_ITEMS, type CosmeticId } from '../../game/config';
import { addCosmetic, ownsCosmetic } from '../../game/cosmetics';
import { gameEvents } from '../../game/events';
import type { PayCoins } from './health';
import type { SliceCreator } from './types';

export interface CosmeticsSlice {
  /** Gekaufte Accessoires. */
  cosmeticsOwned: CosmeticId[];
  /** Ausgerüstetes Accessoire, null = keins. */
  cosmeticEquipped: CosmeticId | null;
  /** Kauft und rüstet aus. Rückgabe: ob bezahlt und gekauft wurde. Löst `purchaseCompleted` aus. */
  buyCosmetic: (id: CosmeticId, pay: PayCoins, nowMs: number) => boolean;
  /** Rüstet ein gekauftes Accessoire aus (null = ablegen). Rückgabe: ob es geklappt hat. */
  equipCosmetic: (id: CosmeticId | null) => boolean;
}

/** Produkt-ID im Ereignis `purchaseCompleted`, z. B. `cosmetic:u16_hat_cap`. */
export const cosmeticProductId = (id: CosmeticId) => `cosmetic:${id}`;

export const createCosmeticsSlice: SliceCreator<CosmeticsSlice> = (set, get) => ({
  cosmeticsOwned: [],
  cosmeticEquipped: null,
  buyCosmetic: (id, pay, nowMs) => {
    const owned = get().cosmeticsOwned;
    if (ownsCosmetic(owned, id) || !pay(COSMETIC_ITEMS[id].priceCoins)) return false;
    set({ cosmeticsOwned: addCosmetic(owned, id), cosmeticEquipped: id });
    gameEvents.emit('purchaseCompleted', { productId: cosmeticProductId(id), atMs: nowMs });
    return true;
  },
  equipCosmetic: (id) => {
    if (id !== null && !ownsCosmetic(get().cosmeticsOwned, id)) return false;
    set({ cosmeticEquipped: id });
    return true;
  },
});
