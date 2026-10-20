import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

import { colors, radii } from '../../../lib/theme';

const DROP_COUNT = 3;
const DROP_SIZE = 8;
const FALL_DISTANCE = 36;
const FALL_MS = 420;

function Drop({ index, visible }: { index: number; visible: SharedValue<number> }) {
  const fall = useSharedValue(0);
  useEffect(() => {
    fall.value = withDelay((index * FALL_MS) / DROP_COUNT, withRepeat(withTiming(1, { duration: FALL_MS }), -1));
  }, [fall, index]);
  const style = useAnimatedStyle(() => ({
    opacity: visible.value * (1 - fall.value * 0.6),
    transform: [{ translateY: fall.value * FALL_DISTANCE }],
  }));
  return (
    <Animated.View
      style={[
        {
          width: DROP_SIZE,
          height: DROP_SIZE * 1.4,
          borderRadius: radii.pill,
          backgroundColor: colors.night,
          marginHorizontal: 2,
        },
        style,
      ]}
    />
  );
}

/** Tropfen unter der Gießkanne, sichtbar solange `visible` 1 ist (über Budi gehalten). */
export function WaterDrops({ visible }: { visible: SharedValue<number> }) {
  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: 0, top: '70%', flexDirection: 'row' }}>
      {Array.from({ length: DROP_COUNT }, (_, i) => (
        <Drop key={i} index={i} visible={visible} />
      ))}
    </View>
  );
}
