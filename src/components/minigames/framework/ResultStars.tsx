// Drei Sterne im Ergebnis (Auftrag 40, Auftrag 51): nacheinander knallen sie mit Drehung und
// Überschwingen in ihre Fassung, dabei sprühen Funken. Leere Fassungen bleiben grau mit Kontur.

import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { minigameFeel as t } from '../../../content/strings';
import { cue } from '../../../lib/audio';
import { springs } from '../../../lib/theme';
import { sparks, tones } from './art/palette';
import type { StarCount } from './stars';
import { StrokeText } from './StrokeText';

/** Abstand zwischen den Sternen beim Aufploppen. */
const STEP_MS = 320;
/** Erster Stern kommt, wenn die Karte steht. */
const FIRST_MS = 260;
const STAR = '★';
const SPARK = '✦';
const SPARKS = 6;

function Spark({ index, delay }: { index: number; delay: number }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.set(withDelay(delay, withTiming(1, { duration: 520, easing: Easing.out(Easing.cubic) })));
  }, [delay, t]);
  const angle = (index / SPARKS) * Math.PI * 2 + 0.3;
  const style = useAnimatedStyle(() => {
    const v = t.get();
    return {
      opacity: v <= 0 ? 0 : 1 - v,
      transform: [{ translateX: Math.cos(angle) * 46 * v }, { translateY: Math.sin(angle) * 46 * v }, { scale: 1.2 - v * 0.6 }],
    };
  });
  return (
    <Animated.View style={[styles.spark, style]}>
      <StrokeText size={16} color={index % 2 === 0 ? sparks.gold : sparks.white} stroke={1.5}>
        {SPARK}
      </StrokeText>
    </Animated.View>
  );
}

function Star({ index, filled }: { index: number; filled: boolean }) {
  const scale = useSharedValue(filled ? 0 : 1);
  const spin = useSharedValue(filled ? -90 : 0);
  const delay = FIRST_MS + index * STEP_MS;
  useEffect(() => {
    if (!filled) return;
    scale.set(withDelay(delay, withSequence(withTiming(1.5, { duration: 150 }), withSpring(1, springs.pop))));
    spin.set(withDelay(delay, withSpring(0, springs.release)));
    const timer = setTimeout(() => cue('collect'), delay + 120);
    return () => clearTimeout(timer);
  }, [delay, filled, scale, spin]);
  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.get() }, { rotate: `${(index - 1) * 14 + spin.get()}deg` }],
  }));
  const size = index === 1 ? 70 : 54;
  return (
    <View style={[styles.slot, { width: size * 1.15, height: size * 1.25 }, index !== 1 && styles.side]}>
      <View style={styles.empty}>
        <StrokeText size={size} color={tones.salt.base}>
          {STAR}
        </StrokeText>
      </View>
      {filled && (
        <>
          {Array.from({ length: SPARKS }, (_, i) => (
            <Spark key={i} index={i} delay={delay + 100} />
          ))}
          <Animated.View style={style}>
            <StrokeText size={size} color={tones.gold.base}>
              {STAR}
            </StrokeText>
          </Animated.View>
        </>
      )}
    </View>
  );
}

export function ResultStars({ stars }: { stars: StarCount }) {
  return (
    <View accessibilityLabel={t.starsLabel(stars)} style={styles.row}>
      {[0, 1, 2].map((i) => (
        <Star key={i} index={i} filled={i < stars} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', gap: 4 },
  slot: { alignItems: 'center', justifyContent: 'center' },
  side: { marginBottom: -6 },
  empty: { position: 'absolute', opacity: 0.55 },
  spark: { position: 'absolute' },
});
