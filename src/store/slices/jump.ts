// Budi-Jump-Slice: gewählte Steuerung (Auftrag P14). Wird wie jeder Slice automatisch gespeichert.

import type { JumpControl } from '../../components/minigames/jump/jumpControls';
import type { SliceCreator } from './types';

export interface JumpSlice {
  /** Neigen (Standard) oder Tippen links/rechts. */
  jumpControl: JumpControl;
  setJumpControl: (control: JumpControl) => void;
}

export const createJumpSlice: SliceCreator<JumpSlice> = (set) => ({
  jumpControl: 'tilt',
  setJumpControl: (jumpControl) => set({ jumpControl }),
});
