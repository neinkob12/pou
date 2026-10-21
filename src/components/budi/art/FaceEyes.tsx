import { Circle, Group, Oval, Path, RadialGradient, vec } from '@shopify/react-native-skia';

import { budiColors as c } from './budiColors';
import { EYE_RX, EYE_RY, EYE_X, EYE_Y, type EyeKind } from './faceSpec';

// Budis Augen (ART-3): großes Augenweiß mit Kontur, die Iris liegt auf einer eigenen Ebene
// (Pupils) und schaut umher, ohne dass eine Leinwand neu zeichnet.
const LINE = 1.6;

const line = (d: string, w = LINE * 1.3, color: string = c.eyeLine) => (
  <Path key={d} path={d} color={color} style="stroke" strokeWidth={w} strokeCap="round" strokeJoin="round" />
);

/** Herz mit Spitze unten, Mitte (x, y), halbe Breite s. */
export const heartPath = (x: number, y: number, s: number) =>
  `M${x} ${y + s * 0.95} C${x - s * 1.5} ${y - s * 0.05} ${x - s * 1.05} ${y - s * 1.25} ${x} ${y - s * 0.45} ` +
  `C${x + s * 1.05} ${y - s * 1.25} ${x + s * 1.5} ${y - s * 0.05} ${x} ${y + s * 0.95} Z`;

function Sclera({ cx, scale = 1 }: { cx: number; scale?: number }) {
  const rx = EYE_RX * scale;
  const ry = EYE_RY * scale;
  return (
    <Group>
      <Oval x={cx - rx} y={EYE_Y - ry} width={rx * 2} height={ry * 2}>
        <RadialGradient c={vec(cx, EYE_Y + ry * 0.25)} r={ry * 1.1} colors={[c.sclera, c.sclera, c.scleraShade]} positions={[0, 0.55, 1]} />
      </Oval>
      <Oval x={cx - rx} y={EYE_Y - ry} width={rx * 2} height={ry * 2} color={c.eyeLine} style="stroke" strokeWidth={LINE} />
    </Group>
  );
}

/** Iris mit Verlauf, Pupille und zwei Glanzpunkten. */
function Iris({ cx, r, wet = false }: { cx: number; r: number; wet?: boolean }) {
  const cy = EYE_Y + 1.1;
  return (
    <Group>
      <Circle cx={cx} cy={cy} r={r}>
        <RadialGradient c={vec(cx, cy + r * 0.4)} r={r} colors={[c.irisLight, c.irisDark]} />
      </Circle>
      <Circle cx={cx} cy={cy} r={r * 0.5} color={c.pupil} />
      <Circle cx={cx + r * 0.38} cy={cy - r * 0.42} r={r * 0.4} color={c.shine} />
      <Circle cx={cx - r * 0.4} cy={cy + r * 0.45} r={r * 0.18} color={c.shine} />
      {wet ? <Circle cx={cx - r * 0.45} cy={cy - r * 0.1} r={r * 0.22} color={c.shine} opacity={0.85} /> : null}
    </Group>
  );
}

/** Bewegliche Ebene: nur die Iris (offene Augen). */
export function Pupils({ kind }: { kind: EyeKind }) {
  if (kind !== 'open' && kind !== 'big' && kind !== 'teary') return null;
  const r = kind === 'big' ? EYE_RX * 0.55 : EYE_RX * 0.8;
  return (
    <>
      {EYE_X.map((cx) => (
        <Iris key={cx} cx={cx} r={r} wet={kind === 'teary'} />
      ))}
    </>
  );
}

