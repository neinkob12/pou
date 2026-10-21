import { Circle, Group, LinearGradient, Path, RadialGradient, Rect, vec } from '@shopify/react-native-skia';

import { artColors, colors } from '../../../lib/theme';
import { fanLeaf } from '../../budi/art/geometry';
import type { RoomLayout } from './roomLayout';

// Kleine Details fürs Zimmer (WEB-4): Lichterkette, Hängepflanze, Mondlicht, Tiefe.
// Einheiten wie RoomArt: Bildbreite = 100.

const BULB_COLORS = [colors.lamp, colors.coral, colors.lavender, artColors.sweat, colors.plantLight];

/** Punkt auf der durchhängenden Kette (Parabel), t von 0 bis 1. */
const garlandAt = (g: RoomLayout['garland'], t: number) => ({
  x: g.x1 + (g.x2 - g.x1) * t,
  y: g.y + g.sag * 4 * t * (1 - t),
});

/** Lichterkette zwischen Fenster und Regal. Nachts leuchten die Birnen mit Schein. */
export function Garland({ l, isDay }: { l: RoomLayout; isDay: boolean }) {
  const g = l.garland;
  const mid = garlandAt(g, 0.5);
  const bulbs = Array.from({ length: 9 }, (_, i) => garlandAt(g, (i + 0.5) / 9));
  return (
    <Group>
      <Path
        path={`M${g.x1} ${g.y} Q${mid.x} ${g.y + g.sag * 2} ${g.x2} ${g.y}`}
        color={artColors.outline}
        style="stroke"
        strokeWidth={0.4}
        opacity={0.7}
      />
      {bulbs.map((b, i) => {
        const c = BULB_COLORS[i % BULB_COLORS.length];
        return (
          <Group key={b.x}>
            {isDay ? null : (
              <Circle cx={b.x} cy={b.y + 1.4} r={3.2}>
                <RadialGradient c={vec(b.x, b.y + 1.4)} r={3.2} colors={[`${c}AA`, `${c}00`]} />
              </Circle>
            )}
            <Rect x={b.x - 0.35} y={b.y} width={0.7} height={0.6} color={artColors.outline} />
            <Circle cx={b.x} cy={b.y + 1.4} r={0.95} color={c} opacity={isDay ? 0.85 : 1} />
          </Group>
        );
      })}
    </Group>
  );
}

/** Ampel mit Efeu, hängt über dem Regal. */
export function HangingPlant({ l, isDay }: { l: RoomLayout; isDay: boolean }) {
  const x = l.shelf.x + 18;
  const y = l.garland.y - 2;
  const vines = [
    { dx: -2.6, len: 9 },
    { dx: 0, len: 13 },
    { dx: 2.6, len: 7 },
  ];
  return (
    <Group opacity={isDay ? 1 : 0.8}>
      <Path path={`M${x} ${y - 14} L${x - 3} ${y} M${x} ${y - 14} L${x + 3} ${y}`} color={artColors.string} style="stroke" strokeWidth={0.35} />
      {vines.map(({ dx, len }) => {
        const leaves = [0.3, 0.6, 0.9].flatMap((f, i) => fanLeaf({ x: x + dx, y: y + 2 + len * f }, i % 2 ? 140 : 220, 2.4, 1));
        return (
          <Group key={dx}>
            <Path path={`M${x + dx} ${y + 2} Q${x + dx * 1.6} ${y + 2 + len * 0.5} ${x + dx} ${y + 2 + len}`} color={artColors.leafShade} style="stroke" strokeWidth={0.4} />
            {leaves.map((leaf) => (
              <Path key={leaf.shape} path={leaf.shape} color={artColors.leaf} />
            ))}
          </Group>
        );
      })}
      <Path path={`M${x - 3.6} ${y} L${x + 3.6} ${y} L${x + 2.6} ${y + 3} L${x - 2.6} ${y + 3} Z`} color={artColors.outline} />
      <Path path={`M${x - 3} ${y + 0.4} L${x + 3} ${y + 0.4} L${x + 2.2} ${y + 2.5} L${x - 2.2} ${y + 2.5} Z`} color={artColors.potRim} />
    </Group>
  );
}

/** Nachts fällt Mondlicht aus dem Fenster schräg auf den Boden. */
export function Moonbeam({ l }: { l: RoomLayout }) {
  const { x, y, w, h } = l.window;
  return (
    <Path path={`M${x} ${y + h} L${x + w} ${y + h} L${x + w + 22} ${l.floorY + 16} L${x + 6} ${l.floorY + 16} Z`} opacity={0.5}>
      <LinearGradient start={vec(0, y + h)} end={vec(0, l.floorY + 16)} colors={[artColors.moonGlow, artColors.moonGlowFade]} />
    </Path>
  );
}

/** Tiefe: Schatten an der Wandkante, Boden nach vorn dunkler, Ecken leicht abgedunkelt. */
export function Depth({ l, isDay }: { l: RoomLayout; isDay: boolean }) {
  return (
    <Group>
      <Rect x={0} y={l.floorY} width={100} height={3}>
        <LinearGradient start={vec(0, l.floorY)} end={vec(0, l.floorY + 3)} colors={[artColors.shadow, artColors.shadowFade]} />
      </Rect>
      <Rect x={0} y={l.floorY} width={100} height={l.height - l.floorY}>
        <LinearGradient start={vec(0, l.floorY)} end={vec(0, l.height)} colors={[artColors.shadowFade, artColors.shadow]} />
      </Rect>
      <Rect x={0} y={0} width={100} height={l.height}>
        <RadialGradient
          c={vec(50, l.height * 0.55)}
          r={l.height * 0.75}
          colors={[artColors.shadowFade, artColors.shadowFade, isDay ? artColors.shadow : artColors.shadowNight]}
        />
      </Rect>
    </Group>
  );
}
