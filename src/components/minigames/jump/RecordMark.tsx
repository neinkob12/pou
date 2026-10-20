// Höhenmarke für den eigenen Rekord: gestrichelte Linie mit Beschriftung, wandert mit der Kamera.
// Ohne Rekord (erste Runde) wird nichts gezeigt.

import { Text, View } from 'react-native';
import Animated, { useAnimatedStyle, type SharedValue } from 'react-native-reanimated';

import { jumpGame } from '../../../content/strings';
import { BUDI_JUMP } from '../../../game/config';
import type { JumpWorld } from './jumpWorld';

interface RecordMarkProps {
  /** Rekordhöhe in Welt-Einheiten. */
  height: number;
  world: SharedValue<JumpWorld>;
  size: SharedValue<{ width: number; height: number }>;
}

export function RecordMark({ height: markY, world, size }: RecordMarkProps) {
  const style = useAnimatedStyle(() => {
    const { width, height } = size.get();
    const k = width / BUDI_JUMP.worldWidth;
    const top = height - (markY - world.get().cameraY) * k;
    return { opacity: width > 0 && top > 0 && top < height ? 1 : 0, transform: [{ translateY: top }] };
  });

  return (
    <Animated.View className="absolute inset-x-0 top-0" style={style} pointerEvents="none">
      <View className="border-t-2 border-dashed border-coral" />
      <Text className="self-end px-2 font-body-bold text-sm text-coral">{jumpGame.recordMark}</Text>
    </Animated.View>
  );
}
