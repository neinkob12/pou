import { Circle, Group, LinearGradient, Oval, Paint, Path, RadialGradient, Shadow, vec } from '@shopify/react-native-skia';
import type { ReactNode } from 'react';

import { ICON_SHADOW, iconInk } from './iconPalette';
import { darken, lighten, pathBounds } from './tint';

export { starPath } from './starPath';

// Grundformen der Icons im Spiele-Look (ART-2): dicke dunkle Kontur, Verlauf von hell oben nach
// dunkel unten, Glanzlicht oben, weicher Schlagschatten unter dem ganzen Icon. Einheiten 100 × 100.

/** Konturbreite der Icons in Einheiten (Icon = 100 × 100). */
export const LINE = 7;

/** Ab dieser Größe (Einheiten) bekommt eine Form automatisch ein Glanzlicht. */
const GLOSS_MIN = 22;

/** Glanzlicht oben in einer Form: helle Ellipse, auf die Form zugeschnitten. */
function Gloss({ d }: { d: string }) {
  const b = pathBounds(d);
  if (b.width < GLOSS_MIN || b.height < GLOSS_MIN * 0.8) return null;
  return (
    <Group clip={d}>
      <Oval x={b.x + b.width * 0.1} y={b.y - b.height * 0.12} width={b.width * 0.8} height={b.height * 0.5} color={iconInk.gloss} opacity={0.32} />
    </Group>
  );
}

interface ShapeProps {
  d: string;
  fill: string;
  line?: number;
  /** Ohne Verlauf und Glanz, etwa für kleine Details. */
  flat?: boolean;
  /** Glanzlicht oben (Standard: bei großen Formen an). */
  gloss?: boolean;
}

/** Form mit Kontur: Strich unter der Füllung, damit nur die halbe Strichbreite außen sichtbar ist. */
export function Shape({ d, fill, line = LINE, flat = false, gloss = true }: ShapeProps) {
  const b = pathBounds(d);
  return (
    <>
      <Path path={d} color={iconInk.outline} style="stroke" strokeWidth={line} strokeJoin="round" strokeCap="round" />
      {flat ? (
        <Path path={d} color={fill} />
      ) : (
        <Path path={d}>
          <LinearGradient
            start={vec(b.x, b.y)}
            end={vec(b.x, b.y + b.height)}
            colors={[lighten(fill, 0.35), fill, darken(fill, 0.2)]}
            positions={[0, 0.45, 1]}
          />
        </Path>
      )}
      {!flat && gloss ? <Gloss d={d} /> : null}
    </>
  );
}

interface DotProps {
  cx: number;
  cy: number;
  r: number;
  fill: string;
  line?: number;
  flat?: boolean;
}

/** Kreis mit Kontur, runder Verlauf mit Licht von oben links und kleinem Glanzpunkt. */
export function Dot({ cx, cy, r, fill, line = LINE, flat = false }: DotProps) {
  return (
    <>
      <Circle cx={cx} cy={cy} r={r + line / 2} color={iconInk.outline} />
      {flat ? (
        <Circle cx={cx} cy={cy} r={r} color={fill} />
      ) : (
        <Circle cx={cx} cy={cy} r={r}>
          <RadialGradient
            c={vec(cx - r * 0.35, cy - r * 0.45)}
            r={r * 1.6}
            colors={[lighten(fill, 0.4), fill, darken(fill, 0.25)]}
            positions={[0, 0.45, 1]}
          />
        </Circle>
      )}
      {!flat && r >= GLOSS_MIN / 3 ? (
        <Oval x={cx - r * 0.62} y={cy - r * 0.78} width={r * 0.7} height={r * 0.42} color={iconInk.gloss} opacity={0.55} />
      ) : null}
    </>
  );
}

/** Weißer Glanzstrich. */
export const shine = (d: string, width = 5) => (
  <Path path={d} color={iconInk.gloss} opacity={0.8} style="stroke" strokeWidth={width} strokeCap="round" />
);

/** Strich mit Kontur, etwa für Griffe und Stiele. */
export function Line({ d, color, width }: { d: string; color: string; width: number }) {
  return (
    <>
      <Path path={d} color={iconInk.outline} style="stroke" strokeWidth={width + LINE} strokeCap="round" strokeJoin="round" />
      <Path path={d} color={color} style="stroke" strokeWidth={width} strokeCap="round" strokeJoin="round" />
    </>
  );
}

/** Vierzackiges Funkeln, etwa an Münzen und Sternen. */
export function Sparkle({ cx, cy, r, color = iconInk.gloss }: { cx: number; cy: number; r: number; color?: string }) {
  const k = r * 0.22;
  const d = `M${cx} ${cy - r} Q${cx + k} ${cy - k} ${cx + r} ${cy} Q${cx + k} ${cy + k} ${cx} ${cy + r} Q${cx - k} ${cy + k} ${cx - r} ${cy} Q${cx - k} ${cy - k} ${cx} ${cy - r} Z`;
  return <Path path={d} color={color} />;
}

/**
 * Rahmen für ein ganzes Icon: etwas verkleinert, damit der Schatten Platz hat, und mit weichem
 * Schlagschatten nach unten. Der Schatten liegt auf der ganzen Ebene, nicht auf jeder Form.
 */
export function IconFrame({ children, shadow = true }: { children: ReactNode; shadow?: boolean }) {
  return (
    <Group
      transform={[{ scale: ICON_SHADOW.scale }]}
      origin={vec(50, 46)}
      layer={
        shadow ? (
          <Paint>
            <Shadow dx={0} dy={ICON_SHADOW.dy} blur={ICON_SHADOW.blur} color={iconInk.shadow} />
          </Paint>
        ) : undefined
      }
    >
      {children}
    </Group>
  );
}
