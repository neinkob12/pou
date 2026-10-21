import { Group, Path } from '@shopify/react-native-skia';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withTiming, type SharedValue } from 'react-native-reanimated';

import { artColors, colors } from '../../../lib/theme';
import type { CareReaction } from '../../room/care/CareStage';
import { ArtCanvas } from '../../ui/ArtCanvas';
import { fxKindFor, type FxKind } from './careFxKind';

const FX_MS = 1100;
/** Die zweite Welle startet etwas später und steigt höher: wirkt wie einzelne Teilchen. */
const SECOND_WAVE_DELAY_MS = 220;
/** Wie weit die Teilchen in Budi-Höhen aufsteigen. */
const RISE = 0.22;
const DRIFT = 0.04;

export { fxKindFor };

const heart = (x: number, y: number, s: number) =>
  `M${x} ${y + s * 0.9} C${x - s * 1.6} ${y - s * 0.1} ${x - s * 0.9} ${y - s * 1.3} ${x} ${y - s * 0.5} ` +
  `C${x + s * 0.9} ${y - s * 1.3} ${x + s * 1.6} ${y - s * 0.1} ${x} ${y + s * 0.9} Z`;
const drop = (x: number, y: number, s: number) =>
  `M${x} ${y - s * 1.3} Q${x + s} ${y} ${x + s * 0.8} ${y + s * 0.5} Q${x} ${y + s * 1.3} ${x - s * 0.8} ${y + s * 0.5} Q${x - s} ${y} ${x} ${y - s * 1.3} Z`;
const star = (x: number, y: number, s: number) =>
  `M${x} ${y - s * 1.5} Q${x} ${y} ${x + s * 1.5} ${y} Q${x} ${y} ${x} ${y + s * 1.5} Q${x} ${y} ${x - s * 1.5} ${y} Q${x} ${y} ${x} ${y - s * 1.5} Z`;
/** Kleine Grummel-Wolke (zu viel gegossen oder gedüngt). */
const cloud = (x: number, y: number, s: number) =>
  `M${x - s * 1.4} ${y + s * 0.5} Q${x - s * 1.9} ${y - s * 0.3} ${x - s * 0.9} ${y - s * 0.5} Q${x - s * 0.6} ${y - s * 1.4} ${x + s * 0.3} ${y - s * 0.9} ` +
  `Q${x + s * 1.3} ${y - s * 1.3} ${x + s * 1.3} ${y - s * 0.2} Q${x + s * 2} ${y + s * 0.3} ${x + s * 1.3} ${y + s * 0.6} Z`;

const WAVES = [
  [
    { x: 24, y: 30, s: 5 },
    { x: 64, y: 44, s: 3.8 },
    { x: 76, y: 28, s: 5.5 },
  ],
  [
    { x: 50, y: 14, s: 6.5 },
    { x: 37, y: 42, s: 3.6 },
    { x: 84, y: 46, s: 3 },
  ],
] as const;
const GRUMBLE = [[{ x: 72, y: 22, s: 7 }], [{ x: 28, y: 30, s: 4.6 }]] as const;

const LOOK: Record<FxKind, { shape: typeof heart; fill: string }> = {
  hearts: { shape: heart, fill: colors.coral },
  drops: { shape: drop, fill: artColors.sweat },
  sparkles: { shape: star, fill: colors.lamp },
  grumble: { shape: cloud, fill: artColors.metalLight },
};

function Wave({ t, wave, kind, size }: { t: SharedValue<number>; wave: number; kind: FxKind; size: number }) {
  const side = wave === 0 ? -1 : 1;
  const rise = kind === 'grumble' ? RISE * 0.35 : RISE * (1 + wave * 0.3);
  const style = useAnimatedStyle(() => ({
    opacity: t.value === 0 || t.value === 1 ? 0 : Math.min(1, (1 - t.value) * 2.2, t.value * 6),
    transform: [
      { translateY: -t.value * size * rise },
      { translateX: Math.sin(t.value * Math.PI * 2) * size * DRIFT * side },
      { scale: 0.7 + t.value * 0.4 },
    ],
  }));
  const { shape, fill } = LOOK[kind];
  const spots = kind === 'grumble' ? GRUMBLE[wave] : WAVES[wave];
  return (
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, style]}>
      <ArtCanvas width={size} height={size * 0.6} still>
        <Group>
          {spots.map(({ x, y, s }) => (
            <Group key={x}>
              <Path path={shape(x, y, s)} color={artColors.outline} style="stroke" strokeWidth={1.6} strokeJoin="round" />
              <Path path={shape(x, y, s)} color={fill} />
              {kind === 'grumble' ? (
                <Path
                  path={`M${x - s * 0.6} ${y + s * 1.2} l${s * 0.5} ${s * 0.6} l${-s * 0.3} ${s * 0.3} l${s * 0.5} ${s * 0.6}`}
                  color={colors.lamp}
                  style="stroke"
                  strokeWidth={1.4}
                  strokeCap="round"
                  strokeJoin="round"
                />
              ) : null}
            </Group>
          ))}
        </Group>
      </ArtCanvas>
    </Animated.View>
  );
}

/** Rückmeldung nach der Pflege: Herzen, Tropfen oder Funkeln steigen in zwei Wellen auf; zu viel: Grummel-Wolke. */
export function CareFx({ reaction, size }: { reaction: CareReaction | null; size: number }) {
  const kind = fxKindFor(reaction);
  const first = useSharedValue(0);
  const second = useSharedValue(0);
  const id = reaction?.id ?? 0;
  useEffect(() => {
    if (!kind) return;
    const ease = { duration: FX_MS, easing: Easing.out(Easing.quad) };
    first.value = 0;
    second.value = 0;
    first.value = withTiming(1, ease);
    second.value = withDelay(SECOND_WAVE_DELAY_MS, withTiming(1, ease));
  }, [kind, id, first, second]);
  if (!kind) return null;
  return (
    <>
      <Wave t={first} wave={0} kind={kind} size={size} />
      <Wave t={second} wave={1} kind={kind} size={size} />
    </>
  );
}
