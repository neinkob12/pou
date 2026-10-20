import { Circle, Group, LinearGradient, Oval, Path, RadialGradient, RoundedRect, vec } from '@shopify/react-native-skia';

import { artColors } from '../../../lib/theme';

const OUTLINE = 1.6;

/** Pflanzenlampe als Pendelleuchte, Einheiten 100 × 43 (Breite × Höhe). */
export function LampArt({ on }: { on: boolean }) {
  const shade = 'M14 30 Q14 8 50 6 Q86 8 86 30 Z';
  return (
    <Group>
      <RoundedRect x={45} y={0} width={10} height={8} r={2} color={artColors.outline} />
      <Path path={shade} color={artColors.outline} style="stroke" strokeWidth={OUTLINE * 2} strokeJoin="round" />
      <Path path={shade}>
        <LinearGradient start={vec(14, 6)} end={vec(86, 30)} colors={[artColors.metalLight, artColors.metal]} />
      </Path>
      <Path path="M24 22 Q28 12 44 10" color={artColors.frost} opacity={0.45} style="stroke" strokeWidth={2.4} strokeCap="round" />
      <RoundedRect x={10 - OUTLINE} y={29 - OUTLINE} width={80 + OUTLINE * 2} height={8 + OUTLINE * 2} r={4 + OUTLINE} color={artColors.outline} />
      <RoundedRect x={10} y={29} width={80} height={8} r={4} color={on ? artColors.glow : artColors.metal} />
      {[22, 36, 50, 64, 78].map((x) => (
        <Circle key={x} cx={x} cy={33} r={2.2} color={on ? artColors.frost : artColors.metalLight} opacity={on ? 0.95 : 0.6} />
      ))}
    </Group>
  );
}

/** Lichtkegel unter der Lampe, Einheiten 100 × 100. Weich auslaufend. */
export function LightCone() {
  return (
    <Group>
      <Path path="M30 0 L70 0 L100 100 L0 100 Z" opacity={0.32}>
        <LinearGradient start={vec(50, 0)} end={vec(50, 100)} colors={[artColors.glow, artColors.glowFade]} />
      </Path>
      <Oval x={20} y={-12} width={60} height={30}>
        <RadialGradient c={vec(50, 3)} r={30} colors={[artColors.glowSoft, artColors.glowFade]} />
      </Oval>
    </Group>
  );
}
