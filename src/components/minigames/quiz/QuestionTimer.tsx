// Bedenkzeit der aktuellen Quiz-Frage (Auftrag 45, Auftrag 51 im Spiel-Look): dicke Leiste mit
// Kontur und glänzender Füllung, die schrumpft; zum Ende rot und pulsierend.

import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming } from 'react-native-reanimated';

import { minigameFun } from '../../../content/strings';
import { gameRadii, outline, spacing, springs, tones } from '../../../lib/theme';
import { GlossFill } from '../../ui/game/GlossFill';
import { GameText } from '../../ui/GameText';

interface QuestionTimerProps {
  secondsLeft: number;
  totalSeconds: number;
}

const HEIGHT = 18;

export function QuestionTimer({ secondsLeft, totalSeconds }: QuestionTimerProps) {
  const share = totalSeconds > 0 ? Math.max(0, Math.min(1, secondsLeft / totalSeconds)) : 0;
  const low = share <= 0.34;
  const pulse = useSharedValue(1);
  useEffect(() => {
    if (low && secondsLeft > 0) pulse.set(withSequence(withTiming(1.15, { duration: 90 }), withSpring(1, springs.release)));
  }, [low, pulse, secondsLeft]);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: pulse.get() }] }));
  const tone = low ? tones.danger : tones.grape;
  return (
    <View style={styles.row}>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${share * 100}%` }]}>
          <GlossFill tone={tone} radius={HEIGHT / 2} />
        </View>
      </View>
      <Animated.View style={style}>
        <GameText variant="number" color={low ? tones.danger.dark : tones.cream.light} shadow={!low}>
          {minigameFun.quizQuestionTime(secondsLeft)}
        </GameText>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  track: {
    flex: 1,
    height: HEIGHT + outline.thin * 2,
    overflow: 'hidden',
    borderRadius: gameRadii.pill,
    borderWidth: outline.thin,
    borderColor: outline.color,
    backgroundColor: tones.cream.dark,
  },
  fill: { height: HEIGHT, borderRadius: HEIGHT / 2, overflow: 'hidden' },
});
