import { Circle, Group, LinearGradient, Oval, Path, RadialGradient, vec } from '@shopify/react-native-skia';

import { Dresser, Garland, garlandAt, GARLAND_BULBS, HangingPlant, roundLeaf } from './RoomDecor';
import { Floor, Rug, Vignette, WindowLight } from './RoomFloor';
import type { RoomLayout } from './roomLayout';
import { SKY, type RoomPalette } from './roomPalette';
import { LINE } from './roomShapes';
import { Poster, Wainscot, Wall } from './RoomWall';
import { WindowBack } from './RoomWindow';
import type { RoomWeather } from './weather';

// Budis Zimmer (ART-4), in Ebenen: hinten Wand, Fenster, Poster, Kommode; Mitte Boden und Teppich;
// vorn (eigene Leinwand über Budi) eine große Zimmerpflanze und ein Sitzkissen.
// Einheiten: Bildbreite = 100.

interface SceneProps {
  l: RoomLayout;
  p: RoomPalette;
  isDay: boolean;
  weather: RoomWeather;
}

/** Hintergrund und Mitte: alles, was hinter Budi liegt und sich nicht bewegt. */
export function RoomArt({ l, p, isDay, weather }: SceneProps) {
  return (
    <Group>
      <Wall l={l} p={p} />
      <Wainscot l={l} p={p} />
      <WindowBack l={l} p={p} isDay={isDay} weather={weather} />
      <Poster l={l} p={p} isDay={isDay} />
      <HangingPlant l={l} p={p} />
      <Garland l={l} p={p} />
      <Floor l={l} p={p} />
      <WindowLight l={l} p={p} weather={weather} />
      <Dresser l={l} p={p} />
      <Rug l={l} p={p} />
      <Vignette l={l} p={p} />
    </Group>
  );
}

/** Schein der Lichterkette und des Nachtlichts. Liegt auf eigener Leinwand, damit er pulsieren kann. */
export function RoomGlowArt({ l }: { l: RoomLayout }) {
  const bulbs = Array.from({ length: GARLAND_BULBS }, (_, i) => garlandAt(l.garland, (i + 0.5) / GARLAND_BULBS));
  const nx = l.dresser.x + 22.6;
  const ny = l.dresser.y - 7;
  return (
    <Group>
      {bulbs.map((b, i) => {
        const c = SKY.bulbs[i % SKY.bulbs.length];
        return (
          <Circle key={b.x} cx={b.x} cy={b.y + 1.6} r={3.6}>
            <RadialGradient c={vec(b.x, b.y + 1.6)} r={3.6} colors={[`${c}B0`, `${c}00`]} />
          </Circle>
        );
      })}
      <Circle cx={nx} cy={ny} r={11}>
        <RadialGradient c={vec(nx, ny)} r={11} colors={[`${SKY.nightLight}90`, `${SKY.nightLight}00`]} />
      </Circle>
    </Group>
  );
}

/** Vordergrund links: große Zimmerpflanze im Topf, ragt ins Bild. Box in Einheiten (siehe foregroundBox). */
export function ForegroundPlant({ l, p }: { l: RoomLayout; p: RoomPalette }) {
  const baseY = l.rugY + 14;
  const potTop = baseY - 9;
  const leaves = [
    { a: -2.2, s: 15, dx: 6 },
    { a: -1.75, s: 17, dx: 8 },
    { a: -1.25, s: 14, dx: 9 },
    { a: -0.8, s: 11, dx: 10 },
    { a: -2.7, s: 11, dx: 5 },
  ];
  const pot = `M-1 ${potTop} L17 ${potTop} L15 ${baseY + 6} L1 ${baseY + 6} Z`;
  return (
    <Group>
      {leaves.map(({ a, s, dx }) => {
        const path = roundLeaf(dx, potTop + 1, s, a);
        const tipX = dx + Math.cos(a) * s * 0.85;
        const tipY = potTop + 1 + Math.sin(a) * s * 0.85;
        return (
          <Group key={a}>
            <Path path={path}>
              <LinearGradient start={vec(dx, potTop)} end={vec(tipX, tipY)} colors={[p.leafShade, p.leaf, p.leafLight]} />
            </Path>
            <Path path={`M${dx} ${potTop + 1} L${tipX} ${tipY}`} color={p.leafShade} style="stroke" strokeWidth={0.5} />
            <Path path={path} color={p.outline} style="stroke" strokeWidth={LINE} strokeJoin="round" />
          </Group>
        );
      })}
      <Path path={pot}>
        <LinearGradient start={vec(0, 0)} end={vec(17, 0)} colors={[p.pot, p.potShade]} />
      </Path>
      <Path path={pot} color={p.outline} style="stroke" strokeWidth={LINE} strokeJoin="round" />
      <Path path={`M-2 ${potTop - 0.4} L18 ${potTop - 0.4} L18 ${potTop + 2.2} L-2 ${potTop + 2.2} Z`} color={p.potShade} />
      <Path path={`M-2 ${potTop - 0.4} L18 ${potTop - 0.4} L18 ${potTop + 2.2} L-2 ${potTop + 2.2} Z`} color={p.outline} style="stroke" strokeWidth={LINE} />
      <Path path={`M1 ${potTop + 0.3} L15 ${potTop + 0.3}`} color={p.gloss} style="stroke" strokeWidth={0.6} strokeCap="round" />
    </Group>
  );
}

/** Vordergrund rechts: Sitzkissen auf dem Boden. */
export function ForegroundCushion({ l, p }: { l: RoomLayout; p: RoomPalette }) {
  const cy = l.rugY + 10;
  return (
    <Group>
      <Oval x={80} y={cy + 1} width={24} height={6} color={p.shade} />
      <Oval x={81 - LINE} y={cy - 5 - LINE} width={22 + LINE * 2} height={10 + LINE * 2} color={p.outline} />
      <Oval x={81} y={cy - 5} width={22} height={10}>
        <LinearGradient start={vec(0, cy - 5)} end={vec(0, cy + 5)} colors={[p.curtainLight, p.curtainShade]} />
      </Oval>
      <Circle cx={92} cy={cy - 0.4} r={1} color={p.outline} />
      <Path path={`M84 ${cy - 3} Q92 ${cy - 5.2} 100 ${cy - 3}`} color={p.gloss} style="stroke" strokeWidth={0.7} strokeCap="round" />
    </Group>
  );
}

/** Ausschnitt der Vordergrund-Leinwand: vom Wandfuß bis knapp unter den Teppich. */
export function foregroundBox(l: RoomLayout) {
  const y = l.floorY - 12;
  return { x: 0, y, w: 100, h: Math.min(l.height, l.rugY + 22) - y };
}
