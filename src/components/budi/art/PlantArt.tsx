import { Circle, Group, LinearGradient, Oval, Path, RadialGradient, vec } from '@shopify/react-native-skia';
import { useMemo } from 'react';

import type { BudiPlantId } from '../../../lib/assets';
import { budiColors } from './budiColors';
import { budCluster, fanLeaf, leafBase, leafletPath, place, plantSpec, SOIL, type PlantSpec } from './geometry';
import type { PlantPalette } from './palette';

/** Konturstärke in Leinwand-Einheiten: dick und dunkel wie im Casual-Game-Look (ART-3). */
const OUTLINE = 2;
const LINE = budiColors.plantLine;

interface Built {
  spec: PlantSpec;
  /** Alle Fiederblätter einer Lage als ein Pfad: eine Füllung mit Verlauf statt Dutzender Formen. */
  back: { shape: string; veins: string };
  front: { shape: string; veins: string };
  petioles: string;
  cotyledons: string;
}

function build(id: BudiPlantId, leafWidth: number): Built {
  const spec = plantSpec(id);
  // Untere Hälfte der Blätter liegt hinten: dunkler, damit die Pflanze Tiefe bekommt.
  const half = Math.floor(spec.leaves.length / 2);
  const toLayer = (from: number, to: number) => {
    const shapes: string[] = [];
    const veins: string[] = [];
    spec.leaves.slice(from, to).forEach((leaf) => {
      fanLeaf(leafBase(leaf), leaf.deg, leaf.size, leaf.count, leafWidth).forEach((l) => {
        shapes.push(l.shape);
        veins.push(l.vein);
      });
    });
    return { shape: shapes.join(' '), veins: veins.join(' ') };
  };
  const petioles = spec.leaves
    .filter((l) => l.petiole > 0)
    .map((l) => {
      const end = leafBase(l);
      return `M${l.at.x} ${l.at.y} L${end.x.toFixed(2)} ${end.y.toFixed(2)}`;
    })
    .join(' ');
  const coty = spec.cotyledons;
  const cotyledons = coty ? [-62, 62].map((deg) => leafletPath(coty.at, deg, coty.size * 1.6, coty.size * 1.6)).join(' ') : '';
  return { spec, back: toLayer(0, half), front: toLayer(half, spec.leaves.length), petioles, cotyledons };
}

/** Eine Blattlage: Kontur unten, Füllung mit Verlauf (oben hell, unten satt), helle Mittelrippen. */
function LeafLayer({ shape, veins, top, bottom, from, to }: { shape: string; veins: string; top: string; bottom: string; from: number; to: number }) {
  if (!shape) return null;
  return (
    <Group>
      <Path path={shape} color={LINE} style="stroke" strokeWidth={OUTLINE * 2} strokeJoin="round" />
      <Path path={shape}>
        <LinearGradient start={vec(0, from)} end={vec(0, to)} colors={[top, bottom]} />
      </Path>
      {veins ? <Path path={veins} color={budiColors.leafVein} style="stroke" strokeWidth={0.5} strokeCap="round" /> : null}
    </Group>
  );
}

function Bud({ x, y, r, palette }: { x: number; y: number; r: number; palette: PlantPalette }) {
  const balls = budCluster({ at: { x, y }, r });
  // Blütenhärchen: kurze, geschwungene Striche, deterministisch verteilt.
  const hairs = [-50, -15, 20, 55]
    .map((deg, i) => {
      const from = place(0, -r * 0.55, deg, { x, y: y + r * 0.1 });
      const to = place(i % 2 ? 1 : -1, -r * 1.05, deg, { x, y: y + r * 0.1 });
      return `M${from.x.toFixed(2)} ${from.y.toFixed(2)} Q${((from.x + to.x) / 2 + 0.6).toFixed(2)} ${((from.y + to.y) / 2).toFixed(2)} ${to.x.toFixed(2)} ${to.y.toFixed(2)}`;
    })
    .join(' ');
  return (
    <Group>
      {balls.map((b, i) => (
        <Circle key={`o${i}`} cx={b.x} cy={b.y} r={b.r + OUTLINE * 0.8} color={LINE} />
      ))}
      {balls.map((b, i) => (
        <Circle key={`f${i}`} cx={b.x} cy={b.y} r={b.r}>
          <RadialGradient c={vec(b.x - b.r * 0.35, b.y - b.r * 0.4)} r={b.r * 1.4} colors={[palette.budLight, i === 0 ? palette.budShade : palette.bud]} />
        </Circle>
      ))}
      {balls.map((b, i) => (
        <Circle key={`s${i}`} cx={b.x - b.r * 0.32} cy={b.y - b.r * 0.38} r={b.r * 0.26} color={budiColors.gloss} />
      ))}
      <Path path={hairs} color={palette.pistil} style="stroke" strokeWidth={0.7} strokeCap="round" />
    </Group>
  );
}

/** Samenschale beim Keimen: zwei glänzende Hälften. */
function Seed() {
  const halves = [
    { x: SOIL.x - 7, y: SOIL.y - 4.4, w: 6.6, h: 5.4 },
    { x: SOIL.x + 1.2, y: SOIL.y - 4, w: 6.2, h: 5 },
  ];
  return (
    <Group>
      {halves.map((s) => (
        <Group key={s.x}>
          <Oval x={s.x - 0.9} y={s.y - 0.9} width={s.w + 1.8} height={s.h + 1.8} color={LINE} />
          <Oval x={s.x} y={s.y} width={s.w} height={s.h}>
            <RadialGradient c={vec(s.x + s.w * 0.35, s.y + s.h * 0.3)} r={s.w} colors={[budiColors.potTop, budiColors.potBottom]} />
          </Oval>
          <Oval x={s.x + s.w * 0.2} y={s.y + s.h * 0.18} width={s.w * 0.35} height={s.h * 0.22} color={budiColors.gloss} />
        </Group>
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
  const top = spec.top;
  return (
    <Group>
      {spec.seed ? <Seed /> : null}
      <LeafLayer {...built.back} top={palette.leafBackTop} bottom={palette.leafBackBottom} from={top} to={SOIL.y} />
      {spec.stem ? (
        <>
          <Path path={`${spec.stem} ${built.petioles}`} color={LINE} style="stroke" strokeWidth={spec.stemWidth + OUTLINE * 2} strokeCap="round" />
          {built.petioles ? <Path path={built.petioles} color={budiColors.stemDark} style="stroke" strokeWidth={1.4} strokeCap="round" /> : null}
          <Path path={spec.stem} color={budiColors.stemDark} style="stroke" strokeWidth={spec.stemWidth} strokeCap="round" />
          <Path path={spec.stem} color={budiColors.stemLight} style="stroke" strokeWidth={spec.stemWidth * 0.45} strokeCap="round" transform={[{ translateX: -spec.stemWidth * 0.18 }]} />
        </>
      ) : null}
      <LeafLayer shape={built.cotyledons} veins="" top={budiColors.leafTip} bottom={palette.leaf} from={top} to={SOIL.y} />
      <LeafLayer {...built.front} top={palette.leafTop} bottom={palette.leafBottom} from={top} to={SOIL.y} />
      {spec.buds.map((b, i) => (
        <Bud key={i} x={b.at.x} y={b.at.y} r={b.r} palette={palette} />
      ))}
    </Group>
  );
}
