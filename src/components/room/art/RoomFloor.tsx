import { Group, LinearGradient, Oval, Path, RadialGradient, Rect, vec } from '@shopify/react-native-skia';

import type { RoomLayout } from './roomLayout';
import type { RoomPalette } from './roomPalette';
import { LINE } from './roomShapes';
import type { RoomWeather } from './weather';

// Mittel-Ebene (ART-4): Holzboden mit Fluchtpunkt, Lichtfleck vom Fenster, runder Teppich.

/** Die Dielen laufen auf einen Punkt über der Bildmitte zu: der Boden kippt nach hinten weg. */
const VANISH_ABOVE_FLOOR = 60;
const PLANKS = 9;

export function Floor({ l, p }: { l: RoomLayout; p: RoomPalette }) {
  const { floorY, height } = l;
  const vy = floorY - VANISH_ABOVE_FLOOR;
  const depth = height - floorY;
  // Längsfugen: gleich verteilt an der Vorderkante, zur Wand hin enger.
  const seams = Array.from({ length: PLANKS + 1 }, (_, i) => {
    const front = -30 + (160 / PLANKS) * i;
    const back = 50 + (front - 50) * ((floorY - vy) / (height - vy));
    return `M${back} ${floorY} L${front} ${height}`;
  });
  // Querfugen: nach vorn größer werdende Abstände.
  const rows = [0.08, 0.2, 0.36, 0.56, 0.8].map((f) => floorY + depth * f);
  return (
    <Group>
      <Rect x={0} y={floorY} width={100} height={depth}>
        <LinearGradient start={vec(0, floorY)} end={vec(0, height)} colors={[p.floorBack, p.floorFront]} />
      </Rect>
      <Path path={seams.join(' ')} color={p.plankSeam} style="stroke" strokeWidth={0.45} opacity={0.75} />
      {rows.map((y, i) => (
        <Group key={y}>
          {[0, 1, 2, 3].map((k) => {
            const x = ((k * 31 + i * 17) % 100) - 4;
            return <Rect key={k} x={x} y={y} width={12 + i * 2} height={0.35 + i * 0.08} color={p.plankSeam} opacity={0.7} />;
          })}
        </Group>
      ))}
      {/* Glanz auf den Dielen */}
      <Rect x={0} y={floorY + 0.6} width={100} height={0.6} color={p.plankLight} opacity={0.7} />
      {/* Schatten an der Wandkante */}
      <Rect x={0} y={floorY} width={100} height={4}>
        <LinearGradient start={vec(0, floorY)} end={vec(0, floorY + 4)} colors={[p.shade, p.shadeFade]} />
      </Rect>
    </Group>
  );
}

/** Licht fällt schräg durchs Fenster auf Wand und Boden. Bei Regen nur schwach. */
export function WindowLight({ l, p, weather }: { l: RoomLayout; p: RoomPalette; weather: RoomWeather }) {
  const { x, y, w, h } = l.window;
  const end = l.floorY + 18;
  const strength = weather === 'rain' ? 0.35 : weather === 'cloudy' ? 0.7 : 1;
  return (
    <Group opacity={strength}>
      <Path path={`M${x} ${y + h} L${x + w} ${y + h} L${x + w + 26} ${end} L${x + 8} ${end} Z`}>
        <LinearGradient start={vec(0, y + h)} end={vec(0, end)} colors={[p.beam, p.beamFade]} />
      </Path>
      <Oval x={x + 4} y={l.floorY + 4} width={w + 22} height={9}>
        <RadialGradient c={vec(x + w / 2 + 15, l.floorY + 8.5)} r={(w + 22) / 2} colors={[p.beam, p.beamFade]} />
      </Oval>
    </Group>
  );
}

/** Runder Teppich unter Budi: Rand, Muster-Ring, Fransen, weicher Schatten. */
export function Rug({ l, p }: { l: RoomLayout; p: RoomPalette }) {
  const cy = l.rugY;
  const fringes = Array.from({ length: 26 }, (_, i) => {
    const a = Math.PI * 0.08 + (Math.PI * 0.84 * i) / 25;
    const fx = 50 + Math.cos(a) * 41;
    const fy = cy + Math.sin(a) * 7.1;
    return `M${fx} ${fy} L${fx + Math.cos(a) * 1.2} ${fy + Math.sin(a) * 1.6}`;
  });
  return (
    <Group>
      <Oval x={7} y={cy - 5.8} width={86} height={15} color={p.shade} />
      <Path path={fringes.join(' ')} color={p.rugFringe} style="stroke" strokeWidth={0.6} strokeCap="round" />
      <Oval x={9 - LINE} y={cy - 7 - LINE} width={82 + LINE * 2} height={14 + LINE * 2} color={p.outline} />
      <Oval x={9} y={cy - 7} width={82} height={14}>
        <LinearGradient start={vec(0, cy - 7)} end={vec(0, cy + 7)} colors={[p.rugPattern, p.rugBorder]} />
      </Oval>
      <Oval x={13} y={cy - 5.4} width={74} height={10.8} color={p.rug} />
      <Oval x={17} y={cy - 4.2} width={66} height={8.4} color={p.rugPattern} style="stroke" strokeWidth={0.7} />
      <Oval x={24} y={cy - 2.8} width={52} height={5.6} color={p.rugBorder} opacity={0.35} />
      {/* Glanz oben auf dem Rand */}
      <Path path={`M22 ${cy - 6.2} Q50 ${cy - 8.2} 78 ${cy - 6.2}`} color={p.gloss} style="stroke" strokeWidth={0.6} strokeCap="round" />
    </Group>
  );
}

/** Ränder und Vordergrund leicht abdunkeln, damit Budi in der Mitte leuchtet. */
export function Vignette({ l, p }: { l: RoomLayout; p: RoomPalette }) {
  return (
    <Group>
      <Rect x={0} y={l.floorY} width={100} height={l.height - l.floorY}>
        <LinearGradient start={vec(0, l.floorY + 10)} end={vec(0, l.height)} colors={[p.shadeFade, p.shade]} />
      </Rect>
      <Rect x={0} y={0} width={100} height={l.height}>
        <RadialGradient c={vec(50, l.rugY - 25)} r={l.height * 0.7} colors={[p.shadeFade, p.shadeFade, p.shade]} />
      </Rect>
    </Group>
  );
}
