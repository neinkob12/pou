import { useShallow } from 'zustand/react/shallow';

import type { ProgressStats } from '../game/progression';
import { useGameStore } from '../store/gameStore';
import { toProgressStats } from '../store/slices/progression';

/** Level- und Freischalt-Zähler aus dem Spielstand (P16). */
export function useProgressStats(): ProgressStats {
  return useGameStore(useShallow(toProgressStats));
}
