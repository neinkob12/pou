import { Circle, Group, LinearGradient, Oval, Path, Rect, RoundedRect, vec } from '@shopify/react-native-skia';

import type { RoomLayout } from './roomLayout';
import { SKY, type RoomPalette } from './roomPalette';
import { Box, LINE } from './roomShapes';

// Möbel und Kleinkram (ART-4): Kommode mit Büchern und Nachtlicht, Efeu-Ampel, Lichterkette.
// Einheiten wie RoomArt: Bildbreite = 100.

/** Rundes Blatt (Efeu, Zimmerpflanze), Spitze zeigt in Richtung `angle` (Bogenmaß, 0 = rechts). */
export function roundLeaf(x: number, y: number, size: number, angle: number): string {
  const tx = x + Math.cos(angle) * size;
  const ty = y + Math.sin(angle) * size;
  const nx = -Math.sin(angle) * size * 0.55;
  const ny = Math.cos(angle) * size * 0.55;
  const mx = (x + tx) / 2;
  const my = (y + ty) / 2;
  return `M${x} ${y} Q${mx + nx} ${my + ny} ${tx} ${ty} Q${mx - nx} ${my - ny} ${x} ${y} Z`;
}

/** Punkt auf der durchhängenden Kette (Parabel), t von 0 bis 1. */
export const garlandAt = (g: RoomLayout['garland'], t: number) => ({
  x: g.x1 + (g.x2 - g.x1) * t,
  y: g.y + g.sag * 4 * t * (1 - t),
});

export const GARLAND_BULBS = 9;

/** Lichterkette zwischen Fenster und Poster. Der Schein nachts liegt auf einer eigenen Ebene (pulsiert). */
export function Garland({ l, p }: { l: RoomLayout; p: RoomPalette }) {
  const g = l.garland;
  const mid = garlandAt(g, 0.5);
  const bulbs = Array.from({ length: GARLAND_BULBS }, (_, i) => garlandAt(g, (i + 0.5) / GARLAND_BULBS));
  return (
    <Group>
      <Path path={`M${g.x1} ${g.y} Q${mid.x} ${g.y + g.sag * 2} ${g.x2} ${g.y}`} color={p.outline} style="stroke" strokeWidth={0.45} opacity={0.8} />
      {bulbs.map((b, i) => (
        <Group key={b.x}>
          <Rect x={b.x - 0.4} y={b.y} width={0.8} height={0.7} color={p.outline} />
          <Oval x={b.x - 0.95} y={b.y + 0.5} width={1.9} height={2.3} color={SKY.bulbs[i % SKY.bulbs.length]} />
          <Oval x={b.x - 0.5} y={b.y + 0.8} width={0.6} height={0.8} color="#FFFFFF" opacity={0.7} />
        </Group>
      ))}
    </Group>
  );
}

/** Kommode rechts, steht auf dem Boden. Oben Bücher, Kaktus und ein Nachtlicht. */
export function Dresser({ l, p }: { l: RoomLayout; p: RoomPalette }) {
  const { x, y, w, h } = l.dresser;
  const drawerH = (h - 4) / 2;
  return (
    <Group>
      {/* Schatten auf Boden und Wand */}
      <Oval x={x - 1} y={y + h - 1.5} width={w + 3} height={3.4} color={p.shade} />
      <Rect x={x + w} y={y + 1} width={1.4} height={h - 1} color={p.shade} />
      {/* Füße */}
      <RoundedRect x={x + 1.5} y={y + h - 1} width={2} height={2} r={0.6} color={p.outline} />
      <RoundedRect x={x + w - 3.5} y={y + h - 1} width={2} height={2} r={0.6} color={p.outline} />
      <Box x={x} y={y} w={w} h={h - 0.6} r={1.2} top={p.woodLight} bottom={p.wood} outline={p.outline} />
      {/* Deckplatte steht über */}
      <Box x={x - 1} y={y - 1.4} w={w + 2} h={2} r={0.8} top={p.woodLight} bottom={p.woodShade} outline={p.outline} gloss={p.gloss} />
      {[0, 1].map((i) => {
        const dy = y + 2 + i * (drawerH + 1);
        return (
          <Group key={i}>
            <Box x={x + 1.6} y={dy} w={w - 3.2} h={drawerH - 0.6} r={0.8} top={p.wood} bottom={p.woodShade} outline={p.outline} />
            <Circle cx={x + w / 2} cy={dy + drawerH / 2 - 0.3} r={0.9} color={SKY.sun} />
            <Circle cx={x + w / 2} cy={dy + drawerH / 2 - 0.3} r={0.9} color={p.outline} style="stroke" strokeWidth={0.4} />
          </Group>
        );
      })}
      <DresserTop l={l} p={p} />
    </Group>
  );
}

