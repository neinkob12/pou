import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';

import { colors, radii, type ColorName } from '../../../lib/theme';

const BURST_MS = 700;
const RISE = 60;
const DOT_SIZE = 14;
const DOT_GAP = 10;
/** Höhenversatz je Punkt: der mittlere steigt voraus. */
const DOT_OFFSETS = [DOT_SIZE, 0, DOT_SIZE] as const;

interface JoyBurstProps {
  /** Zählt hoch: jede neue Zahl spielt die Animation neu ab. 0 = nichts. */
  trigger: number;
  color: ColorName;
}

/** Kurze Freude-Animation: Punkte steigen über Budi auf und verblassen. */
export function JoyBurst({ trigger, color }: JoyBurstProps) {
  const t = useSharedValue(0);
  useEffect(() => {
    if (trigger === 0) return;
    t.value = 0;
    t.value = withSequence(withTiming(1, { duration: BURST_MS }), withTiming(0, { duration: 0 }));
  }, [trigger, t]);

  const style = useAnimatedStyle(() => ({
    opacity: t.value === 0 ? 0 : 1 - t.value,
    transform: [{ translateY: -t.value * RISE }],
  }));

  return (
    <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, alignItems: 'center' }}>
      <Animated.View style={[{ flexDirection: 'row' }, style]}>
        {DOT_OFFSETS.map((offset, i) => (
          <View
            key={i}
            style={{
              width: DOT_SIZE,
              height: DOT_SIZE,
              borderRadius: radii.pill,
              backgroundColor: colors[color],
              marginHorizontal: DOT_GAP,
              marginTop: offset,
            }}
          />
        ))}
      </Animated.View>
    </View>
  );
}
