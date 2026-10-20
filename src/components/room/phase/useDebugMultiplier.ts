import { useGameStore } from '../../../store/gameStore';
import { selectDebugMultiplier } from '../../../store/slices/debug';

/** Zeitraffer aus dem Debug-Menü (P09). Im Release-Build immer 1. */
export function useDebugMultiplier(): number {
  return useGameStore(selectDebugMultiplier);
}
