// Spielfeld von "Tropfen fangen" mit Skia (Auftrag 40: eigene Grafik statt Platzhalter). Himmel mit
// Wolken, Regal unten, Tropfen je Art als ein Pfad (Wasser als Tropfen, Dünger als Kugel, Salz als
// Kristall), der Topf mit Budi-Spross federt beim Fangen. Alles über Shared Values auf dem UI-Thread.

import { Circle, Group, LinearGradient, Oval, Path, Rect, RoundedRect, Skia, vec } from '@shopify/react-native-skia';
import type { ReactNode } from 'react';
import { useDerivedValue, type SharedValue } from 'react-native-reanimated';

import { DROPS_GAME } from '../../../game/config';
import { colors, gameColors } from '../../../lib/theme';
import { potSquash } from './dropsFeel';
import { potTop, type DropKind, type DropsField } from './dropsLogic';

interface DropsCanvasProps {
  field: SharedValue<DropsField>;
  size: SharedValue<{ width: number; height: number }>;
  /** Effekt-Uhr (ms) und Zeitpunkt des letzten Fangs, für das Federn des Topfs. */
  now: SharedValue<number>;
  lastCatchMs: SharedValue<number>;
  /** Partikel und Wackeln, über der Szene. */
  children?: ReactNode;
}

const R = DROPS_GAME.dropRadius;
const PW = DROPS_GAME.potWidth;
const PH = DROPS_GAME.potHeight;
const CLOUDS = [
  { x: 0.18, y: 0.1, s: 1 },
  { x: 0.72, y: 0.06, s: 0.8 },
  { x: 0.5, y: 0.22, s: 0.6 },
];

function useKindPath(field: SharedValue<DropsField>, kind: DropKind, highlight = false) {
  return useDerivedValue(() => {
    const b = Skia.PathBuilder.Make();
    for (const d of field.get().drops) {
      if (d.kind !== kind) continue;
      const { x, y } = d;
      if (highlight) {
        if (kind !== 'salt') b.addCircle(x - R * 0.3, y - R * 0.05, R * 0.22);
        continue;
      }
      if (kind === 'water') {
        b.moveTo(x, y - R * 1.35);
        b.cubicTo(x + R * 1.1, y - R * 0.15, x + R * 0.95, y + R, x, y + R);
        b.cubicTo(x - R * 0.95, y + R, x - R * 1.1, y - R * 0.15, x, y - R * 1.35);
        b.close();
      } else if (kind === 'fertilizer') {
        b.addCircle(x, y, R * 0.85);
      } else {
        b.addPoly([vec(x, y - R * 1.1), vec(x + R * 0.85, y), vec(x, y + R * 1.1), vec(x - R * 0.85, y)], true);
      }
    }
    return b.detach();
  });
}

function Sky({ size }: { size: SharedValue<{ width: number; height: number }> }) {
  const w = useDerivedValue(() => size.get().width);
  const h = useDerivedValue(() => size.get().height);
  const end = useDerivedValue(() => vec(0, size.get().height));
  const clouds = useDerivedValue(() => {
    const { width, height } = size.get();
    const b = Skia.PathBuilder.Make();
    for (const c of CLOUDS) {
      const cx = c.x * width;
      const cy = c.y * height;
      const s = 34 * c.s;
      b.addOval(Skia.XYWHRect(cx - s * 1.6, cy - s * 0.4, s * 3.2, s * 1.1));
      b.addCircle(cx - s * 0.5, cy - s * 0.3, s * 0.7);
      b.addCircle(cx + s * 0.45, cy - s * 0.45, s * 0.85);
    }
    return b.detach();
  });
  const shelfY = useDerivedValue(() => size.get().height - DROPS_GAME.potBottomMargin);
  return (
    <>
      <Rect x={0} y={0} width={w} height={h}>
        <LinearGradient start={vec(0, 0)} end={end} colors={[gameColors.sky, colors.cream]} />
      </Rect>
      <Path path={clouds} color={colors.white} opacity={0.85} />
      <Rect x={0} y={shelfY} width={w} height={DROPS_GAME.potBottomMargin} color={colors.terracotta} />
      <Rect x={0} y={shelfY} width={w} height={3} color={gameColors.soil} opacity={0.5} />
    </>
  );
}

/** Topf in eigenen Koordinaten: (0, 0) ist die Mitte der Öffnung. */
function Pot() {
  const body = Skia.PathBuilder.Make()
    .moveTo(-PW * 0.46, 10)
    .lineTo(PW * 0.46, 10)
    .lineTo(PW * 0.36, PH)
    .lineTo(-PW * 0.36, PH)
    .close()
    .detach();
  return (
    <>
      {/* Budis Spross schaut aus der Erde */}
      <Oval x={-15} y={-14} width={14} height={9} color={colors.plantLight} />
      <Oval x={1} y={-14} width={14} height={9} color={colors.plantLight} />
      <Circle cx={0} cy={-2} r={9} color={colors.plantLight} />
      <Circle cx={-3} cy={-3} r={1.6} color={colors.ink} />
      <Circle cx={3} cy={-3} r={1.6} color={colors.ink} />
      <Path path={body} color={colors.terracotta} />
      <RoundedRect x={-PW * 0.52} y={0} width={PW * 1.04} height={14} r={6} color={colors.terracotta} />
      <RoundedRect x={-PW * 0.52} y={10} width={PW * 1.04} height={4} r={2} color={gameColors.soil} opacity={0.35} />
      <Oval x={-PW * 0.42} y={1} width={PW * 0.84} height={7} color={gameColors.soil} />
      <Circle cx={-12} cy={30} r={3} color={colors.ink} />
      <Circle cx={12} cy={30} r={3} color={colors.ink} />
      <Path
        path={Skia.PathBuilder.Make().moveTo(-8, 38).quadTo(0, 45, 8, 38).detach()}
        color={colors.ink}
        style="stroke"
        strokeWidth={2.5}
        strokeCap="round"
      />
      <Circle cx={-20} cy={36} r={4} color={colors.coral} opacity={0.5} />
      <Circle cx={20} cy={36} r={4} color={colors.coral} opacity={0.5} />
    </>
  );
}

export function DropsCanvas({ field, size, now, lastCatchMs, children }: DropsCanvasProps) {
  const water = useKindPath(field, 'water');
  const fertilizer = useKindPath(field, 'fertilizer');
  const salt = useKindPath(field, 'salt');
  const waterShine = useKindPath(field, 'water', true);
  const fertilizerShine = useKindPath(field, 'fertilizer', true);
  const pot = useDerivedValue(() => {
    const squash = potSquash(now.get() - lastCatchMs.get());
    return [
      { translateX: field.get().potX },
      { translateY: potTop(size.get().height) + PH * (1 - squash) },
      { scaleX: 2 - squash },
      { scaleY: squash },
    ];
  });

  return (
    <>
      <Sky size={size} />
      <Group transform={pot}>
        <Pot />
      </Group>
      <Path path={water} color={gameColors.water} />
      <Path path={water} color={gameColors.waterDark} style="stroke" strokeWidth={1.5} />
      <Path path={waterShine} color={colors.white} opacity={0.7} />
      <Path path={fertilizer} color={colors.plantLight} />
      <Path path={fertilizer} color={colors.plantDark} style="stroke" strokeWidth={1.5} />
      <Path path={fertilizerShine} color={colors.white} opacity={0.6} />
      <Path path={salt} color={gameColors.salt} />
      <Path path={salt} color={colors.ink} style="stroke" strokeWidth={2} />
      {children}
    </>
  );
}
