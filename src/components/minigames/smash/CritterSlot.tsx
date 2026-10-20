// Ein Loch auf dem Blatt mit seinem Tier. Platzhalter-Grafik (M1 bis M3 fehlen): Tiere aus
// Skia-Formen, in Einheitsgröße gezeichnet und per Transform an die Lochgröße skaliert.

import { Circle, Group, Line, Oval, vec } from '@shopify/react-native-skia';
import { useDerivedValue, type SharedValue } from 'react-native-reanimated';

import { PEST_SMASH } from '../../../game/config';
import { colors } from '../../../lib/theme';
import type { MinigameClock } from '../framework/session';
import { holeLayout, type CritterKind, type SmashState } from './pestSmash';

/** Tiergröße relativ zur halben Zellbreite. */
const CRITTER_SCALE = 0.6;
const POP_IN_MS = 120;
/** Vier Beinpaare der Spinnmilbe (y-Lage in Einheitsgröße). */
const LEGS = [-0.45, -0.15, 0.15, 0.45];

interface CritterSlotProps {
  hole: number;
  state: SharedValue<SmashState>;
  clock: SharedValue<MinigameClock>;
  size: SharedValue<{ width: number; height: number }>;
}

function useKindOpacity(state: SharedValue<SmashState>, hole: number, kind: CritterKind) {
  return useDerivedValue(() => {
    const c = state.get().critters.find((x) => x.hole === hole);
    if (!c || c.kind !== kind) return 0;
    return c.hitAtMs === null ? 1 : 0.35;
  });
}

export function CritterSlot({ hole, state, clock, size }: CritterSlotProps) {
  const transform = useDerivedValue(() => {
    const { width, height } = size.get();
    const { x, y, cell } = holeLayout(hole, width, height, PEST_SMASH);
    const c = state.get().critters.find((k) => k.hole === hole);
    const elapsed = clock.get().elapsedMs;
    let grow = 1;
    if (c) {
      grow = c.hitAtMs === null ? Math.min(1, (elapsed - c.spawnedAtMs) / POP_IN_MS) : 0.8;
    }
    return [{ translateX: x }, { translateY: y }, { scale: Math.max(0.01, cell * CRITTER_SCALE * grow) }];
  });
  const holeTransform = useDerivedValue(() => {
    const { width, height } = size.get();
    const { x, y, cell } = holeLayout(hole, width, height, PEST_SMASH);
    return [{ translateX: x }, { translateY: y }, { scale: Math.max(0.01, cell * CRITTER_SCALE) }];
  });
  const mite = useKindOpacity(state, hole, 'mite');
  const gnat = useKindOpacity(state, hole, 'gnat');
  const ladybug = useKindOpacity(state, hole, 'ladybug');

  return (
    <>
      <Group transform={holeTransform}>
        <Oval x={-1.1} y={-0.5} width={2.2} height={1.2} color={colors.plantDark} opacity={0.35} />
      </Group>
      <Group transform={transform}>
        {/* Spinnmilbe: rundlich, acht Beine */}
        <Group opacity={mite}>
          {LEGS.map((dy) => (
            <Line key={dy} p1={vec(-0.85, dy * 1.4)} p2={vec(0.85, dy * 1.4)} color={colors.ink} strokeWidth={0.1} />
          ))}
          <Circle cx={0} cy={0} r={0.55} color={colors.terracotta} />
          <Circle cx={-0.18} cy={-0.15} r={0.08} color={colors.ink} />
          <Circle cx={0.18} cy={-0.15} r={0.08} color={colors.ink} />
        </Group>
        {/* Trauermücke: schmaler dunkler Körper, zwei Flügel */}
        <Group opacity={gnat}>
          <Oval x={-0.95} y={-0.7} width={0.9} height={0.55} color={colors.white} opacity={0.85} />
          <Oval x={0.05} y={-0.7} width={0.9} height={0.55} color={colors.white} opacity={0.85} />
          <Oval x={-0.22} y={-0.6} width={0.44} height={1.3} color={colors.night} />
        </Group>
        {/* Marienkäfer: rot mit Punkten, deutlich anders */}
        <Group opacity={ladybug}>
          <Circle cx={0} cy={-0.62} r={0.3} color={colors.ink} />
          <Circle cx={0} cy={0.05} r={0.72} color={colors.coral} />
          <Line p1={vec(0, -0.6)} p2={vec(0, 0.77)} color={colors.ink} strokeWidth={0.07} />
          <Circle cx={-0.35} cy={-0.1} r={0.13} color={colors.ink} />
          <Circle cx={0.35} cy={-0.1} r={0.13} color={colors.ink} />
          <Circle cx={-0.3} cy={0.35} r={0.11} color={colors.ink} />
          <Circle cx={0.3} cy={0.35} r={0.11} color={colors.ink} />
        </Group>
      </Group>
    </>
  );
}
