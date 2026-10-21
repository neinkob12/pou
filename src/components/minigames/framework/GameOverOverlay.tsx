// Spielende (Auftrag 40, Auftrag 51 im Spiel-Look): Titel mit Kontur, Sterne knallen nacheinander auf,
// Punkte und Münzen zählen hoch, Rekord-Abzeichen wackelt, Tipp fürs Nochmal, 3D-Knöpfe.

import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withTiming } from 'react-native-reanimated';

import { minigameFeel, minigameFramework as t, minigameFun } from '../../../content/strings';
import { MINIGAME_ART } from '../../../game/config';
import { gameRadii, outline, spacing, tones as ui } from '../../../lib/theme';
import { GameText } from '../../ui/GameText';
import { tones } from './art/palette';
import { countUpValue } from './countUp';
import type { RoundResult } from './finishRound';
import { GameButton } from './GameButton';
import { Overlay } from './Overlay';
import { ResultStars } from './ResultStars';
import { pointsToNextStar, starsFor } from './stars';
import { StrokeText } from './StrokeText';

interface GameOverOverlayProps {
  result: RoundResult;
  onPlayAgain: () => void;
  onExit: () => void;
}

/** Zahl, die nach dem Aufploppen der Karte hochzählt. */
function useCountUp(target: number): number {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    let frame = 0;
    const start = Date.now();
    const tick = () => {
      const value = countUpValue(target, Date.now() - start, MINIGAME_ART.countUpMs);
      setShown(value);
      if (value !== target) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target]);
  return shown;
}

function Stat({ label, value, tone }: { label: string; value: string; tone: { base: string; dark: string } }) {
  return (
    <View style={[styles.stat, { backgroundColor: tone.base, borderColor: outline.color }]}>
      <GameText variant="small" color={ui.cream.light} shadow align="center">
        {label}
      </GameText>
      <GameText variant="heading" color={ui.cream.light} shadow align="center">
        {value}
      </GameText>
    </View>
  );
}

function RecordBadge() {
  const wiggle = useSharedValue(0);
  useEffect(() => {
    wiggle.set(withDelay(900, withRepeat(withSequence(withTiming(1, { duration: 120 }), withTiming(-1, { duration: 120 }), withTiming(0, { duration: 120 })), 3, false)));
  }, [wiggle]);
  const style = useAnimatedStyle(() => ({ transform: [{ rotate: `${-4 + wiggle.get() * 6}deg` }] }));
  return (
    <Animated.View style={[styles.record, style]}>
      <StrokeText size={22} color={tones.gold.light}>
        {t.newHighscore}
      </StrokeText>
    </Animated.View>
  );
}

/** Ein Tipp je Runde, zufällig aus den Tipps des Spiels (Auftrag 40). */
function useTip(gameId: string): string | null {
  const [tip] = useState(() => {
    const list = [...(minigameFeel.tips[gameId] ?? []), ...(minigameFun.tips[gameId] ?? [])];
    return list.length > 0 ? list[Math.floor(Math.random() * list.length)] : null;
  });
  return tip;
}

/** Spielende: Sterne, Punkte, Münzen, Rekord, Laune-Hinweis, ein Tipp fürs Nochmal. */
export function GameOverOverlay({ result, onPlayAgain, onExit }: GameOverOverlayProps) {
  const stars = starsFor(result.gameId, result.score);
  const toNext = pointsToNextStar(result.gameId, result.score);
  const tip = useTip(result.gameId);
  const score = useCountUp(result.score);
  const coins = useCountUp(result.coins);
  return (
    <Overlay>
      <View style={styles.title}>
        <StrokeText size={34} color={ui.cream.light}>
          {t.gameOver}
        </StrokeText>
      </View>
      <ResultStars stars={stars} />
      <GameText variant="bodyBold" color={tones.petal.dark} align="center">
        {toNext === null ? minigameFeel.allStars : minigameFeel.nextStar(toNext)}
      </GameText>
      {result.isNewHighscore && <RecordBadge />}
      <View style={styles.stats}>
        <Stat label={t.score} value={String(score)} tone={ui.sky} />
        <Stat label={t.coinsEarned} value={`+${coins}`} tone={ui.gold} />
        <Stat label={t.highscore} value={String(result.highscore)} tone={ui.grape} />
      </View>
      <GameText variant="bodyBold" color={tones.leafDeep.dark} align="center">
        {t.moodBonus}
      </GameText>
      {tip && (
        <View style={styles.tip}>
          <GameText variant="bodyBold">{minigameFeel.tipTitle}</GameText>
          <GameText variant="body">{tip}</GameText>
        </View>
      )}
      <GameButton label={t.playAgain} onPress={onPlayAgain} />
      <GameButton label={t.toSelection} onPress={onExit} variant="secondary" />
    </Overlay>
  );
}

const styles = StyleSheet.create({
  title: { alignItems: 'center', marginTop: -spacing.sm },
  stats: { flexDirection: 'row', gap: spacing.sm },
  stat: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.xs + 2,
    borderRadius: gameRadii.chip,
    borderWidth: outline.thin,
  },
  record: { alignSelf: 'center' },
  tip: {
    gap: 2,
    borderRadius: gameRadii.chip,
    borderWidth: outline.thin,
    borderColor: outline.color,
    backgroundColor: ui.cream.light,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
});
