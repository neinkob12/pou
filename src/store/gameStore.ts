// Globaler Spielzustand: setzt alle Slices aus src/store/slices/index.ts zusammen.
// Gehört P01 und P02 (Persistenz kommt mit P02).

import { create } from 'zustand';

import { slices, type GameState } from './slices';
import type { SliceCreator, SliceGet, SliceSet } from './slices/types';

export type { GameState } from './slices';

export function createGameState(set: SliceSet<GameState>, get: SliceGet<GameState>): GameState {
  const state = {} as GameState;
  for (const createSlice of Object.values(slices)) {
    // Jeder Slice ist auf seinen Teilzustand typisiert; zur Laufzeit teilen sich alle einen Store.
    Object.assign(state, (createSlice as unknown as SliceCreator<GameState>)(set, get));
  }
  return state;
}

export const useGameStore = create<GameState>()((set, get) => createGameState(set, get));
