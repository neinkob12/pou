import { DEBUG_SPEED_MULTIPLIER } from '../../../game/config';

/** Zeitraffer aus dem Debug-Menü (P09). Weiche, bis der Debug-Slice auf main ist. */
export function useDebugMultiplier(): number {
  return DEBUG_SPEED_MULTIPLIER;
}
