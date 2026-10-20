// Debug-Slice (Auftrag P09): gewählter Zeitraffer für die timeEngine.
// Wer getPlantStatus aufruft, gibt selectDebugMultiplier(state) als debugMultiplier mit.

import { effectiveDebugMultiplier } from '../../game/debug';
import { DEBUG_SPEED_MULTIPLIER } from '../../game/config';
import { DEV_TOOLS } from '../../lib/devTools';
import type { SliceCreator } from './types';

export interface DebugSlice {
  /** Im Debug-Menü gewählter Faktor. Wirksam nur im Entwicklungs-Build, siehe selectDebugMultiplier. */
  debugMultiplier: number;
  setDebugMultiplier: (multiplier: number) => void;
}

export const createDebugSlice: SliceCreator<DebugSlice> = (set) => ({
  debugMultiplier: DEBUG_SPEED_MULTIPLIER,
  setDebugMultiplier: (multiplier) => set({ debugMultiplier: multiplier }),
});

/** Wirksamer Zeitraffer: im Release-Build immer DEBUG_SPEED_MULTIPLIER. */
export function selectDebugMultiplier(state: Pick<DebugSlice, 'debugMultiplier'>, isDev: boolean = DEV_TOOLS): number {
  return effectiveDebugMultiplier(state.debugMultiplier, isDev);
}