/** Feste Ebene: Augenweiß, Lider, geschlossene Augen, Herzen. */
export function Eyes({ kind }: { kind: EyeKind }) {
  switch (kind) {
    case 'open':
    case 'teary':
      return (
        <>
          {EYE_X.map((cx) => (
            <Group key={cx}>
              <Sclera cx={cx} />
              {kind === 'teary' ? (
                <Path path={`M${cx - EYE_RX * 0.8} ${EYE_Y + EYE_RY * 0.55} Q${cx} ${EYE_Y + EYE_RY * 1.05} ${cx + EYE_RX * 0.8} ${EYE_Y + EYE_RY * 0.55}`} color={c.tear} style="stroke" strokeWidth={1.4} strokeCap="round" opacity={0.9} />
              ) : null}
            </Group>
          ))}
        </>
      );
    case 'big':
      return <>{EYE_X.map((cx) => <Sclera key={cx} cx={cx} scale={1.15} />)}</>;
    case 'half':
      return (
        <>
          {EYE_X.map((cx) => (
            <Group key={cx}>
              <Sclera cx={cx} />
              <Iris cx={cx} r={EYE_RX * 0.62} />
              {/* Schweres Lid in Topffarbe über der oberen Hälfte. */}
              <Path path={`M${cx - EYE_RX - 1} ${EYE_Y + 0.6} A${EYE_RX + 1} ${EYE_RY + 1} 0 0 1 ${cx + EYE_RX + 1} ${EYE_Y + 0.6} Z`} color={c.potMid} />
              {line(`M${cx - EYE_RX - 0.6} ${EYE_Y + 0.6} Q${cx} ${EYE_Y + 1.6} ${cx + EYE_RX + 0.6} ${EYE_Y + 0.6}`, LINE * 1.5)}
            </Group>
          ))}
        </>
      );
    case 'squint':
      return (
        <>
          {EYE_X.map((cx, i) => {
            const inner = i === 0 ? 1 : -1;
            return (
              <Group key={cx}>
                <Sclera cx={cx} />
                <Iris cx={cx + inner * 1.4} r={EYE_RX * 0.6} />
                <Path
                  path={`M${cx - EYE_RX - 1} ${EYE_Y - (i ? -1.2 : 2.6)} L${cx + EYE_RX + 1} ${EYE_Y - (i ? 2.6 : -1.2)} L${cx + EYE_RX + 1} ${EYE_Y - EYE_RY - 2} L${cx - EYE_RX - 1} ${EYE_Y - EYE_RY - 2} Z`}
                  color={c.potMid}
                />
                {line(`M${cx - EYE_RX - 0.6} ${EYE_Y - (i ? -1 : 2.4)} L${cx + EYE_RX + 0.6} ${EYE_Y - (i ? 2.4 : -1)}`, LINE * 1.5)}
              </Group>
            );
          })}
        </>
      );
    case 'closedHappy':
      return <>{EYE_X.map((cx) => line(`M${cx - 5.2} ${EYE_Y + 2} Q${cx} ${EYE_Y - 6} ${cx + 5.2} ${EYE_Y + 2}`, LINE * 1.8))}</>;
    case 'closedSleep':
      return (
        <>
          {EYE_X.map((cx) => (
            <Group key={cx}>
              {line(`M${cx - 5.2} ${EYE_Y} Q${cx} ${EYE_Y + 5.2} ${cx + 5.2} ${EYE_Y}`, LINE * 1.6)}
              {line(`M${cx - 2.4} ${EYE_Y + 3.4} L${cx - 3} ${EYE_Y + 5.6} M${cx + 2.4} ${EYE_Y + 3.4} L${cx + 3} ${EYE_Y + 5.6}`, LINE * 0.9)}
            </Group>
          ))}
        </>
      );
    case 'squeeze':
      // Kichern: zusammengekniffen wie > <.
      return (
        <>
          {line(`M${EYE_X[0] - 4.6} ${EYE_Y - 4} L${EYE_X[0] + 3.8} ${EYE_Y} L${EYE_X[0] - 4.6} ${EYE_Y + 4}`, LINE * 1.8)}
          {line(`M${EYE_X[1] + 4.6} ${EYE_Y - 4} L${EYE_X[1] - 3.8} ${EYE_Y} L${EYE_X[1] + 4.6} ${EYE_Y + 4}`, LINE * 1.8)}
        </>
      );
    case 'hearts':
      return (
        <>
          {EYE_X.map((cx) => (
            <Group key={cx}>
              <Path path={heartPath(cx, EYE_Y, 6.4)}>
                <RadialGradient c={vec(cx - 2, EYE_Y - 3)} r={9} colors={[c.heartLight, c.heart]} />
              </Path>
              <Path path={heartPath(cx, EYE_Y, 6.4)} color={c.eyeLine} style="stroke" strokeWidth={LINE} strokeJoin="round" />
              <Oval x={cx - 4.4} y={EYE_Y - 4.6} width={3} height={2.2} color={c.shine} opacity={0.9} />
            </Group>
          ))}
        </>
      );
    case 'cross':
      return (
        <>
          {EYE_X.map((cx) => line(`M${cx - 4} ${EYE_Y - 4} L${cx + 4} ${EYE_Y + 4} M${cx + 4} ${EYE_Y - 4} L${cx - 4} ${EYE_Y + 4}`, LINE * 1.6))}
        </>
      );
  }
}
