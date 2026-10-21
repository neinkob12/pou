import { Circle, Group, Oval, Path, LinearGradient, vec } from '@shopify/react-native-skia';

import { budiColors as c } from './budiColors';
import { MOUTH_Y, type MouthKind } from './faceSpec';

// Budis Mund (ART-3): eigene Ebene, damit er kauen, gähnen und beim Mimikwechsel ploppen kann.
const LINE = 1.6;
const m = MOUTH_Y;

const line = (d: string, w = LINE * 1.2) => (
  <Path key={d} path={d} color={c.eyeLine} style="stroke" strokeWidth={w} strokeCap="round" strokeJoin="round" />
);

/** Offener Mund: dunkler Verlauf innen, Zunge unten, Kontur oben drauf. */
function Open({ d, tongue, teeth = false }: { d: string; tongue?: string; teeth?: boolean }) {
  return (
    <Group>
      <Path path={d}>
        <LinearGradient start={vec(0, m - 3)} end={vec(0, m + 6)} colors={[c.mouth, c.mouthLight]} />
      </Path>
      {tongue ? (
        <Group clip={d}>
          <Path path={tongue} color={c.tongue} />
          <Path path={tongue} color={c.tongueShade} style="stroke" strokeWidth={0.8} />
        </Group>
      ) : null}
      {teeth ? (
        <Group clip={d}>
          <Path path={`M${45.5} ${m - 4} L${54.5} ${m - 4} L${54.5} ${m - 1.4} Q50 ${m - 0.8} 45.5 ${m - 1.4} Z`} color={c.tooth} />
        </Group>
      ) : null}
      <Path path={d} color={c.eyeLine} style="stroke" strokeWidth={LINE} strokeJoin="round" />
    </Group>
  );
}

