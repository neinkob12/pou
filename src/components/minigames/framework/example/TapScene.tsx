// Grafik von "Tipp den Kreis" (Auftrag 40): warmer Hintergrund mit Lichtflecken, die Ziel-Knospe mit
// Blütenblättern, Gesicht und einem Ring, der die Restzeit zeigt. Alles aus Skia-Formen.

import { Circle, Group, LinearGradient, Oval, Path, Rect, Skia, vec } from '@shopify/react-native-skia';
import { useDerivedValue, type SharedValue } from 'react-native-reanimated';

import { colors, gameColors } from '../../../../lib/theme';
import type { MinigameClock } from '../session';
import { lifetimeAt, type TapCircle } from './tapCircle';

/** Lichtflecken im Hintergrund: Lage als Anteil der Fläche, Radius als Anteil der Breite. */
const SPOTS = [
  { x: 0.15, y: 0.12, r: 0.22 },
  { x: 0.85, y: 0.3, r: 0.3 },
  { x: 0.3, y: 0.62, r: 0.18 },
  { x: 0.8, y: 0.85, r: 0.26 },
];
const PETALS = [0, 60, 120, 180, 240, 300];
/** Aufgehen der Knospe in ms. */
const GROW_MS = 140;

interface TapSceneProps {
  circle: SharedValue<TapCircle>;
  clock: SharedValue<MinigameClock>;
  size: SharedValue<{ width: number; height: number }>;
}

function Background({ size }: { size: SharedValue<{ width: number; height: number }> }) {
  const w = useDerivedValue(() => size.get().width);
  const h = useDerivedValue(() => size.get().height);
  const end = useDerivedValue(() => vec(0, size.get().height));
  const spots = useDerivedValue(() => {
    const { width, height } = size.get();
    const b = Skia.PathBuilder.Make();
    for (const s of SPOTS) b.addCircle(s.x * width, s.y * height, s.r * width);
    return b.detach();
  });
  return (
    <>
      <Rect x={0} y={0} width={w} height={h}>
        <LinearGradient
          start={vec(0, 0)}
          end={end}
          colors={[gameColors.lampLight, colors.cream, gameColors.coralLight]}
        />
      </Rect>
      <Path path={spots} color={colors.white} opacity={0.35} />
    </>
  );
}

/** Knospe in Einheitsgröße (Radius 1), die Gruppe skaliert auf den Kreisradius. */
function Bud() {
  return (
    <>
      {PETALS.map((deg) => (
        <Group key={deg} transform={[{ rotate: (deg * Math.PI) / 180 }]}>
          <Oval x={-0.36} y={-1.02} width={0.72} height={0.8} color={colors.lavender} />
          <Oval x={-0.22} y={-0.92} width={0.44} height={0.5} color={gameColors.lavenderLight} />
        </Group>
      ))}
      <Circle cx={0} cy={0} r={0.5} color={colors.lamp} />
      <Circle cx={0} cy={0} r={0.5} color={colors.terracotta} style="stroke" strokeWidth={0.05} />
      <Circle cx={-0.17} cy={-0.08} r={0.07} color={colors.ink} />
      <Circle cx={0.17} cy={-0.08} r={0.07} color={colors.ink} />
      <Oval x={-0.12} y={0.08} width={0.24} height={0.16} color={colors.coral} />
    </>
  );
}

export function TapScene({ circle, clock, size }: TapSceneProps) {
  const budTransform = useDerivedValue(() => {
    const c = circle.get();
    const age = clock.get().elapsedMs - c.spawnedAtMs;
    const grow = c.r <= 0 ? 0 : Math.min(1, Math.max(0, age / GROW_MS));
    const wobble = 1 + Math.sin(age / 90) * 0.03;
    return [{ translateX: c.x }, { translateY: c.y }, { scale: Math.max(0.001, c.r * grow * wobble) }];
  });
  const ring = useDerivedValue(() => {
    const c = circle.get();
    const b = Skia.PathBuilder.Make();
    if (c.r <= 0) return b.detach();
    const life = lifetimeAt(c.spawnedAtMs);
    const left = Math.max(0, 1 - (clock.get().elapsedMs - c.spawnedAtMs) / life);
    const rr = c.r + 7;
    b.addArc(Skia.XYWHRect(c.x - rr, c.y - rr, rr * 2, rr * 2), -90, 360 * left);
    return b.detach();
  });
  const ringColor = useDerivedValue(() => {
    const c = circle.get();
    const left = 1 - (clock.get().elapsedMs - c.spawnedAtMs) / lifetimeAt(c.spawnedAtMs);
    return left < 0.3 ? colors.coral : colors.plantLight;
  });

  return (
    <>
      <Background size={size} />
      <Path path={ring} color={ringColor} style="stroke" strokeWidth={5} strokeCap="round" />
      <Group transform={budTransform}>
        <Bud />
      </Group>
    </>
  );
}
