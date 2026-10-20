import { useEffect, type ReactNode } from 'react';
import { Pressable, Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

const WOBBLE_DEG = 6;
const WOBBLE_MS = 90;
const PAUSE_MS = 700;

interface RevealBoxProps {
  /** Die geschlossene Kiste (Bild oder Platzhalter). */
  children: ReactNode;
  hint: string;
  accessibilityLabel: string;
  onOpen: () => void;
}

/** Geschlossene Kiste, die wackelt, bis man sie antippt (WEB-3). Danach zeigt der Aufrufer den Inhalt. */
export function RevealBox({ children, hint, accessibilityLabel, onOpen }: RevealBoxProps) {
  const rot = useSharedValue(0);
  useEffect(() => {
    rot.value = withRepeat(
      withSequence(
        withTiming(-WOBBLE_DEG, { duration: WOBBLE_MS }),
        withTiming(WOBBLE_DEG, { duration: WOBBLE_MS }),
        withTiming(-WOBBLE_DEG / 2, { duration: WOBBLE_MS }),
        withTiming(0, { duration: WOBBLE_MS }),
        withTiming(0, { duration: PAUSE_MS }),
      ),
      -1,
    );
  }, [rot]);
  const style = useAnimatedStyle(() => ({ transform: [{ rotate: `${rot.value}deg` }] }));
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onOpen}
      className="items-center gap-3"
    >
      <Animated.View style={style}>{children}</Animated.View>
      <Text className="font-body-bold text-base text-inkMuted">{hint}</Text>
    </Pressable>
  );
}
