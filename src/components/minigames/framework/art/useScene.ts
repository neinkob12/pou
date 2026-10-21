// Eine Picture pro Frame für das ganze Spielfeld (Auftrag 51). Die Zeichnung liest Shared Values und
// läuft wie ein abgeleiteter Wert auf dem UI-Thread; Skia bekommt nur einen Knoten (<Picture>).
// Die Picture vom vorigen Frame wird freigegeben, sobald die neue steht: Skia hat sie da schon in
// sein eigenes Bild übernommen (Referenz im Skia-Kern), im Web läge sie sonst im WASM-Speicher fest.

import type { SkCanvas, SkPicture } from '@shopify/react-native-skia';
import { useEffect, useState } from 'react';
import { useDerivedValue, type SharedValue } from 'react-native-reanimated';
import { scheduleOnUI } from 'react-native-worklets';

import { record } from './kit';

let nextSlot = 1;

function scenes(): Record<string, SkPicture | undefined> {
  'worklet';
  const store = globalThis as unknown as { __minigameScenes?: Record<string, SkPicture | undefined> };
  if (!store.__minigameScenes) store.__minigameScenes = {};
  return store.__minigameScenes;
}

function release(slot: string) {
  'worklet';
  const all = scenes();
  all[slot]?.dispose();
  all[slot] = undefined;
}

/** `draw` ist ein Worklet und zeichnet die ganze Szene; es läuft, wenn sich ein gelesener Wert ändert. */
export function useScene(draw: (canvas: SkCanvas) => void): SharedValue<SkPicture> {
  const [slot] = useState(() => `scene${nextSlot++}`);
  useEffect(() => () => scheduleOnUI(release, slot), [slot]);
  return useDerivedValue(() => {
    const picture = record((canvas) => draw(canvas));
    const all = scenes();
    all[slot]?.dispose();
    all[slot] = picture;
    return picture;
  });
}
