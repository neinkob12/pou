// Kombo-Zähler (Auftrag 40, Auftrag 51 im Spiel-Look): schräges Abzeichen mit Kontur, springt bei
// jedem Treffer auf, wird mit der Kombo heißer (Koralle, Gold, Lila). Ab MINIGAME_FEEL.comboShowFrom.

import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming } from 'react-native-reanimated';

import { minigameFeel as t } from '../../../../content/strings';
import { MINIGAME_FEEL } from '../../../../game/config';
import { gameRadii, outline, shadows, spacing, springs, tones } from '../../../../lib/theme';
import { GlossFill } from '../../../ui/game/GlossFill';
import { GameText } from '../../../ui/GameText';
import { StrokeText } from '../StrokeText';
import { comboLevel } from './fxLogic';

interface ComboBadgeProps {
  combo: number;
  /** Multiplikator, nur gezeigt wenn > 1. */
  multiplier?: number;
}

/** Farbton je Kombo-Stufe (comboLevel): Koralle, Gold, Lila. */
const LEVEL_TONES = [tones.coral, tones.gold, tones.grape] as const;

export function ComboBadge({ combo, multiplier = 1 }: ComboBadgeProps) {
  const scale = useSharedValue(1);
  const tilt = useSharedValue(0);
  useEffect(() => {
    if (combo < MINIGAME_FEEL.comboShowFrom) return;
    scale.set(withSequence(withTiming(1.45, { duration: 70 }), withSpring(1, springs.release)));
    tilt.set(withSequence(withTiming(combo % 2 === 0 ? 8 : -8, { duration: 70 }), withSpring(0, springs.release)));
  }, [combo, scale, tilt]);
  const style = useAnimatedStyle(() => ({ transform: [{ rotate: `${-6 + tilt.get()}deg` }, { scale: scale.get() }] }));

  if (combo < MINIGAME_FEEL.comboShowFrom) return null;
  const tone = LEVEL_TONES[comboLevel(combo)];
  return (
    <Animated.View pointerEvents="none" style={[styles.badge, { backgroundColor: tone.base }, style]}>
      <GlossFill tone={tone} radius={gameRadii.chip} />
      <StrokeText size={22} color={tones.cream.light}>
        {t.combo(combo)}
      </StrokeText>
      {multiplier > 1 && (
        <GameText variant="small" color={tones.cream.light} shadow align="center">
          {t.multiplier(multiplier)}
        </GameText>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    right: spacing.md,
    top: spacing.sm,
    alignItems: 'center',
    borderRadius: gameRadii.chip + outline.regular,
    borderWidth: outline.regular,
    borderColor: outline.color,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    boxShadow: shadows.button,
  },
});
