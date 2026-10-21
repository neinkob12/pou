// Ereignis-Banner (Auftrag 45): "Endspurt!", "Schwarm!", "Neuer Rekord!" springen mittig oben auf
// und verblassen. Ein Banner zur Zeit, ein neues ersetzt das alte.

import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, View, type DimensionValue } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { MINIGAME_FUN } from '../../../../game/config';
import { colors, gameRadii, outline, shadows, spacing } from '../../../../lib/theme';
import { StrokeText } from '../StrokeText';

export interface Banner {
  id: number;
  text: string;
  color: string;
}

/** Zustand für ein Banner. `show` geht nur auf dem JS-Thread (aus Worklets per scheduleOnRN). */
export function useBanner(): {
  banner: Banner | null;
  show: (text: string, color?: string) => void;
  clear: () => void;
} {
  const [banner, setBanner] = useState<Banner | null>(null);
  const nextId = useRef(1);
  const show = useCallback((text: string, color: string = colors.coral) => {
    const id = nextId.current;
    nextId.current += 1;
    setBanner({ id, text, color });
  }, []);
  const clear = useCallback(() => setBanner(null), []);
  return { banner, show, clear };
}

/** Einblenden und Ausblenden in ms, dazwischen steht das Banner MINIGAME_FUN.bannerMs. */
const IN_MS = 180;
const OUT_MS = 220;

function BannerText({ banner, onDone }: { banner: Banner; onDone: () => void }) {
  const ms = useSharedValue(0);
  const total = IN_MS + MINIGAME_FUN.bannerMs + OUT_MS;
  useEffect(() => {
    // Eine Animation über die ganze Dauer, damit der Abschluss-Callback sicher kommt (auch im Web).
    ms.set(0);
    ms.set(
      withTiming(total, { duration: total, easing: Easing.linear }, (finished) => {
        if (finished) scheduleOnRN(onDone);
      }),
    );
  }, [banner.id, ms, onDone, total]);
  const style = useAnimatedStyle(() => {
    const v = ms.get();
    if (v < IN_MS) {
      const k = v / IN_MS;
      return { opacity: k, transform: [{ scale: 0.5 + k * 0.65 }, { rotate: `${(1 - k) * -12}deg` }] };
    }
    const hold = v - IN_MS;
    if (hold < 120) return { opacity: 1, transform: [{ scale: 1.15 - (hold / 120) * 0.15 }] };
    const out = v - IN_MS - MINIGAME_FUN.bannerMs;
    if (out <= 0) return { opacity: 1, transform: [{ scale: 1 }] };
    const k = Math.min(1, out / OUT_MS);
    return { opacity: 1 - k, transform: [{ scale: 1 - k * 0.1 }] };
  });
  return (
    <Animated.View style={[styles.pill, { backgroundColor: banner.color }, style]}>
      <View style={styles.shine} />
      <StrokeText size={28} color={colors.white}>
        {banner.text}
      </StrokeText>
    </Animated.View>
  );
}

interface EventBannerProps {
  banner: Banner | null;
  onDone: () => void;
  /** Höhe im Spielfeld; der Rahmen setzt sein Rekord-Banner tiefer als die Banner der Spiele. */
  top?: DimensionValue;
}

export function EventBanner({ banner, onDone, top = '18%' }: EventBannerProps) {
  return (
    <View style={[styles.wrap, { top }]} pointerEvents="none">
      <View style={styles.tilt}>{banner && <BannerText key={banner.id} banner={banner} onDone={onDone} />}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  pill: {
    overflow: 'hidden',
    borderRadius: gameRadii.card,
    borderWidth: outline.thick,
    borderColor: outline.color,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    boxShadow: shadows.pop,
  },
  tilt: { transform: [{ rotate: '-3deg' }] },
  shine: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: '45%',
    backgroundColor: 'rgba(255,255,255,0.28)',
  },
});
