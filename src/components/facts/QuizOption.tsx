// Antwort-Knopf im Fakten-Quiz (Auftrag 40): richtig federt auf, falsch wackelt. Am Rechner zeigt
// die Nummer, welche Taste die Antwort wählt.

import { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

export type OptionState = 'open' | 'correct' | 'wrong' | 'dimmed';

const STYLE: Record<OptionState, string> = {
  open: 'bg-white border-plantDark',
  correct: 'bg-plantLight border-plantDark',
  wrong: 'bg-coral border-coral',
  dimmed: 'bg-white border-inkMuted opacity-60',
};

interface QuizOptionProps {
  index: number;
  label: string;
  state: OptionState;
  disabled: boolean;
  onPress: () => void;
}

export function QuizOption({ index, label, state, disabled, onPress }: QuizOptionProps) {
  const scale = useSharedValue(1);
  const shift = useSharedValue(0);
  useEffect(() => {
    if (state === 'correct') {
      scale.set(withSequence(withTiming(1.06, { duration: 90 }), withSpring(1, { damping: 7, stiffness: 240 })));
    } else if (state === 'wrong') {
      shift.set(
        withSequence(
          withTiming(-9, { duration: 50 }),
          withTiming(9, { duration: 70 }),
          withTiming(-6, { duration: 60 }),
          withTiming(0, { duration: 50 }),
        ),
      );
    }
  }, [scale, shift, state]);
  const style = useAnimatedStyle(() => ({ transform: [{ translateX: shift.get() }, { scale: scale.get() }] }));

  return (
    <Animated.View style={style}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled, selected: state === 'correct' || state === 'wrong' }}
        onPress={onPress}
        className={`flex-row items-center gap-3 rounded-2xl border-2 p-4 active:opacity-70 ${STYLE[state]}`}
      >
        <View className="h-8 w-8 items-center justify-center rounded-full bg-cream">
          <Text className="font-heading text-base text-ink">{index + 1}</Text>
        </View>
        <Text className="flex-1 font-body-bold text-base text-ink">{label}</Text>
      </Pressable>
    </Animated.View>
  );
}
