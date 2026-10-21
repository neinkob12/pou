import { Circle, Group, LinearGradient, Path, Rect, vec } from '@shopify/react-native-skia';

import type { RoomLayout } from './roomLayout';
import type { RoomPalette } from './roomPalette';
import { SKY } from './roomPalette';
import { Box, LINE } from './roomShapes';

// Hintergrund-Ebene (ART-4): Tapete mit Punkten, Holzverkleidung mit Feldern, Poster.

/** Rauten-Tapete: versetzte Punktreihen, Abstand in Einheiten. */
const DOT_GAP = 7;
/** Kleiner lohnt sich das Poster nicht (sehr kleine Bildschirme). */
const MIN_POSTER_H = 6;

export function Wall({ l, p }: { l: RoomLayout; p: RoomPalette }) {
  const rows = Math.ceil(l.wainscotY / DOT_GAP);
  const dots: string[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c <= 100 / DOT_GAP; c++) {
      const x = c * DOT_GAP + (r % 2 ? DOT_GAP / 2 : 0);
      const y = r * DOT_GAP + 3;
      dots.push(`M${x} ${y - 0.9} L${x + 0.9} ${y} L${x} ${y + 0.9} L${x - 0.9} ${y} Z`);
    }
  }
  return (
    <Group>
      <Rect x={0} y={0} width={100} height={l.floorY}>
        <LinearGradient start={vec(0, 0)} end={vec(0, l.floorY)} colors={[p.wallTop, p.wallBottom]} />
      </Rect>
      <Path path={dots.join(' ')} color={p.wallDot} />
    </Group>
  );
}

/** Holzverkleidung unten an der Wand mit Feldern und hellem Abschluss, dazu Fußleiste. */
export function Wainscot({ l, p }: { l: RoomLayout; p: RoomPalette }) {
  const y = l.wainscotY;
  const h = l.floorY - y;
  const panels = Array.from({ length: 6 }, (_, i) => i * 17 + 1.5);
  return (
    <Group>
      <Rect x={0} y={y} width={100} height={h}>
        <LinearGradient start={vec(0, y)} end={vec(0, l.floorY)} colors={[p.wainscotLight, p.wainscot]} />
      </Rect>
      {panels.map((x) => (
        <Group key={x}>
          <Rect x={x} y={y + 1.8} width={14} height={h - 4} color={p.wainscotShade} opacity={0.55} />
          <Rect x={x} y={y + 1.8} width={14} height={0.5} color={p.outline} opacity={0.35} />
          <Rect x={x} y={y + h - 2.7} width={14} height={0.5} color={p.wainscotLight} opacity={0.8} />
        </Group>
      ))}
      {/* Abschlussleiste oben */}
      <Rect x={0} y={y - 1.4} width={100} height={1.8} color={p.rail} />
      <Rect x={0} y={y - 1.4 - LINE / 2} width={100} height={LINE / 2} color={p.outline} opacity={0.7} />
      <Rect x={0} y={y + 0.4} width={100} height={LINE / 2} color={p.outline} opacity={0.7} />
      {/* Fußleiste */}
      <Rect x={0} y={l.floorY - 1.6} width={100} height={1.6} color={p.rail} />
      <Rect x={0} y={l.floorY - 1.6 - LINE / 2} width={100} height={LINE / 2} color={p.outline} opacity={0.6} />
    </Group>
  );
}

/** Poster über der Kommode: Sonne über Hügeln, aufgeklebt mit Klebeband. */
export function Poster({ l, p, isDay }: { l: RoomLayout; p: RoomPalette; isDay: boolean }) {
  const { x, y, w, h } = l.poster;
  if (h < MIN_POSTER_H) return null;
  const cx = x + w / 2;
  const hill = `M${x + 1} ${y + h - 1} Q${x + w * 0.3} ${y + h * 0.5} ${cx} ${y + h * 0.7} Q${x + w * 0.75} ${y + h * 0.55} ${x + w - 1} ${y + h * 0.68} L${x + w - 1} ${y + h - 1} Z`;
  return (
    <Group transform={[{ rotate: -0.04 }]} origin={vec(cx, y)}>
      {/* Schatten nach unten rechts */}
      <Rect x={x + 0.9} y={y + 1.1} width={w} height={h} color={p.shade} />
      <Box x={x} y={y} w={w} h={h} r={0.6} top={p.paper} bottom={p.paper} outline={p.outline} />
      <Rect x={x + 1} y={y + 1} width={w - 2} height={h - 2}>
        <LinearGradient start={vec(0, y)} end={vec(0, y + h)} colors={[p.skyTop, p.skyBottom]} />
      </Rect>
      <Circle cx={x + w * 0.68} cy={y + h * 0.32} r={w * 0.17} color={isDay ? SKY.sun : SKY.moon} />
      <Circle cx={x + w * 0.68} cy={y + h * 0.32} r={w * 0.17} color={p.outline} style="stroke" strokeWidth={0.4} />
      <Path path={hill} color={p.hillNear} />
      <Path path={hill} color={p.outline} style="stroke" strokeWidth={0.4} />
      {/* Klebeband in den Ecken */}
      <Rect x={x - 1.2} y={y - 0.8} width={4} height={1.6} color={p.gloss} transform={[{ rotate: -0.6 }]} origin={vec(x, y)} />
      <Rect x={x + w - 2.6} y={y - 0.8} width={4} height={1.6} color={p.gloss} transform={[{ rotate: 0.6 }]} origin={vec(x + w, y)} />
    </Group>
  );
}
