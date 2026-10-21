// Antwort-Knopf im Quiz (Auftrag 51 im Spiel-Look): 3D-Knopf mit Kante, sinkt beim Tippen ein und
// federt zurück. Richtig wird grün und hüpft, falsch wird rot und wackelt, weggenommene und übrige
// Antworten werden grau. Die Nummer zeigt am Rechner die Taste.

import { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming } from 'react-native-reanimated';

import { depth, gameRadii, outline, shadows, spacing, springs, tones, type Tone } from '../../../lib/theme';
import { GlossFill } from '../../ui/game/GlossFill';
import { usePressSpring } from '../../ui/game/usePressSpring';
import { GameText } from '../../ui/GameText';

export type AnswerState = 'open' | 'correct' | 'wrong' | 'dimmed';

const TONE: Record<AnswerState, Tone> = {
  open: tones.cream,
  correct: tones.leaf,
  wrong: tones.danger,
  dimmed: tones.stone,
};

interface QuizAnswerProps {
  index: number;
  label: string;
  state: AnswerState;
  disabled: boolean;
  onPress: () => void;
}

export function QuizAnswer({ index, label, state, disabled, onPress }: QuizAnswerProps) {
  const press = usePressSpring({ sink: depth.md, disabled });
  const bounce = useSharedValue(1);
  const shift = useSharedValue(0);
  useEffect(() => {
    if (state === 'correct') {
      bounce.set(withSequence(withTiming(1.08, { duration: 90 }), withSpring(1, springs.release)));
    } else if (state === 'wrong') {
      shift.set(
        withSequence(
          withTiming(-10, { duration: 50 }),
          withTiming(10, { duration: 70 }),
          withTiming(-6, { duration: 60 }),
          withTiming(0, { duration: 50 }),
        ),
      );
    }
  }, [bounce, shift, state]);
  const feedback = useAnimatedStyle(() => ({ transform: [{ translateX: shift.get() }, { scale: bounce.get() }] }));
  const tone = TONE[state];
  const light = state === 'correct' || state === 'wrong';
  const inner = gameRadii.button - outline.regular;

  return (
    <Animated.View style={[feedback, state === 'dimmed' && styles.dimmed]}>
      <Animated.View style={[styles.shadow, press.outerStyle]}>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled, selected: light }}
          disabled={disabled}
          onPress={onPress}
          onPressIn={press.onPressIn}
          onPressOut={press.onPressOut}
          style={[styles.edge, { backgroundColor: tone.edge }]}
        >
          <Animated.View style={[styles.face, press.faceStyle]}>
            <GlossFill tone={tone} radius={inner} />
            <View style={styles.row}>
              <View style={styles.number}>
                <GameText variant="number">{String(index + 1)}</GameText>
              </View>
              <GameText variant="bodyBold" color={tone.text} shadow={light} style={styles.label}>
                {label}
              </GameText>
            </View>
          </Animated.View>
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  dimmed: { opacity: 0.6 },
  shadow: { borderRadius: gameRadii.button, boxShadow: shadows.button },
  edge: {
    borderRadius: gameRadii.button,
    borderWidth: outline.regular,
    borderColor: outline.color,
    paddingBottom: depth.md,
  },
  face: { borderRadius: gameRadii.button - outline.regular },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md - 4, padding: spacing.md - 4 },
  number: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 17,
    borderWidth: outline.thin,
    borderColor: outline.color,
    backgroundColor: tones.gold.light,
  },
  label: { flex: 1 },
});
