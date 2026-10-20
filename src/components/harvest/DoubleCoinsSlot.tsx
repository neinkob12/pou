import type { HarvestResult } from './harvestFlow';

interface DoubleCoinsSlotProps {
  result: HarvestResult;
}

/**
 * Hook-Punkt für P29 (Rewarded Ad): Knopf "Münzen verdoppeln" nach der Werbung.
 * P29 zeigt hier den Knopf, wenn !result.coinsDoubled, und ruft nach der Werbung
 * claimDoubleCoins() aus harvestActions.ts. Bis dahin bleibt der Platz leer.
 */
export function DoubleCoinsSlot(_props: DoubleCoinsSlotProps) {
  return null;
}
