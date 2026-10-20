import { Group, Path } from '@shopify/react-native-skia';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { artColors, colors } from '../../../lib/theme';
import type { CareReaction } from '../../room/care/CareStage';
import { ArtCanvas } from './ArtCanvas';

const FX_MS = 1100;
/** Wie weit die Teilchen in Budi-Höhen aufsteigen. */
const RISE = 0.22;

export type FxKind = 'hearts' | 'drops' | 'sparkles';

export function fxKindFor(reaction: CareReaction | null): FxKind | null {
  if (!reaction || reaction.feedback !== 'success') return null;
  if (reaction.type === 'pet') return 'hearts';
  if (reaction.type === 'water') return 'drops';
  return 'sparkles';
}

const heart = (x: number, y: number, s: number) =>
  `M${x} ${y + s * 0.9} C${x - s * 1.6} ${y - s * 0.1} ${x - s * 0.9} ${y - s * 1.3} ${x} ${y - s * 0.5} ` +
  `C${x + s * 0.9} ${y - s * 1.3} ${x + s * 1.6} ${y - s * 0.1} ${x} ${y + s * 0.9} Z`;
const drop = (x: number, y: number, s: number) =>
  `M${x} ${y - s * 1.3} Q${x + s} ${y} ${x + s * 0.8} ${y + s * 0.5} Q${x} ${y + s * 1.3} ${x - s * 0.8} ${y + s * 0.5} Q${x - s} ${y} ${x} ${y - s * 1.3} Z`;
const star = (x: number, y: number, s: number) =>
  `M${x} ${y - s * 1.5} Q${x} ${y} ${x + s * 1.5} ${y} Q${x} ${y} ${x} ${y + s * 1.5} Q${x} ${y} ${x - s * 1.5} ${y} Q${x} ${y} ${x} ${y - s * 1.5} Z`;

const SPOTS = [
  { x: 24, y: 30, s: 5 },
  { x: 50, y: 14, s: 6.5 },
  { x: 76, y: 28, s: 5.5 },
  { x: 37, y: 42, s: 3.6 },
  { x: 64, y: 44, s: 3.8 },
] as const;

const LOOK: Record<FxKind, { shape: typeof heart; fill: string }> = {
  hearts: { shape: heart, fill: colors.coral },
  drops: { shape: drop, fill: artColors.sweat },
  sparkles: { shape: star, fill: colors.lamp },
};

/** Freude nach der Pflege: Herzen (Streicheln), Tropfen (Gießen), Funkeln (Düngen) steigen auf. */
export function CareFx({ reaction, size }: { reaction: CareReaction | null; size: number }) {
  const kind = fxKindFor(reaction);
  const t = useSharedValue(0);
  const id = reaction?.id ?? 0;
  useEffect(() => {
    if (!kind) return;
    t.value = 0;
    t.value = withTiming(1, { duration: FX_MS });
  }, [kind, id, t]);
  const style = useAnimatedStyle(() => ({
    opacity: t.value === 0 || t.value === 1 ? 0 : Math.min(1, (1 - t.value) * 2.2),
    transform: [{ translateY: -t.value * size * RISE }, { scale: 0.7 + t.value * 0.4 }],
  }));
  if (!kind) return null;
  const { shape, fill } = LOOK[kind];
  return (
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, style]}>
      <ArtCanvas width={size} height={size * 0.6} still>
        <Group>
          {SPOTS.map(({ x, y, s }) => (
            <Group key={x}>
              <Path path={shape(x, y, s)} color={artColors.outline} style="stroke" strokeWidth={1.6} strokeJoin="round" />
              <Path path={shape(x, y, s)} color={fill} />
            </Group>
          ))}
        </Group>
      </ArtCanvas>
    </Animated.View>
  );
}
