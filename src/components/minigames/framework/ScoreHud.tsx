// Kopfzeile im Spiel (Auftrag 45, Auftrag 51 im Spiel-Look): Spielname, Punkte- und Zeit-Pillen mit
// Kontur, die Punkte springen bei jedem Zuwachs auf, die Zeit pulsiert rot in den letzten Sekunden.
// Darunter Sterne-Ziel und Rekord als kleine Pillen.

import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming } from 'react-native-reanimated';

import { minigameFramework as t, minigameFun } from '../../../content/strings';
import { MINIGAME_ART } from '../../../game/config';
import { fonts, gameRadii, outline, spacing, springs, tones } from '../../../lib/theme';
import { GameText } from '../../ui/GameText';
import { IconButton } from '../../ui/IconButton';
import type { RoundGoal } from './roundGoal';

/** Ab so vielen Sekunden Rest pulsiert die Zeit rot. */
const HURRY_SECONDS = 5;

interface ScoreHudProps {
  title: string;
  score: number;
  secondsLeft: number | null;
  canPause: boolean;
  onPause: () => void;
  /** Ziel der Runde und Rekord vor Rundenbeginn (Auftrag 45), zweite Zeile. */
  goal?: RoundGoal | null;
  record?: number;
}

function goalText(goal: RoundGoal): string {
  return goal.nextStars === null || goal.points === null
    ? minigameFun.goalAllStars
    : minigameFun.goalNextStar(goal.nextStars, goal.points);
}

/** Pille mit Beschriftung und Zahl; `bumpKey` lässt sie bei jeder Änderung aufspringen. */
function Pill({ label, value, tone, bumpKey }: { label: string; value: string; tone: keyof typeof tones; bumpKey: unknown }) {
  const scale = useSharedValue(1);
  useEffect(() => {
    scale.set(withSequence(withTiming(MINIGAME_ART.scoreBump, { duration: 80 }), withSpring(1, springs.release)));
  }, [bumpKey, scale]);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.get() }] }));
  const c = tones[tone];
  return (
    <Animated.View style={[styles.pill, { backgroundColor: c.base }, style]}>
      <GameText variant="small" color={c.text} shadow={c.text === tones.coral.text}>
        {label}
      </GameText>
      <GameText variant="number" color={c.text} shadow={c.text === tones.coral.text}>
        {value}
      </GameText>
    </Animated.View>
  );
}

/** Pause-Symbol: zwei Balken. */
function PauseGlyph() {
  return (
    <View style={styles.glyph}>
      <View style={styles.bar} />
      <View style={styles.bar} />
    </View>
  );
}

export function ScoreHud({ title, score, secondsLeft, canPause, onPause, goal, record = 0 }: ScoreHudProps) {
  const hurry = secondsLeft !== null && secondsLeft <= HURRY_SECONDS && secondsLeft > 0;
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <GameText variant="heading" numberOfLines={1} style={styles.title}>
          {title}
        </GameText>
        <Pill label={t.score} value={String(score)} tone="sky" bumpKey={score} />
        {secondsLeft !== null && (
          <Pill
            label={t.timeLeft}
            value={String(secondsLeft)}
            tone={hurry ? 'danger' : 'cream'}
            bumpKey={hurry ? secondsLeft : 0}
          />
        )}
        <IconButton
          icon={<PauseGlyph />}
          accessibilityLabel={t.pause}
          onPress={onPause}
          disabled={!canPause}
          size="sm"
          quiet
        />
      </View>
      {(goal || record > 0) && (
        <View style={styles.sub}>
          {goal && <Text style={[styles.chip, styles.goal]}>{goalText(goal)}</Text>}
          {record > 0 && <Text style={[styles.chip, styles.record]}>{minigameFun.record(record)}</Text>}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: spacing.md, paddingTop: spacing.xs, paddingBottom: spacing.sm, gap: spacing.xs },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  title: { flex: 1 },
  pill: {
    minWidth: 54,
    alignItems: 'center',
    borderRadius: gameRadii.chip,
    borderWidth: outline.thin,
    borderColor: outline.color,
    paddingHorizontal: spacing.sm,
    paddingVertical: 1,
  },
  glyph: { flexDirection: 'row', gap: 4 },
  bar: { width: 5, height: 14, borderRadius: 2, backgroundColor: outline.color },
  sub: { flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.sm },
  chip: {
    overflow: 'hidden',
    borderRadius: gameRadii.pill,
    borderWidth: outline.thin,
    borderColor: outline.color,
    paddingHorizontal: spacing.sm,
    paddingVertical: 1,
    fontSize: 13,
  },
  goal: { backgroundColor: tones.grape.base, color: tones.grape.text, fontFamily: fonts.headingBold },
  record: { backgroundColor: tones.cream.light, color: tones.cream.text, fontFamily: fonts.headingBold },
});
