import { Circle, Group, Path, RoundedRect } from '@shopify/react-native-skia';

import { artColors } from '../../../lib/theme';
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

/** B8: Erntekiste aus Holz voller Knospen. */
function Crate({ palette }: { palette: PlantPalette }) {
  const buds = [
    { x: 30, y: 60, r: 7 },
    { x: 44, y: 56, r: 8 },
    { x: 58, y: 57, r: 7.5 },
    { x: 71, y: 60, r: 6.5 },
    { x: 37, y: 52, r: 6 },
    { x: 52, y: 49, r: 7 },
    { x: 64, y: 51, r: 6 },
  ];
  return (
    <Group>
      {buds.map((b, i) => (
        <Cluster key={i} x={b.x} y={b.y} r={b.r} down={false} palette={palette} />
      ))}
      <RoundedRect x={14} y={60} width={72} height={34} r={5} color={artColors.outline} />
      <RoundedRect x={16} y={62} width={68} height={30} r={4} color={artColors.wood} />
      {[0, 1, 2].map((i) => (
        <RoundedRect key={i} x={18} y={64 + i * 9.6} width={64} height={7.6} r={2.4} color={i % 2 ? artColors.wood : artColors.woodShade} opacity={0.55} />
      ))}
      <RoundedRect x={18} y={64} width={6} height={26} r={2} color={artColors.woodShade} />
      <RoundedRect x={76} y={64} width={6} height={26} r={2} color={artColors.woodShade} />
      {/* Glitzer: frisch geerntet */}
      {[
        { x: 22, y: 44, s: 3.4 },
        { x: 80, y: 42, s: 2.6 },
        { x: 50, y: 36, s: 2.2 },
      ].map(({ x, y, s }) => (
        <Path
          key={x}
          path={`M${x} ${y - s * 1.6} Q${x} ${y} ${x + s * 1.6} ${y} Q${x} ${y} ${x} ${y + s * 1.6} Q${x} ${y} ${x - s * 1.6} ${y} Q${x} ${y} ${x} ${y - s * 1.6} Z`}
          color={artColors.frost}
        />
      ))}
    </Group>
  );
}

/** Ernte-Ebenen ohne Topf und Gesicht: Trocknen (B7) und Kiste (B8), Budi-Leinwand 100 × 100. */
export function HarvestArt({ kind, palette }: { kind: 'drying' | 'crate'; palette: PlantPalette }) {
  return kind === 'drying' ? <Drying palette={palette} /> : <Crate palette={palette} />;
}