function DresserTop({ l, p }: { l: RoomLayout; p: RoomPalette }) {
  const { x, y } = l.dresser;
  const top = y - 1.4;
  const books = [
    { dx: 1.6, bw: 2.4, bh: 7.5, c: p.bookA, tilt: 0 },
    { dx: 4.2, bw: 2.1, bh: 8.6, c: p.bookB, tilt: 0 },
    { dx: 6.5, bw: 2.6, bh: 6.8, c: p.bookC, tilt: 0.18 },
  ];
  return (
    <Group>
      {books.map((b) => (
        <Group key={b.dx} transform={[{ rotate: b.tilt }]} origin={vec(x + b.dx + b.bw, top)}>
          <Box x={x + b.dx} y={top - b.bh} w={b.bw} h={b.bh} r={0.5} top={b.c} bottom={b.c} outline={p.outline} gloss={p.gloss} />
          <Rect x={x + b.dx} y={top - b.bh * 0.7} width={b.bw} height={0.5} color={p.paper} opacity={0.8} />
        </Group>
      ))}
      {/* Kaktus im Töpfchen */}
      <Box x={x + 13.2} y={top - 9.4} w={3.4} h={6.4} r={1.7} top={p.leafLight} bottom={p.leaf} outline={p.outline} />
      <Box x={x + 11.4} y={top - 7.6} w={1.8} h={3} r={0.9} top={p.leafLight} bottom={p.leaf} outline={p.outline} />
      <Path path={`M${x + 11.6} ${top - 3.4} L${x + 18.2} ${top - 3.4} L${x + 17.4} ${top} L${x + 12.4} ${top} Z`} color={p.pot} />
      <Path path={`M${x + 11.6} ${top - 3.4} L${x + 18.2} ${top - 3.4} L${x + 17.4} ${top} L${x + 12.4} ${top} Z`} color={p.outline} style="stroke" strokeWidth={LINE * 0.7} strokeJoin="round" />
      <Circle cx={x + 14.9} cy={top - 9.6} r={0.7} color={SKY.bulbs[1]} />
      {/* Nachtlicht: Pilz-Lampe */}
      <NightLight cx={x + 22.6} base={top} p={p} />
    </Group>
  );
}

/** Kleines Pilz-Nachtlicht. Nachts leuchtet der Schirm, der Schein liegt auf der Glüh-Ebene. */
export function NightLight({ cx, base, p }: { cx: number; base: number; p: RoomPalette }) {
  const cap = `M${cx - 3.2} ${base - 4.2} Q${cx} ${base - 9.4} ${cx + 3.2} ${base - 4.2} Z`;
  return (
    <Group>
      <Box x={cx - 1} y={base - 4.4} w={2} h={4.4} r={0.6} top={p.paper} bottom={p.frameShade} outline={p.outline} />
      <Path path={cap}>
        <LinearGradient start={vec(0, base - 9)} end={vec(0, base - 4)} colors={[SKY.nightLight, SKY.bulbs[1]]} />
      </Path>
      <Path path={cap} color={p.outline} style="stroke" strokeWidth={LINE * 0.7} strokeJoin="round" />
      <Circle cx={cx - 1.2} cy={base - 6} r={0.55} color="#FFFFFF" opacity={0.85} />
      <Circle cx={cx + 1.1} cy={base - 5.3} r={0.45} color="#FFFFFF" opacity={0.85} />
    </Group>
  );
}

/** Ampel mit Efeu, hängt rechts oben an einer Schnur. */
export function HangingPlant({ l, p }: { l: RoomLayout; p: RoomPalette }) {
  const { x, y } = l.hanging;
  const vines = [
    { dx: -2.4, len: 10 },
    { dx: 0, len: 15 },
    { dx: 2.4, len: 8 },
  ];
  const pot = `M${x - 3.6} ${y} L${x + 3.6} ${y} L${x + 2.6} ${y + 3.4} L${x - 2.6} ${y + 3.4} Z`;
  return (
    <Group>
      <Path path={`M${x} ${y - 16} L${x - 3.2} ${y} M${x} ${y - 16} L${x + 3.2} ${y}`} color={p.outline} style="stroke" strokeWidth={0.4} opacity={0.8} />
      {vines.map(({ dx, len }) => {
        const leaves = [0.25, 0.5, 0.75, 1].map((f, i) =>
          roundLeaf(x + dx + Math.sin(f * 4) * 0.6, y + 2.6 + len * f, 2.2, i % 2 ? Math.PI * 0.75 : Math.PI * 0.25),
        );
        return (
          <Group key={dx}>
            <Path path={`M${x + dx} ${y + 2} Q${x + dx * 1.8} ${y + 2 + len * 0.5} ${x + dx} ${y + 2 + len}`} color={p.leafShade} style="stroke" strokeWidth={0.45} />
            <Path path={leaves.join(' ')} color={p.leaf} />
            <Path path={leaves.join(' ')} color={p.outline} style="stroke" strokeWidth={0.3} />
          </Group>
        );
      })}
      <Path path={pot}>
        <LinearGradient start={vec(x - 3, 0)} end={vec(x + 3, 0)} colors={[p.pot, p.potShade]} />
      </Path>
      <Path path={pot} color={p.outline} style="stroke" strokeWidth={LINE * 0.7} strokeJoin="round" />
    </Group>
  );
}
