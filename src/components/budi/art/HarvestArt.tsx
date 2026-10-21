import { Circle, Group, Oval, Path, RoundedRect } from '@shopify/react-native-skia';

import { artColors, colors } from '../../../lib/theme';
import { starPath } from '../../ui/icons/shapes';
import { fanLeaf } from './geometry';
import type { PlantPalette } from './palette';

const OUTLINE = 1.7;

function Ball({ x, y, r, fill }: { x: number; y: number; r: number; fill: string }) {
  return (
    <Group>
      <Circle cx={x} cy={y} r={r + OUTLINE / 2} color={artColors.outline} />
      <Circle cx={x} cy={y} r={r} color={fill} />
      <Circle cx={x - r * 0.3} cy={y - r * 0.35} r={r * 0.3} color={artColors.frost} opacity={0.5} />
    </Group>
  );
}

/** Knospe aus drei Kugeln, Spitze nach unten (hängt) oder oben (liegt in der Kiste). */
function Cluster({ x, y, r, down, palette }: { x: number; y: number; r: number; down: boolean; palette: PlantPalette }) {
  const s = down ? 1 : -1;
  return (
    <Group>
      <Ball x={x - r * 0.55} y={y} r={r * 0.7} fill={palette.budShade} />
      <Ball x={x + r * 0.55} y={y} r={r * 0.7} fill={palette.budShade} />
      <Ball x={x} y={y + s * r * 0.6} r={r * 0.75} fill={palette.bud} />
    </Group>
  );
}

/** B7: Budi hängt kopfüber an der Leine zum Trocknen. */
function Drying({ palette }: { palette: PlantPalette }) {
  const branches = [
    { x: 34, len: 46 },
    { x: 50, len: 56 },
    { x: 66, len: 44 },
  ];
  return (
    <Group>
      <Path path="M4 16 Q50 24 96 16" color={artColors.string} style="stroke" strokeWidth={1.4} strokeCap="round" />
      {branches.map(({ x, len }) => {
        const top = 20;
        const leaves = [0.35, 0.62].flatMap((f) =>
          [-1, 1].flatMap((side) => fanLeaf({ x, y: top + len * f }, 180 + side * 55, 9, 5)),
        );
        return (
          <Group key={x}>
            {leaves.map((l, i) => (
              <Path key={`o${i}`} path={l.shape} color={artColors.outline} style="stroke" strokeWidth={OUTLINE} strokeJoin="round" />
            ))}
            {leaves.map((l, i) => (
              <Path key={`f${i}`} path={l.shape} color={artColors.leafShade} />
            ))}
            <Path path={`M${x} ${top} L${x} ${top + len}`} color={artColors.outline} style="stroke" strokeWidth={3.6} strokeCap="round" />
            <Path path={`M${x} ${top} L${x} ${top + len}`} color={artColors.stem} style="stroke" strokeWidth={2} strokeCap="round" />
            <Cluster x={x} y={top + len * 0.5} r={4.2} down palette={palette} />
            <Cluster x={x} y={top + len * 0.78} r={4.6} down palette={palette} />
            <Cluster x={x} y={top + len} r={5.4} down palette={palette} />
            {/* Klammer */}
            <RoundedRect x={x - 2.6} y={top - 7.5} width={5.2} height={9} r={1.6} color={artColors.outline} />
            <RoundedRect x={x - 1.8} y={top - 6.7} width={3.6} height={7.4} r={1.2} color={artColors.wood} />
          </Group>
        );
      })}
    </Group>
  );
}

/** Kleines Blatt, das zwischen den Knospen aus der Kiste schaut. */
function CrateLeaf({ x, y, angle, palette }: { x: number; y: number; angle: number; palette: PlantPalette }) {
  const leaf = fanLeaf({ x, y }, angle, 10, 5);
  return (
    <Group>
      {leaf.map((l, i) => (
        <Path key={`o${i}`} path={l.shape} color={artColors.outline} style="stroke" strokeWidth={OUTLINE} strokeJoin="round" />
      ))}
      {leaf.map((l, i) => (
        <Path key={`f${i}`} path={l.shape} color={palette.leafBack} />
      ))}
    </Group>
  );
}

