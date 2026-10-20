// Tastatur in Minigames (Auftrag 40). Auf dem Handy gibt es keine, der Browser nutzt useKeyboard.web.ts.

import { useSharedValue, type SharedValue } from 'react-native-reanimated';

/** Richtung -1, 0 oder 1 aus Pfeiltasten und A/D. Nativ immer 0. */
export function useKeyAxis(): SharedValue<number> {
  return useSharedValue(0);
}

/** Ruft `onKey` bei jedem Tastendruck. Nativ ohne Wirkung. */
export function useKeyDown(_onKey: (key: string) => void): void {}
