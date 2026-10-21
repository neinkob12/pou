import { useEffect } from 'react';
import { Pressable, View } from 'react-native';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { dailyGoals } from '../../content/strings';
import { artColors } from '../../lib/theme';
import { GameIcon } from '../ui/icons/GameIcon';

const SIZE = 52;
const WIGGLE_DEG = 9;
const WIGGLE_MS = 90;
const PAUSE_MS = 1400;

/** Tageskiste (WEB-4): gezeichnete Schatzkiste mit Schein, wackelt, solange sie wartet. */
export function DailyChest({ onPress }: { onPress: () => void }) {
  const tilt = useSharedValue(0);
  useEffect(() => {
    tilt.value = withRepeat(
      withDelay(
        PAUSE_MS,
        withSequence(
          withTiming(-WIGGLE_DEG, { duration: WIGGLE_MS }),
          withTiming(WIGGLE_DEG, { duration: WIGGLE_MS * 2 }),
          withTiming(-WIGGLE_DEG / 2, { duration: WIGGLE_MS * 2 }),
          withTiming(0, { duration: WIGGLE_MS }),
        ),
      ),
      -1,
    );
    return () => cancelAnimation(tilt);
  }, [tilt]);
  const style = useAnimatedStyle(() => ({ transform: [{ rotate: `${tilt.value}deg` }] }));

  return (
    <Pressable accessibilityRole="button" accessibilityLabel={dailyGoals.openChest} onPress={onPress} hitSlop={8}>
      <View style={{ width: SIZE, height: SIZE, alignItems: 'center', justifyContent: 'center' }}>
        <View
          style={{
            position: 'absolute',
            width: SIZE,
            height: SIZE,
            borderRadius: SIZE / 2,
            backgroundColor: artColors.glowSoft,
          }}
        />
        <Animated.View style={[{ transformOrigin: 'bottom' }, style]}>
          <GameIcon id="chest" size={SIZE - 6} />
        </Animated.View>
      </View>
    </Pressable>
  );
}
