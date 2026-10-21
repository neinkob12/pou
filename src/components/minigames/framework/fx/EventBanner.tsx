// Ereignis-Banner (Auftrag 45): "Endspurt!", "Schwarm!", "Neuer Rekord!" springen mittig oben auf
// und verblassen. Ein Banner zur Zeit, ein neues ersetzt das alte.

import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View, type DimensionValue } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { MINIGAME_FUN } from '../../../../game/config';
import { colors, fonts, radii, spacing } from '../../../../lib/theme';

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

function BannerText({ banner, onDone }: { banner: Banner; onDone: () => void }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.set(0);
    t.set(
      withSequence(
        withSpring(1, { damping: 9, stiffness: 240 }),
        withTiming(1, { duration: MINIGAME_FUN.bannerMs }),
        withTiming(2, { duration: 220 }, (finished) => {
          if (finished) scheduleOnRN(onDone);
        }),
      ),
    );
  }, [banner.id, onDone, t]);
  const style = useAnimatedStyle(() => {
    const v = t.get();
    return {
      opacity: v <= 1 ? Math.min(1, v * 2) : 2 - v,
      transform: [{ scale: v <= 1 ? 0.5 + v * 0.5 : 1 - (v - 1) * 0.1 }],
    };
  });
  return (
    <Animated.View style={[styles.pill, { backgroundColor: banner.color }, style]}>
      <Text style={styles.text}>{banner.text}</Text>
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
      {banner && <BannerText key={banner.id} banner={banner} onDone={onDone} />}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  pill: { borderRadius: radii.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  text: { fontFamily: fonts.headingBold, fontSize: 26, color: colors.white },
});
