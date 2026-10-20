// Budi-Jump-Slice: gewählte Steuerung (Auftrag P14) und Licht-Guthaben aus dem Spiel (P22).
// Wird wie jeder Slice automatisch gespeichert.

import type { JumpControl } from '../../components/minigames/jump/jumpControls';
import { addToLightBank } from '../../components/minigames/jump/jumpReward';
import type { SliceCreator } from './types';

export interface JumpSlice {
  /** Neigen (Standard) oder Tippen links/rechts. */
  jumpControl: JumpControl;
  setJumpControl: (control: JumpControl) => void;
  /** Lichtbonus für Budi aus Budi Jump, den der Licht-Balken noch nicht abgeholt hat. */
  jumpLightBank: number;
  addJumpLight: (amount: number) => void;
  /** Für den Licht-Balken: gibt das Guthaben zurück und leert es. */
  takeJumpLight: () => number;
}

export const createJumpSlice: SliceCreator<JumpSlice> = (set, get) => ({
  jumpControl: 'tilt',
  setJumpControl: (jumpControl) => set({ jumpControl }),
  jumpLightBank: 0,
  addJumpLight: (amount) => set({ jumpLightBank: addToLightBank(get().jumpLightBank, amount) }),
  takeJumpLight: () => {
    const amount = get().jumpLightBank;
    if (amount > 0) set({ jumpLightBank: 0 });
    return amount;
  },
});