/** B8: Erntekiste aus Holz voller Knospen, mit Stern-Schleife (docs/ASSETS.md). */
function Crate({ palette }: { palette: PlantPalette }) {
  const buds = [
    { x: 27, y: 58, r: 6.5 },
    { x: 73, y: 58, r: 6.5 },
    { x: 39, y: 54, r: 7.5 },
    { x: 61, y: 54, r: 7.5 },
    { x: 50, y: 56, r: 8 },
    { x: 33, y: 47, r: 6 },
    { x: 67, y: 47, r: 6 },
    { x: 44, y: 44, r: 7 },
    { x: 56, y: 44, r: 7 },
    { x: 50, y: 36, r: 7.5 },
  ];
  return (
    <Group>
      {/* Schatten */}
      <Oval x={10} y={90} width={80} height={7} color={artColors.outline} opacity={0.18} />
      <CrateLeaf x={22} y={56} angle={-60} palette={palette} />
      <CrateLeaf x={78} y={56} angle={60} palette={palette} />
      <CrateLeaf x={50} y={40} angle={-10} palette={palette} />
      {buds.map((b, i) => (
        <Cluster key={i} x={b.x} y={b.y} r={b.r} down={false} palette={palette} />
      ))}
      {/* Härchen auf den oberen Knospen */}
      {buds.slice(5).map((b) => (
        <Path
          key={`p${b.x}${b.y}`}
          path={`M${b.x - 1.5} ${b.y - b.r * 0.9} q-1.5 -2.5 -3 -2 M${b.x + 1.5} ${b.y - b.r * 0.8} q2 -2 3.5 -1`}
          color={palette.pistil}
          style="stroke"
          strokeWidth={1}
          strokeCap="round"
        />
      ))}
      {/* Kiste: Rückwand-Kante, Front mit Latten, Eckpfosten, Nägel */}
      <RoundedRect x={12} y={58} width={76} height={36} r={4} color={artColors.outline} />
      <RoundedRect x={14} y={60} width={72} height={32} r={3} color={artColors.wood} />
      {[0, 1, 2].map((i) => (
        <Group key={i}>
          <RoundedRect x={19} y={61.5 + i * 10} width={62} height={8.6} r={1.6} color={i === 1 ? artColors.woodShade : artColors.wood} />
          <Path path={`M24 ${64 + i * 10} L40 ${64 + i * 10}`} color={artColors.potLight} opacity={0.5} style="stroke" strokeWidth={0.8} strokeCap="round" />
        </Group>
      ))}
      {[14, 79].map((x) => (
        <Group key={x}>
          <RoundedRect x={x} y={58.5} width={7} height={35} r={2} color={artColors.outline} />
          <RoundedRect x={x + 1} y={59.5} width={5} height={33} r={1.5} color={artColors.woodShade} />
          {[63, 88].map((y) => (
            <Circle key={y} cx={x + 3.5} cy={y} r={0.9} color={artColors.outline} />
          ))}
        </Group>
      ))}
      {/* Stern-Schleife */}
      <Path path="M21 72 L79 72 L79 79 L21 79 Z" color={artColors.ribbon} />
      <Path path="M21 79 L79 79" color={artColors.ribbonShade} style="stroke" strokeWidth={1.4} />
      <Path path="M44 76 L36 90 L40 89 L42 93 L48 80 Z" color={artColors.outline} />
      <Path path="M45 77 L38 89 L41 88.5 L42.5 91 L47 80 Z" color={artColors.ribbonShade} />
      <Path path="M56 76 L64 90 L60 89 L58 93 L52 80 Z" color={artColors.outline} />
      <Path path="M55 77 L62 89 L59 88.5 L57.5 91 L53 80 Z" color={artColors.ribbonShade} />
      <Circle cx={50} cy={75.5} r={7.4} color={artColors.outline} />
      <Circle cx={50} cy={75.5} r={6.2} color={artColors.gold} />
      <Path path={starPath(50, 75.8, 4.4)} color={colors.white} />
      {/* Glitzer: frisch geerntet */}
      {[
        { x: 18, y: 40, s: 3.4 },
        { x: 84, y: 36, s: 2.8 },
        { x: 64, y: 28, s: 2.2 },
      ].map(({ x, y, s }) => (
        <Path
          key={x}
          path={`M${x} ${y - s * 1.6} Q${x} ${y} ${x + s * 1.6} ${y} Q${x} ${y} ${x} ${y + s * 1.6} Q${x} ${y} ${x - s * 1.6} ${y} Q${x} ${y} ${x} ${y - s * 1.6} Z`}
          color={artColors.gold}
        />
      ))}
    </Group>
  );
}

/** Ernte-Ebenen ohne Topf und Gesicht: Trocknen (B7) und Kiste (B8), Budi-Leinwand 100 × 100. */
export function HarvestArt({ kind, palette }: { kind: 'drying' | 'crate'; palette: PlantPalette }) {
  return kind === 'drying' ? <Drying palette={palette} /> : <Crate palette={palette} />;
}
