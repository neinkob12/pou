import { Circle, Group, LinearGradient, Oval, Path, RadialGradient, Rect, RoundedRect, vec } from '@shopify/react-native-skia';

import type { RoomLayout } from './roomLayout';
import { SKY, type RoomPalette } from './roomPalette';
import { Box, LINE } from './roomShapes';
import type { RoomWeather } from './weather';

// Fenster mit Blick nach draußen (ART-4). Hinten: Rahmen, Himmel, Hügel, Sonne oder Mond.
// Vorn (eigene Leinwand über den ziehenden Wolken): Fensterkreuz, Spiegelung, Brett, Stange.

const FRAME = 2;

function skyColors(p: RoomPalette, isDay: boolean, weather: RoomWeather): [string, string] {
  if (weather === 'rain') return isDay ? [SKY.rainSky, p.skyBottom] : [p.skyTop, SKY.cloudNight];
  return [p.skyTop, p.skyBottom];
}

export function WindowBack({ l, p, isDay, weather }: { l: RoomLayout; p: RoomPalette; isDay: boolean; weather: RoomWeather }) {
  const { x, y, w, h } = l.window;
  const sunX = x + w * 0.7;
  const sunY = y + h * 0.3;
  const r = w * 0.12;
  const showSky = weather !== 'rain';
  const far = `M${x} ${y + h * 0.72} Q${x + w * 0.25} ${y + h * 0.55} ${x + w * 0.5} ${y + h * 0.68} Q${x + w * 0.78} ${y + h * 0.5} ${x + w} ${y + h * 0.64} L${x + w} ${y + h} L${x} ${y + h} Z`;
  const near = `M${x} ${y + h * 0.86} Q${x + w * 0.4} ${y + h * 0.7} ${x + w} ${y + h * 0.84} L${x + w} ${y + h} L${x} ${y + h} Z`;
  return (
    <Group>
      {/* Schatten des Fensters auf der Wand */}
      <RoundedRect x={x - FRAME + 1} y={y - FRAME + 1.4} width={w + FRAME * 2} height={h + FRAME * 2} r={2} color={p.shade} />
      <Box x={x - FRAME} y={y - FRAME} w={w + FRAME * 2} h={h + FRAME * 2} r={2} top={p.frameLight} bottom={p.frame} outline={p.outline} />
      <Group clip={{ x, y, width: w, height: h }}>
        <Rect x={x} y={y} width={w} height={h}>
          <LinearGradient start={vec(0, y)} end={vec(0, y + h)} colors={skyColors(p, isDay, weather)} />
        </Rect>
        {showSky ? (
          <Group>
            <Circle cx={sunX} cy={sunY} r={r * 2.4}>
              <RadialGradient
                c={vec(sunX, sunY)}
                r={r * 2.4}
                colors={isDay ? [SKY.sunGlow, SKY.sunGlowFade] : [SKY.moonGlow, SKY.moonGlowFade]}
              />
            </Circle>
            <Circle cx={sunX} cy={sunY} r={r} color={isDay ? SKY.sun : SKY.moon} />
            {isDay ? null : <Circle cx={sunX + r * 0.5} cy={sunY - r * 0.35} r={r * 0.85} color={p.skyTop} />}
          </Group>
        ) : null}
        {weather === 'cloudy' && isDay ? (
          <Group>
            <Oval x={x + w * 0.5} y={sunY} width={w * 0.5} height={h * 0.14} color={SKY.cloudDay} opacity={0.92} />
            <Oval x={x + w * 0.58} y={sunY - h * 0.06} width={w * 0.26} height={h * 0.16} color={SKY.cloudDay} opacity={0.92} />
          </Group>
        ) : null}
        <Path path={far} color={p.hillFar} />
        <Path path={near} color={p.hillNear} />
        {/* Baum auf dem nahen Hügel */}
        <Rect x={x + w * 0.24} y={y + h * 0.7} width={0.9} height={h * 0.1} color={p.woodShade} />
        <Circle cx={x + w * 0.245} cy={y + h * 0.66} r={w * 0.08} color={p.hillShade} />
        <Circle cx={x + w * 0.23} cy={y + h * 0.645} r={w * 0.045} color={p.hillFar} opacity={0.6} />
      </Group>
    </Group>
  );
}

