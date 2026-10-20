// Shop-Slice: gekaufte Upgrade-Stufen (Logik in src/game/shop.ts). Wird mit dem Spielstand gespeichert.
// Andere Bereiche lesen die Wirkung über selectUpgradeEffects und reichen sie weiter, z. B.
// `computeNeeds(needs, now, selectUpgradeEffects(state).needModifiers, phase)` (P10).

import type { UpgradeId } from '../../game/config';
import { gameEvents } from '../../game/events';
import {
  buyLevel,
  createUpgradeLevels,
  nextLevel,
  upgradeEffects,
  type UpgradeEffects,
  type UpgradeLevels,
} from '../../game/shop';
import type { PayCoins } from './health';
import type { SliceCreator } from './types';

export interface ShopSlice {
  upgrades: UpgradeLevels;
  /** Kauft die nächste Stufe. Rückgabe: ob bezahlt und gekauft wurde. Löst `purchaseCompleted` aus. */
  buyUpgrade: (id: UpgradeId, pay: PayCoins, nowMs: number) => boolean;
}

/** Produkt-ID im Ereignis `purchaseCompleted`, z. B. `upgrade:pot:2`. */
export const upgradeProductId = (id: UpgradeId, level: number) => `upgrade:${id}:${level}`;

export const createShopSlice: SliceCreator<ShopSlice> = (set, get) => ({
  upgrades: createUpgradeLevels(),
  buyUpgrade: (id, pay, nowMs) => {
    const before = get().upgrades;
    const next = nextLevel(before, id);
    if (next === null || !pay(next.price)) return false;
    const upgrades = buyLevel(before, id);
    set({ upgrades });
    gameEvents.emit('purchaseCompleted', { productId: upgradeProductId(id, upgrades[id]), atMs: nowMs });
    return true;
  },
});

/** Wirkung aller gekauften Upgrades für die Aufrufer der Bedürfnis-, Gesundheits- und Ernte-Logik. */
export function selectUpgradeEffects(state: Pick<ShopSlice, 'upgrades'>): UpgradeEffects {
  return upgradeEffects(state.upgrades);
}
