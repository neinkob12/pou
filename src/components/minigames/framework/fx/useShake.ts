// Kamera-Wackeln als Skia-Transform (Auftrag 40): um die Spielgrafik legen, <Group transform={...}>.

import { useDerivedValue, type SharedValue } from 'react-native-reanimated';

import { shakeOffset, type FxState } from './fxLogic';

export function useShakeTransform(state: SharedValue<FxState>, now: SharedValue<number>) {
  return useDerivedValue(() => {
    const { x, y } = shakeOffset(state.get(), now.get());
    return [{ translateX: x }, { translateY: y }];
  });
}
