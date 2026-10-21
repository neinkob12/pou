import { Circle, Group, LinearGradient, Path, RadialGradient, Rect, vec } from '@shopify/react-native-skia';
import { memo, useMemo } from 'react';
import { StyleSheet } from 'react-native';

import { ArtCanvas } from '../ui/ArtCanvas';
import {
  BACKDROPS,
  dropPath,
  leafPath,
  PATTERN_OPACITY,
  PATTERN_SIZE,
  patternPoints,
  rayAngles,
  sparklePath,
  starAt0,
  type BackdropVariant,
  type PatternShape,
} from './backdrops';

const RAY_COUNT = 7;
const RAY_OPACITY = 0.16;
const LIGHT = 'rgba(255,255,255,0.55)';
const LIGHT_FADE = 'rgba(255,255,255,0)';
const SHADE = 'rgba(30,20,50,0.14)';
const SHADE_FADE = 'rgba(30,20,50,0)';

const PATHS: Record<Exclude<PatternShape, 'coin' | 'seed' | 'diamond'>, string> = {
  leaf: leafPath(PATTERN_SIZE),
  star: starAt0(PATTERN_SIZE),
  sparkle: sparklePath(PATTERN_SIZE),
  drop: dropPath(PATTERN_SIZE),
};

function Shape({ shape, color }: { shape: PatternShape; color: string }) {
  if (shape === 'coin') {
    return (
      <>
        <Circle cx={0} cy={0} r={PATTERN_SIZE * 0.85} color={color} />
        <Circle cx={0} cy={0} r={PATTERN_SIZE * 0.45} color={color} style="stroke" strokeWidth={0.6} opacity={0.6} />
      </>
    );
  }
  if (shape === 'seed') {
    return (
      <Path
        path={`M0 ${-PATTERN_SIZE} C${PATTERN_SIZE * 0.9} ${-PATTERN_SIZE * 0.6} ${PATTERN_SIZE * 0.7} ${PATTERN_SIZE} 0 ${PATTERN_SIZE} C${-PATTERN_SIZE * 0.7} ${PATTERN_SIZE} ${-PATTERN_SIZE * 0.9} ${-PATTERN_SIZE * 0.6} 0 ${-PATTERN_SIZE} Z`}
        color={color}
      />
    );
  }
  if (shape === 'diamond') {
    const r = PATTERN_SIZE * 0.8;
    return <Path path={`M0 ${-r} L${r} 0 L0 ${r} L${-r} 0 Z`} color={color} />;
  }
  return <Path path={PATHS[shape]} color={color} />;
}

interface ScreenBackdropProps {
  variant: BackdropVariant;
  width: number;
  height: number;
}

/**
 * Spiel-Hintergrund eines Screens (ART-5): satter Verlauf, Licht von oben, Muster aus kleinen
 * Spielzeichen (Münzen im Shop, Sterne im Album ...) und weicher Schatten unten. Eine stille
 * Leinwand: zeichnet nur bei neuer Größe neu.
 */
export const ScreenBackdrop = memo(function ScreenBackdrop({ variant, width, height }: ScreenBackdropProps) {
  const b = BACKDROPS[variant];
  const h = width > 0 ? (height / width) * 100 : 0;
  const points = useMemo(() => patternPoints(h, b.shapes), [h, b.shapes]);
  if (width <= 0 || height <= 0) return null;
  return (
    <ArtCanvas width={width} height={height} still style={StyleSheet.absoluteFill}>
      <Rect x={0} y={0} width={100} height={h}>
        <LinearGradient start={vec(0, 0)} end={vec(0, h)} colors={[b.top, b.bottom]} />
      </Rect>
      {b.rays
        ? rayAngles(RAY_COUNT).map((deg) => (
            <Group key={deg} transform={[{ translateX: 50 }, { translateY: -10 }, { rotate: (deg * Math.PI) / 180 }]}>
              <Path path={`M-2 0 L-${9} ${h * 1.2} L${9} ${h * 1.2} L2 0 Z`} color="#FFFFFF" opacity={RAY_OPACITY} />
            </Group>
          ))
        : null}
      <Rect x={0} y={0} width={100} height={h * 0.6}>
        <RadialGradient c={vec(50, 0)} r={70} colors={[LIGHT, LIGHT_FADE]} />
      </Rect>
      <Group opacity={PATTERN_OPACITY}>
        {points.map((p, i) => (
          <Group key={i} transform={[{ translateX: p.x }, { translateY: p.y }, { rotate: (p.rotate * Math.PI) / 180 }]}>
            <Shape shape={p.shape} color={b.pattern} />
          </Group>
        ))}
      </Group>
      <Rect x={0} y={h * 0.7} width={100} height={h * 0.3}>
        <LinearGradient start={vec(0, h * 0.7)} end={vec(0, h)} colors={[SHADE_FADE, SHADE]} />
      </Rect>
    </ArtCanvas>
  );
});
