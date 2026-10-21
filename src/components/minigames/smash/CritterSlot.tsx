// Ein Loch auf dem Blatt mit seinem Tier (Auftrag 40: eigene Grafik statt Platzhalter). Tiere aus
// Skia-Formen in Einheitsgröße, per Transform an die Lochgröße skaliert. Auftauchen mit Überschwingen,
// Treffer quetscht das Tier platt, Beine und Flügel zappeln mit der Spielzeit.

import { Circle, Group, Line, Oval, vec } from '@shopify/react-native-skia';
import { useDerivedValue, type SharedValue } from 'react-native-reanimated';

import { PEST_SMASH } from '../../../game/config';
import { colors, funColors, gameColors } from '../../../lib/theme';
import type { MinigameClock } from '../framework/session';
import { holeLayout, type CritterKind, type SmashState } from './pestSmash';

/** Tiergröße relativ zur halben Zellbreite. */
const CRITTER_SCALE = 0.6;
const POP_IN_MS = 160;
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
    return c.hitAtMs === null ? 1 : 0.6;
  });
}

/** Auftauchen: wächst über 1 hinaus und federt zurück. */
function popScale(t: number): number {
  'worklet';
  if (t >= 1) return 1;
  return t < 0.7 ? (1.15 * t) / 0.7 : 1.15 - (0.15 * (t - 0.7)) / 0.3;
}

export function Mite({ legWiggle }: { legWiggle: SharedValue<number> }) {
  const legs = useDerivedValue(() => [{ rotate: legWiggle.get() * 0.12 }]);
  return (
    <>
      <Group transform={legs}>
        {LEGS.map((dy) => (
          <Group key={dy}>
            <Line
              p1={vec(-0.45, dy)}
              p2={vec(-0.85, dy * 1.5 + 0.12)}
              color={colors.ink}
              strokeWidth={0.09}
              strokeCap="round"
            />
            <Line
              p1={vec(0.45, dy)}
              p2={vec(0.85, dy * 1.5 + 0.12)}
              color={colors.ink}
              strokeWidth={0.09}
              strokeCap="round"
            />
          </Group>
        ))}
      </Group>
      <Circle cx={0} cy={0.02} r={0.58} color={gameColors.soil} />
      <Circle cx={0} cy={0} r={0.55} color={colors.terracotta} />
      <Circle cx={-0.18} cy={-0.2} r={0.17} color={colors.white} opacity={0.35} />
      <Circle cx={-0.2} cy={-0.1} r={0.13} color={colors.white} />
      <Circle cx={0.2} cy={-0.1} r={0.13} color={colors.white} />
      <Circle cx={-0.18} cy={-0.08} r={0.07} color={colors.ink} />
      <Circle cx={0.22} cy={-0.08} r={0.07} color={colors.ink} />
      <Line p1={vec(-0.32, -0.32)} p2={vec(-0.08, -0.24)} color={colors.ink} strokeWidth={0.07} strokeCap="round" />
      <Line p1={vec(0.32, -0.32)} p2={vec(0.08, -0.24)} color={colors.ink} strokeWidth={0.07} strokeCap="round" />
    </>
  );
}

function Gnat({ legWiggle }: { legWiggle: SharedValue<number> }) {
  const wingL = useDerivedValue(() => [{ translateX: -0.1 }, { rotate: -0.35 - legWiggle.get() * 0.5 }]);
  const wingR = useDerivedValue(() => [{ translateX: 0.1 }, { rotate: 0.35 + legWiggle.get() * 0.5 }]);
  return (
    <>
      <Group transform={wingL}>
        <Oval x={-1.0} y={-0.75} width={0.95} height={0.55} color={gameColors.sky} opacity={0.9} />
      </Group>
      <Group transform={wingR}>
        <Oval x={0.05} y={-0.75} width={0.95} height={0.55} color={gameColors.sky} opacity={0.9} />
      </Group>
      <Oval x={-0.24} y={-0.55} width={0.48} height={1.25} color={colors.night} />
      <Circle cx={0} cy={-0.55} r={0.28} color={colors.night} />
      <Circle cx={-0.11} cy={-0.6} r={0.09} color={colors.coral} />
      <Circle cx={0.11} cy={-0.6} r={0.09} color={colors.coral} />
      <Line p1={vec(-0.1, -0.8)} p2={vec(-0.3, -1.05)} color={colors.night} strokeWidth={0.06} strokeCap="round" />
      <Line p1={vec(0.1, -0.8)} p2={vec(0.3, -1.05)} color={colors.night} strokeWidth={0.06} strokeCap="round" />
    </>
  );
}

