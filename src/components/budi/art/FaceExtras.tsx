import { Circle, Group, Oval, Path, RadialGradient, vec } from '@shopify/react-native-skia';
import type { ReactNode } from 'react';

import { starPath } from '../../ui/icons/starPath';
import { budiColors as c } from './budiColors';
import { heartPath } from './FaceEyes';
import { CHEEK_X, CHEEK_Y, EYE_X, EYE_Y, type Extra } from './faceSpec';
import { POT_BODY } from './potShape';

// Brauen, Wangen, Tropfen und Zeichen rund ums Gesicht (ART-3). Feste Ebene.
const LINE = 1.6;

const brow = (d: string, w = 2.1) => (
  <Path key={d} path={d} color={c.brow} style="stroke" strokeWidth={w} strokeCap="round" strokeJoin="round" />
);

function Cheeks({ color, fade, rx, ry }: { color: string; fade: string; rx: number; ry: number }) {
  return (
    <>
      {CHEEK_X.map((cx) => (
        <Oval key={cx} x={cx - rx} y={CHEEK_Y - ry} width={rx * 2} height={ry * 2}>
          <RadialGradient c={vec(cx, CHEEK_Y)} r={rx} colors={[color, color, fade]} positions={[0, 0.4, 1]} />
        </Oval>
      ))}
    </>
  );
}

function Drop({ x, y, s }: { x: number; y: number; s: number }) {
  const d = `M${x} ${y - s * 1.6} Q${x + s * 1.2} ${y} ${x + s} ${y + s * 0.5} Q${x} ${y + s * 1.5} ${x - s} ${y + s * 0.5} Q${x - s * 1.2} ${y} ${x} ${y - s * 1.6} Z`;
  return (
    <Group>
      <Path path={d}>
        <RadialGradient c={vec(x - s * 0.3, y)} r={s * 1.6} colors={[c.tearLight, c.tear]} />
      </Path>
      <Path path={d} color={c.eyeLine} style="stroke" strokeWidth={0.9} strokeJoin="round" />
      <Circle cx={x - s * 0.35} cy={y + s * 0.1} r={s * 0.28} color={c.shine} />
    </Group>
  );
}

function ExtraPart({ kind }: { kind: Extra }): ReactNode {
  const [l, r] = EYE_X;
  switch (kind) {
    case 'blush':
      return <Cheeks color={c.cheek} fade={c.cheekFade} rx={5.4} ry={3.2} />;
    case 'bigBlush':
      return <Cheeks color={c.cheek} fade={c.cheekFade} rx={6.6} ry={4} />;
    case 'sickCheeks':
      return <Cheeks color={c.sick} fade={c.cheekFade} rx={5.6} ry={3.4} />;
    case 'sweat':
      return <Drop x={74} y={73} s={2.4} />;
    case 'tear':
      return <Drop x={r + 7.4} y={EYE_Y + 2.6} s={1.6} />;
    case 'worryBrows':
      return (
        <>
          {brow(`M${l - 4.6} ${EYE_Y - 9} Q${l} ${EYE_Y - 10.4} ${l + 3.8} ${EYE_Y - 12}`)}
          {brow(`M${r + 4.6} ${EYE_Y - 9} Q${r} ${EYE_Y - 10.4} ${r - 3.8} ${EYE_Y - 12}`)}
        </>
      );
    case 'droop':
      return (
        <>
          {brow(`M${l - 4.6} ${EYE_Y - 9.2} Q${l} ${EYE_Y - 11} ${l + 4} ${EYE_Y - 10.8}`, 1.8)}
          {brow(`M${r + 4.6} ${EYE_Y - 9.2} Q${r} ${EYE_Y - 11} ${r - 4} ${EYE_Y - 10.8}`, 1.8)}
        </>
      );
    case 'angryBrows':
      return (
        <>
          {brow(`M${l - 5} ${EYE_Y - 11.6} L${l + 4.6} ${EYE_Y - 7.4}`, 2.5)}
          {brow(`M${r + 5} ${EYE_Y - 11.6} L${r - 4.6} ${EYE_Y - 7.4}`, 2.5)}
        </>
      );
    case 'raisedBrows':
      return <>{EYE_X.map((cx) => brow(`M${cx - 4.4} ${EYE_Y - 11.4} Q${cx} ${EYE_Y - 14.4} ${cx + 4.4} ${EYE_Y - 11.4}`))}</>;
    case 'happyBrows':
      return <>{EYE_X.map((cx) => brow(`M${cx - 3.8} ${EYE_Y - 10.4} Q${cx} ${EYE_Y - 12.4} ${cx + 3.8} ${EYE_Y - 10.4}`, 1.8))}</>;
    case 'sparkles':
      return (
        <>
          {[
            [20, 74, 3.2],
            [81, 72, 2.6],
            [77, 93, 2],
          ].map(([x, y, s]) => (
            <Group key={x}>
              <Path path={starPath(x, y, s + 0.8, 0.42)} color={c.eyeLine} />
              <Path path={starPath(x, y, s, 0.42)} color={c.sparkle} />
              <Circle cx={x - s * 0.2} cy={y - s * 0.2} r={s * 0.25} color={c.sparkleLight} />
            </Group>
          ))}
        </>
      );
    case 'hearts':
      return (
        <>
          {[
            [19, 72, 2.6],
            [82, 76, 2],
          ].map(([x, y, s]) => (
            <Group key={x}>
              <Path path={heartPath(x, y, s)} color={c.heart} />
              <Path path={heartPath(x, y, s)} color={c.eyeLine} style="stroke" strokeWidth={0.9} />
            </Group>
          ))}
        </>
      );
    case 'eyeBags':
      return <>{EYE_X.map((cx) => brow(`M${cx - 3.6} ${EYE_Y + 9} Q${cx} ${EYE_Y + 10.8} ${cx + 3.6} ${EYE_Y + 9}`, 1))}</>;
    case 'angerMark':
      return brow('M74 67.5 Q75.6 70.4 78.4 69.8 M80.6 67 Q79 69.8 80 72.6 M77.8 75.2 Q76.2 72.4 73.4 73 M72 72.6 Q73.6 69.8 72.6 67', 1.4);
    case 'pale':
      return <Path path={POT_BODY} color={c.pale} />;
    case 'shock':
      return (
        <>
          {brow('M13 72 L8.6 69.6', LINE)}
          {brow('M12 78 L7 78', LINE)}
          {brow('M87 72 L91.4 69.6', LINE)}
          {brow('M88 78 L93 78', LINE)}
        </>
      );
    case 'dry':
      return (
        <>
          {brow('M24 92.5 L26.6 90 L25.6 87.8', 1)}
          {brow('M76 91.6 L73.4 89.4 L74.4 86.8', 1)}
        </>
      );
  }
}

export function Extras({ extras }: { extras: readonly Extra[] }) {
  return (
    <>
      {extras.map((e) => (
        <ExtraPart key={e} kind={e} />
      ))}
    </>
  );
}
