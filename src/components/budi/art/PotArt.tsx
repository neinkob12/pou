import { Group, LinearGradient, Oval, Path, RoundedRect, vec } from '@shopify/react-native-skia';

import { artColors } from '../../../lib/theme';

/** Topfkörper (Trapez mit runden Ecken) und Rand, Budi-Leinwand 100 × 100. */
export const POT_BODY = 'M22 66 L78 66 Q80 66 79.6 68 L74.6 93.5 Q74 97 70.5 97 L29.5 97 Q26 97 25.4 93.5 L20.4 68 Q20 66 22 66 Z';
const BODY_SHADE = 'M64 66 L78 66 Q80 66 79.6 68 L74.6 93.5 Q74 97 70.5 97 L62 97 Q68 82 64 66 Z';
const RIM = { x: 16, y: 58.5, width: 68, height: 9.5, r: 4 };
const OUTLINE = 1.7;

/** Terrakotta-Topf mit Erde. Das Gesicht (FaceArt) liegt darüber. */
export function PotArt() {
  return (
    <Group>
      {/* Erde: nur die obere Hälfte schaut über den Rand. */}
      <Oval x={22} y={55.6} width={56} height={6.4} color={artColors.outline} />
      <Oval x={23} y={56.4} width={54} height={5} color={artColors.soil} />
      <Oval x={30} y={57} width={20} height={2} color={artColors.soilLight} />
      <Path path={POT_BODY} color={artColors.outline} style="stroke" strokeWidth={OUTLINE * 2} strokeJoin="round" />
      <Path path={POT_BODY}>
        <LinearGradient start={vec(20, 66)} end={vec(80, 97)} colors={[artColors.potLight, artColors.pot]} />
      </Path>
      <Path path={BODY_SHADE} color={artColors.potShade} opacity={0.55} />
      <RoundedRect
        x={RIM.x - OUTLINE}
        y={RIM.y - OUTLINE}
        width={RIM.width + OUTLINE * 2}
        height={RIM.height + OUTLINE * 2}
        r={RIM.r + OUTLINE}
        color={artColors.outline}
      />
      <RoundedRect x={RIM.x} y={RIM.y} width={RIM.width} height={RIM.height} r={RIM.r} color={artColors.potRim} />
      <RoundedRect x={RIM.x + 3} y={RIM.y + 1.6} width={RIM.width * 0.55} height={2} r={1} color={artColors.potLight} opacity={0.9} />
      <RoundedRect x={RIM.x + RIM.width - 12} y={RIM.y + 1} width={9} height={RIM.height - 2} r={3} color={artColors.potShade} opacity={0.5} />
    </Group>
  );
}
