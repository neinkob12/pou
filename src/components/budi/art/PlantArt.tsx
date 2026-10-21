import { Circle, Group, Oval, Path } from '@shopify/react-native-skia';
import { useMemo } from 'react';

import { artColors } from '../../../lib/theme';
import type { BudiPlantId } from '../../../lib/assets';
import { budCluster, fanLeaf, leafBase, leafletPath, place, plantSpec, SOIL, type PlantSpec } from './geometry';
import type { PlantPalette } from './palette';

/** Konturstärke in Leinwand-Einheiten (Flat Vector Kawaii, DESIGN_GUIDE D2). */
const OUTLINE = 1.7;

interface Built {
  spec: PlantSpec;
  /** Hintere (untere) Blätter, dunkler. */
  back: { shapes: string[]; veins: string[] };
  front: { shapes: string[]; veins: string[] };
  petioles: string[];
  cotyledons: string[];
}

function build(id: BudiPlantId, leafWidth: number): Built {
  const spec = plantSpec(id);
  // Untere Hälfte der Blätter liegt hinten: dunkler, damit die Pflanze Tiefe bekommt.
  const half = Math.floor(spec.leaves.length / 2);
  const toParts = (from: number, to: number) => {
    const shapes: string[] = [];
    const veins: string[] = [];
    spec.leaves.slice(from, to).forEach((leaf) => {
      fanLeaf(leafBase(leaf), leaf.deg, leaf.size, leaf.count, leafWidth).forEach((l) => {
        shapes.push(l.shape);
        veins.push(l.vein);
      });
    });
    return { shapes, veins };
  };
  const petioles = spec.leaves
    .filter((l) => l.petiole > 0)
    .map((l) => {
      const end = leafBase(l);
      return `M${l.at.x} ${l.at.y} L${end.x.toFixed(2)} ${end.y.toFixed(2)}`;
    });
  const cotyledons = spec.cotyledons
    ? [-62, 62].map((deg) => leafletPath(spec.cotyledons!.at, deg, spec.cotyledons!.size * 1.6, spec.cotyledons!.size * 1.5))
    : [];
  return { spec, back: toParts(0, half), front: toParts(half, spec.leaves.length), petioles, cotyledons };
}

/** Kontur (dicker Strich in Konturfarbe) unter allen Formen, dann die Füllungen: Sticker-Look. */
function Outlined({ paths, fill }: { paths: string[]; fill: string }) {
  return (
    <>
      {paths.map((d, i) => (
        <Path key={`o${i}`} path={d} color={artColors.outline} style="stroke" strokeWidth={OUTLINE} strokeJoin="round" />
      ))}
      {paths.map((d, i) => (
        <Path key={`f${i}`} path={d} color={fill} />
      ))}
    </>
  );
}

function Veins({ paths, color }: { paths: string[]; color: string }) {
  return (
    <>
      {paths.map((d, i) => (
        <Path key={i} path={d} color={color} style="stroke" strokeWidth={0.45} strokeCap="round" />
      ))}
    </>
  );
}

function Bud({ x, y, r, palette }: { x: number; y: number; r: number; palette: PlantPalette }) {
  const balls = budCluster({ at: { x, y }, r });
  // Blütenhärchen: kurze, geschwungene Striche, deterministisch verteilt.
  const hairs = [-50, -15, 20, 55].map((deg, i) => {
    const from = place(0, -r * 0.55, deg, { x, y: y + r * 0.1 });
    const to = place(i % 2 ? 1 : -1, -r * 1.05, deg, { x, y: y + r * 0.1 });
    return `M${from.x.toFixed(2)} ${from.y.toFixed(2)} Q${((from.x + to.x) / 2 + 0.6).toFixed(2)} ${((from.y + to.y) / 2).toFixed(2)} ${to.x.toFixed(2)} ${to.y.toFixed(2)}`;
  });
  return (
    <Group>
      {balls.map((b, i) => (
        <Circle key={`o${i}`} cx={b.x} cy={b.y} r={b.r + OUTLINE / 2} color={artColors.outline} />
      ))}
      {balls.map((b, i) => (
        <Circle key={`f${i}`} cx={b.x} cy={b.y} r={b.r} color={i === 0 ? palette.budShade : palette.bud} />
      ))}
      {balls.map((b, i) => (
        <Circle key={`s${i}`} cx={b.x - b.r * 0.3} cy={b.y - b.r * 0.35} r={b.r * 0.28} color={artColors.frost} opacity={0.55} />
      ))}
      {hairs.map((d, i) => (
        <Path key={`h${i}`} path={d} color={palette.pistil} style="stroke" strokeWidth={0.6} strokeCap="round" />
      ))}
    </Group>
  );
}

interface PlantArtProps {
  id: BudiPlantId;
  palette: PlantPalette;
  /** Breite der Fiederblätter je Sorte (1 = normal), siehe STRAIN_STYLES in budiLook.ts. */
  leafWidth?: number;
}

/**
 * Budis Pflanze je Phase (B1 bis B6), auf der Pflanzen-Leinwand PLANT_W × PLANT_H.
 * Muss in einer Skia-Gruppe liegen, die auf diese Einheiten skaliert.
 */
export function PlantArt({ id, palette, leafWidth = 1 }: PlantArtProps) {
  const built = useMemo(() => build(id, leafWidth), [id, leafWidth]);
  const { spec } = built;
  return (
    <Group>
      {spec.seed ? (
        <Group>
          <Oval x={SOIL.x - 6.5} y={SOIL.y - 3.8} width={6} height={5} color={artColors.outline} />
          <Oval x={SOIL.x - 6} y={SOIL.y - 3.3} width={5} height={4} color={artColors.seed} />
          <Oval x={SOIL.x + 1.5} y={SOIL.y - 3.4} width={5.6} height={4.6} color={artColors.outline} />
          <Oval x={SOIL.x + 2} y={SOIL.y - 2.9} width={4.6} height={3.6} color={artColors.seed} />
        </Group>
      ) : null}
      <Outlined paths={built.back.shapes} fill={palette.leafBack} />
      <Veins paths={built.back.veins} color={artColors.leafVein} />
      {spec.stem ? (
        <>
          <Path path={spec.stem} color={artColors.outline} style="stroke" strokeWidth={spec.stemWidth + OUTLINE} strokeCap="round" />
          <Path path={spec.stem} color={palette.stem} style="stroke" strokeWidth={spec.stemWidth} strokeCap="round" />
          {built.petioles.map((d, i) => (
            <Path key={`p${i}`} path={d} color={artColors.outline} style="stroke" strokeWidth={1.2 + OUTLINE} strokeCap="round" />
          ))}
          {built.petioles.map((d, i) => (
            <Path key={`q${i}`} path={d} color={palette.stem} style="stroke" strokeWidth={1.2} strokeCap="round" />
          ))}
        </>
      ) : null}
      <Outlined paths={built.cotyledons} fill={artColors.leafLight} />
      <Outlined paths={built.front.shapes} fill={palette.leaf} />
      <Veins paths={built.front.veins} color={palette.vein} />
      {spec.buds.map((b, i) => (
        <Bud key={i} x={b.at.x} y={b.at.y} r={b.r} palette={palette} />
      ))}
    </Group>
  );
}
