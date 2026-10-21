import { Group, LinearGradient, Oval, Path, RadialGradient, RoundedRect, vec } from '@shopify/react-native-skia';

import { budiColors as c } from './budiColors';
import { POT_BODY, POT_RIM as RIM } from './potShape';

export { POT_BODY };

// Budis Körper: bauchiger Terrakotta-Topf mit Verläufen, Glanz und dicker Kontur (ART-3).
const LINE = 2.3;

/** Glanzfleck oben links auf dem Bauch: wirkt wie glasierter Ton. */
const GLOSS = 'M24 72.5 C25 70 30 69.6 36 69.8 C38.6 70 38.8 72 36.6 72.8 C31 74.6 27 76.4 25 78.6 C23.4 80 22.8 75.4 24 72.5 Z';

/** Weicher Schlagschatten unter Budi. Eigene Ebene, damit er beim Hüpfen am Boden bleibt. */
export function ShadowArt() {
  return (
    <Oval x={18} y={93.2} width={64} height={7.6}>
      <RadialGradient c={vec(50, 97)} r={32} colors={[c.floorShadow, c.floorShadow, c.floorShadowFade]} positions={[0, 0.45, 1]} />
    </Oval>
  );
}

/** Topf mit Erde, Verläufen, Glanz und dicker Kontur. Das Gesicht (FaceArt) liegt darüber. */
export function PotArt() {
  return (
    <Group>
      {/* Erde: nur die Wölbung schaut über den Rand. */}
      <Oval x={21} y={54.2} width={58} height={7.4}>
        <LinearGradient start={vec(0, 54)} end={vec(0, 61)} colors={[c.soilTop, c.soilBottom]} />
      </Oval>
      <Oval x={21} y={54.2} width={58} height={7.4} color={c.potLine} style="stroke" strokeWidth={LINE * 0.8} />
      <Oval x={31} y={55.4} width={16} height={2} color={c.glossSoft} />

      <Path path={POT_BODY}>
        <RadialGradient c={vec(40, 72)} r={34} colors={[c.potTop, c.potMid, c.potBottom]} positions={[0, 0.5, 1]} />
      </Path>
      {/* Schatten unter dem Rand. */}
      <Path path={POT_BODY}>
        <LinearGradient start={vec(0, 67)} end={vec(0, 73)} colors={[c.rimShadow, c.rimShadowFade]} />
      </Path>
      <Path path={GLOSS} color={c.gloss} />
      <Oval x={74} y={74} width={2.6} height={4.4} color={c.glossSoft} />
      <Path path={POT_BODY} color={c.potLine} style="stroke" strokeWidth={LINE} strokeJoin="round" />

      <RoundedRect x={RIM.x} y={RIM.y} width={RIM.width} height={RIM.height} r={RIM.r}>
        <LinearGradient start={vec(0, RIM.y)} end={vec(0, RIM.y + RIM.height)} colors={[c.potRimTop, c.potMid, c.potRimBottom]} positions={[0, 0.45, 1]} />
      </RoundedRect>
      <RoundedRect x={RIM.x + 4} y={RIM.y + 1.7} width={RIM.width * 0.5} height={2.2} r={1.1} color={c.gloss} />
      <RoundedRect x={RIM.x + RIM.width * 0.5 + 7} y={RIM.y + 1.7} width={4} height={2.2} r={1.1} color={c.glossSoft} />
      <RoundedRect x={RIM.x} y={RIM.y} width={RIM.width} height={RIM.height} r={RIM.r} color={c.potLine} style="stroke" strokeWidth={LINE} />
    </Group>
  );
}