export function Mouth({ kind }: { kind: MouthKind }) {
  switch (kind) {
    case 'smile':
      // Kleines "D": offenes Lächeln wie bei Pou, nicht nur ein Strich.
      return <Open d={`M45.6 ${m - 1.6} Q50 ${m - 0.6} 54.4 ${m - 1.6} Q54 ${m + 3.4} 50 ${m + 3.6} Q46 ${m + 3.4} 45.6 ${m - 1.6} Z`} tongue={`M46.5 ${m + 3} Q50 ${m + 0.4} 53.5 ${m + 3} L53.5 ${m + 5} L46.5 ${m + 5} Z`} />;
    case 'grin':
      return <Open d={`M43.5 ${m - 2.6} Q50 ${m - 1.2} 56.5 ${m - 2.6} Q56 ${m + 4.8} 50 ${m + 5} Q44 ${m + 4.8} 43.5 ${m - 2.6} Z`} tongue={`M45 ${m + 3.4} Q50 ${m - 0.2} 55 ${m + 3.4} L55 ${m + 6} L45 ${m + 6} Z`} teeth />;
    case 'laugh':
      return <Open d={`M42 ${m - 3.6} Q50 ${m - 2} 58 ${m - 3.6} Q57.4 ${m + 6.6} 50 ${m + 6.8} Q42.6 ${m + 6.6} 42 ${m - 3.6} Z`} tongue={`M44 ${m + 4.4} Q50 ${m - 0.4} 56 ${m + 4.4} L56 ${m + 8} L44 ${m + 8} Z`} teeth />;
    case 'tongueOut':
      return (
        <Group>
          <Open d={`M46 ${m - 1.4} Q50 ${m - 0.6} 54 ${m - 1.4} Q53.6 ${m + 1.8} 50 ${m + 2} Q46.4 ${m + 1.8} 46 ${m - 1.4} Z`} />
          {/* Zunge hängt heraus: Durst. */}
          <Path path={`M47.2 ${m + 0.6} L52.8 ${m + 0.6} L52.8 ${m + 4.2} Q50 ${m + 7.6} 47.2 ${m + 4.2} Z`} color={c.tongue} />
          {line(`M47.2 ${m + 0.6} L47.2 ${m + 4.2} Q50 ${m + 7.6} 52.8 ${m + 4.2} L52.8 ${m + 0.6}`, LINE)}
          {line(`M50 ${m + 1.6} L50 ${m + 4}`, 0.8)}
        </Group>
      );
    case 'drool':
      return (
        <Group>
          <Open d={`M45.8 ${m - 1} Q50 ${m - 3.2} 54.2 ${m - 1} Q54.4 ${m + 3.6} 50 ${m + 3.8} Q45.6 ${m + 3.6} 45.8 ${m - 1} Z`} tongue={`M46.5 ${m + 2.6} Q50 ${m} 53.5 ${m + 2.6} L53.5 ${m + 5} L46.5 ${m + 5} Z`} />
          <Path path={`M53.4 ${m + 2} Q55.2 ${m + 5.6} 54.2 ${m + 7} Q52.6 ${m + 7.4} 52.8 ${m + 5} Z`} color={c.tear} />
          <Circle cx={53.6} cy={m + 5.6} r={0.5} color={c.tearLight} />
        </Group>
      );
    case 'flat':
      return line(`M45.5 ${m + 1} Q50 ${m + 1.6} 54.5 ${m + 1}`);
    case 'wavy':
      return line(`M43.5 ${m + 1.5} Q45.7 ${m - 1} 47.8 ${m + 1.5} Q50 ${m + 3.8} 52.2 ${m + 1.5} Q54.3 ${m - 1} 56.5 ${m + 1.5}`);
    case 'sickWavy':
      return line(`M44.5 ${m + 2} Q47.2 ${m - 0.8} 50 ${m + 2} Q52.8 ${m + 4.8} 55.5 ${m + 2}`, LINE * 1.3);
    case 'pout':
      // Schmollmund: kleine umgedrehte Schnute, Unterlippe vorgeschoben.
      return (
        <Group>
          {line(`M46 ${m + 3} Q50 ${m - 1.4} 54 ${m + 3}`, LINE * 1.4)}
          <Oval x={48.2} y={m + 2.4} width={3.6} height={1.8} color={c.tongueShade} />
        </Group>
      );
    case 'o':
      return <Open d={`M46.6 ${m + 1.2} A3.4 4.2 0 1 0 53.4 ${m + 1.2} A3.4 4.2 0 1 0 46.6 ${m + 1.2} Z`} tongue={`M47 ${m + 3.6} Q50 ${m + 2} 53 ${m + 3.6} L53 ${m + 6} L47 ${m + 6} Z`} />;
    case 'smallO':
      return <Open d={`M48.2 ${m + 1.6} A1.8 1.7 0 1 0 51.8 ${m + 1.6} A1.8 1.7 0 1 0 48.2 ${m + 1.6} Z`} />;
    case 'yum':
      // Mampfen: geschlossenes "w", dicke Backen, Zungenspitze.
      return (
        <Group>
          {line(`M44.5 ${m} Q47.25 ${m + 3.2} 50 ${m + 0.4} Q52.75 ${m + 3.2} 55.5 ${m}`, LINE * 1.3)}
          <Path path={`M51 ${m + 1.6} Q53 ${m + 1.6} 53 ${m + 3.4} Q52 ${m + 4.6} 51.2 ${m + 3.2} Z`} color={c.tongue} />
        </Group>
      );
    case 'yawn':
      return <Open d={`M45.4 ${m + 1} C45.4 ${m - 4.6} 54.6 ${m - 4.6} 54.6 ${m + 1} C54.6 ${m + 7.8} 45.4 ${m + 7.8} 45.4 ${m + 1} Z`} tongue={`M46 ${m + 4.8} Q50 ${m + 2} 54 ${m + 4.8} L54 ${m + 8} L46 ${m + 8} Z`} />;
    case 'kiss':
      return (
        <Group>
          {line(`M48 ${m - 1.6} Q51.6 ${m - 1.4} 50.2 ${m + 0.6} Q51.8 ${m + 2.6} 48 ${m + 2.8}`, LINE * 1.3)}
        </Group>
      );
  }
}