/** Panzer der Panzermilbe (Auftrag 45): Platten über dem Rücken, nach dem ersten Treffer weg. */
function Shell() {
  return (
    <>
      <Oval x={-0.62} y={-0.05} width={1.24} height={0.75} color={funColors.shell} />
      <Oval x={-0.5} y={0.02} width={1} height={0.5} color={funColors.shellLight} />
      <Line p1={vec(0, -0.02)} p2={vec(0, 0.68)} color={funColors.shell} strokeWidth={0.07} />
      <Line p1={vec(-0.5, 0.32)} p2={vec(0.5, 0.32)} color={funColors.shell} strokeWidth={0.06} />
      <Oval x={-0.36} y={-0.62} width={0.72} height={0.3} color={funColors.shell} />
    </>
  );
}

function Ladybug() {
  return (
    <>
      <Circle cx={0} cy={-0.62} r={0.32} color={colors.ink} />
      <Circle cx={-0.12} cy={-0.7} r={0.08} color={colors.white} />
      <Circle cx={0.12} cy={-0.7} r={0.08} color={colors.white} />
      <Circle cx={0} cy={0.05} r={0.74} color={colors.ink} />
      <Circle cx={0} cy={0.05} r={0.7} color={colors.coral} />
      <Line p1={vec(0, -0.62)} p2={vec(0, 0.75)} color={colors.ink} strokeWidth={0.07} />
      <Circle cx={-0.35} cy={-0.1} r={0.14} color={colors.ink} />
      <Circle cx={0.35} cy={-0.1} r={0.14} color={colors.ink} />
      <Circle cx={-0.3} cy={0.38} r={0.12} color={colors.ink} />
      <Circle cx={0.3} cy={0.38} r={0.12} color={colors.ink} />
      <Oval x={-0.5} y={-0.35} width={0.3} height={0.18} color={colors.white} opacity={0.45} />
    </>
  );
}

export function CritterSlot({ hole, state, clock, size }: CritterSlotProps) {
  const transform = useDerivedValue(() => {
    const { width, height } = size.get();
    const { x, y, cell } = holeLayout(hole, width, height, PEST_SMASH);
    const c = state.get().critters.find((k) => k.hole === hole);
    const elapsed = clock.get().elapsedMs;
    let sx = 1;
    let sy = 1;
    if (c) {
      if (c.hitAtMs === null) {
        const grow = popScale(Math.min(1, (elapsed - c.spawnedAtMs) / POP_IN_MS));
        sx = grow;
        sy = grow;
      } else {
        // Platt gedrückt: breit und flach.
        const t = Math.min(1, (elapsed - c.hitAtMs) / PEST_SMASH.hitShowMs);
        sx = 1.35 + t * 0.15;
        sy = 0.35 - t * 0.2;
      }
    }
    const k = Math.max(0.01, cell * CRITTER_SCALE);
    return [
      { translateX: x },
      { translateY: y },
      { scaleX: k * Math.max(0.01, sx) },
      { scaleY: k * Math.max(0.01, sy) },
    ];
  });
  const holeTransform = useDerivedValue(() => {
    const { width, height } = size.get();
    const { x, y, cell } = holeLayout(hole, width, height, PEST_SMASH);
    return [{ translateX: x }, { translateY: y }, { scale: Math.max(0.01, cell * CRITTER_SCALE) }];
  });
  const legWiggle = useDerivedValue(() => Math.sin(clock.get().elapsedMs / 45 + hole));
  const mite = useKindOpacity(state, hole, 'mite');
  const gnat = useKindOpacity(state, hole, 'gnat');
  const ladybug = useKindOpacity(state, hole, 'ladybug');
  const armored = useKindOpacity(state, hole, 'armored');
  const shell = useDerivedValue(() => {
    const c = state.get().critters.find((x) => x.hole === hole);
    return c && c.kind === 'armored' && (c.hitsLeft ?? 1) > 1 ? 1 : 0;
  });

  return (
    <>
      <Group transform={holeTransform}>
        <Oval x={-1.15} y={-0.45} width={2.3} height={1.25} color={gameColors.leafLight} />
        <Oval x={-1.05} y={-0.42} width={2.1} height={1.1} color={colors.plantDark} opacity={0.55} />
        <Oval x={-0.9} y={-0.3} width={1.8} height={0.75} color={gameColors.soil} opacity={0.45} />
      </Group>
      <Group transform={transform}>
        <Group opacity={mite}>
          <Mite legWiggle={legWiggle} />
        </Group>
        <Group opacity={gnat}>
          <Gnat legWiggle={legWiggle} />
        </Group>
        <Group opacity={ladybug}>
          <Ladybug />
        </Group>
        <Group opacity={armored} transform={[{ scale: 1.15 }]}>
          <Mite legWiggle={legWiggle} />
          <Group opacity={shell}>
            <Shell />
          </Group>
        </Group>
      </Group>
    </>
  );
}
