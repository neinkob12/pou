import { useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { artColors, colors } from '../../lib/theme';
import { makeConfetti, type ConfettiPiece } from './rewardFx';

const CONFETTI_COLORS = [colors.coral, colors.lamp, colors.lavender, colors.plantLight, artColors.glaze];
/** Start knapp über dem oberen Rand. */
const START_Y = -24;

function Piece({
  piece,
  width,
  height,
  playKey,
}: {
  piece: ConfettiPiece;
  width: number;
  height: number;
  playKey: number;
}) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = 0;
    t.value = withDelay(piece.delayMs, withTiming(1, { duration: piece.durationMs, easing: Easing.in(Easing.quad) }));
  }, [playKey, piece.delayMs, piece.durationMs, t]);
  const style = useAnimatedStyle(() => ({
    opacity: t.value <= 0 ? 0 : t.value > 0.85 ? (1 - t.value) / 0.15 : 1,
    transform: [
      { translateX: piece.x * width + Math.sin(t.value * Math.PI * 3) * piece.sway },
      { translateY: START_Y + t.value * (height - START_Y) },
      { rotate: `${t.value * piece.spin * 360}deg` },
      // Kippen um die eigene Achse: das Stück blitzt beim Drehen schmal und breit.
      { scaleX: 0.35 + 0.65 * Math.abs(Math.cos(t.value * piece.spin * 9)) },
    ],
  }));
  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: 0,
          top: 0,
          width: piece.width,
          height: piece.height,
          borderRadius: piece.round ? piece.width / 2 : 2,
          backgroundColor: CONFETTI_COLORS[piece.colorIndex],
          borderWidth: 1.5,
          borderColor: colors.plantDark,
        },
        style,
      ]}
    />
  );
}

/**
 * Konfetti regnet über die ganze Fläche (ART-5), etwa bei Ernte, neuer Sorte oder Level.
 * Neuer `playKey` startet es neu. Bei "Bewegung reduzieren" bleibt es aus.
 */
export function Confetti({ count = 36, playKey = 0 }: { count?: number; playKey?: number }) {
  const reduced = useReducedMotion();
  const pieces = useMemo(() => makeConfetti(count, CONFETTI_COLORS.length), [count]);
  const [size, setSize] = useState({ width: 0, height: 0 });
  if (reduced) return null;
  return (
    <View
      pointerEvents="none"
      style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, overflow: 'hidden' }}
      onLayout={(e) => setSize({ width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height })}
    >
      {size.width > 0
        ? pieces.map((p, i) => <Piece key={i} piece={p} width={size.width} height={size.height} playKey={playKey} />)
        : null}
    </View>
  );
}