export function WindowFront({ l, p, isDay }: { l: RoomLayout; p: RoomPalette; isDay: boolean }) {
  const { x, y, w, h } = l.window;
  const bar = 1.3;
  return (
    <Group>
      {/* Spiegelung im Glas */}
      <Path path={`M${x + w * 0.08} ${y + h * 0.4} L${x + w * 0.3} ${y + h * 0.06} L${x + w * 0.4} ${y + h * 0.06} L${x + w * 0.18} ${y + h * 0.4} Z`} color={p.gloss} opacity={isDay ? 0.7 : 0.5} />
      <Path path={`M${x + w * 0.58} ${y + h * 0.92} L${x + w * 0.8} ${y + h * 0.56} L${x + w * 0.85} ${y + h * 0.56} L${x + w * 0.63} ${y + h * 0.92} Z`} color={p.gloss} opacity={isDay ? 0.5 : 0.35} />
      {/* Innere Kante: Glas sitzt im Rahmen */}
      <Rect x={x} y={y} width={w} height={h} color={p.outline} style="stroke" strokeWidth={LINE * 0.7} />
      {/* Fensterkreuz */}
      <Box x={x + w / 2 - bar / 2} y={y} w={bar} h={h} r={0.3} top={p.frameLight} bottom={p.frame} outline={p.outline} />
      <Box x={x} y={y + h * 0.45 - bar / 2} w={w} h={bar} r={0.3} top={p.frameLight} bottom={p.frame} outline={p.outline} />
      {/* Fensterbrett mit kleinem Topf */}
      <Box x={x - 4} y={y + h + FRAME} w={w + 8} h={2.4} r={0.8} top={p.woodLight} bottom={p.woodShade} outline={p.outline} gloss={p.gloss} />
      <Path path={`M${x + 2} ${y + h + FRAME - 3.6} L${x + 7} ${y + h + FRAME - 3.6} L${x + 6.2} ${y + h + FRAME} L${x + 2.8} ${y + h + FRAME} Z`} color={p.pot} />
      <Path path={`M${x + 2} ${y + h + FRAME - 3.6} L${x + 7} ${y + h + FRAME - 3.6} L${x + 6.2} ${y + h + FRAME} L${x + 2.8} ${y + h + FRAME} Z`} color={p.outline} style="stroke" strokeWidth={0.5} />
      {[-1.6, 0, 1.6].map((dx) => (
        <Oval key={dx} x={x + 4.5 + dx - 1} y={y + h + FRAME - 6.6 + Math.abs(dx) * 0.6} width={2} height={3.6} color={p.leaf} />
      ))}
      {/* Vorhangstange */}
      <Box x={x - 6} y={y - FRAME - 3.6} w={w + 12} h={1.4} r={0.7} top={p.woodLight} bottom={p.woodShade} outline={p.outline} />
      <Circle cx={x - 6} cy={y - FRAME - 2.9} r={1.3} color={p.woodShade} />
      <Circle cx={x + w + 6} cy={y - FRAME - 2.9} r={1.3} color={p.woodShade} />
    </Group>
  );
}

/** Ein Vorhang, links gezeichnet, Einheiten 10 × Fensterhöhe + 8. Rechts wird gespiegelt. */
export function CurtainArt({ h, p }: { h: number; p: RoomPalette }) {
  const outer = `M0.8 0.8 L9 0.8 Q6.4 ${h * 0.35} 8 ${h * 0.6} Q9.4 ${h * 0.8} 6.6 ${h - 0.8} L1.4 ${h - 0.8} Q0 ${h * 0.6} 0.8 0.8 Z`;
  return (
    <Group>
      <Path path={outer}>
        <LinearGradient start={vec(0, 0)} end={vec(10, 0)} colors={[p.curtainShade, p.curtain, p.curtainLight, p.curtain]} />
      </Path>
      {/* Falten */}
      <Path path={`M3.4 1 Q2.8 ${h * 0.5} 3.6 ${h - 1}`} color={p.curtainShade} style="stroke" strokeWidth={0.6} opacity={0.8} />
      <Path path={`M6 1 Q5 ${h * 0.4} 5.6 ${h * 0.62}`} color={p.curtainShade} style="stroke" strokeWidth={0.5} opacity={0.6} />
      <Path path={outer} color={p.outline} style="stroke" strokeWidth={LINE} strokeJoin="round" />
      {/* Raffhalter */}
      <RoundedRect x={1.4} y={h * 0.6 - 0.8} width={7.4} height={1.8} r={0.9} color={SKY.sun} />
      <RoundedRect x={1.4} y={h * 0.6 - 0.8} width={7.4} height={1.8} r={0.9} color={p.outline} style="stroke" strokeWidth={0.5} />
      {/* Ringe an der Stange */}
      {[2, 5, 8].map((cx) => (
        <Circle key={cx} cx={cx} cy={0.9} r={0.7} color={p.outline} />
      ))}
    </Group>
  );
}
