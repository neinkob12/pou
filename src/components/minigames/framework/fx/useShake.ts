// Kamera-Wackeln (Auftrag 40, Auftrag 51): verschiebt die ganze Bühne (Hintergrund und Szene) als
// View-Transform. Ein Hauch Zoom deckt die Ränder ab, die beim Verschieben frei würden.

import { useAnimatedStyle, type SharedValue } from 'react-native-reanimated';

import { shakeOffset, shakeStrength, type FxState } from './fxLogic';

export function useShakeStyle(
  state: SharedValue<FxState>,
  now: SharedValue<number>,
  size: SharedValue<{ width: number; height: number }>,
) {
  return useAnimatedStyle(() => {
    const fx = state.get();
    const t = now.get();
    const { x, y } = shakeOffset(fx, t);
    const { width, height } = size.get();
    const edge = Math.min(width, height);
    const zoom = edge > 0 ? 1 + (2 * shakeStrength(fx, t)) / edge : 1;
    return { transform: [{ translateX: x }, { translateY: y }, { scale: zoom }] };
  });
}
