// Budi als kleiner Spross für Budi Jump (Auftrag 40), in Welt-Einheiten um den Mittelpunkt.
// Eigene, einfache Skia-Figur nur für dieses Spiel; die große Budi-Grafik im Zimmer ist das nicht.

import { Circle, Oval, Path, Skia } from '@shopify/react-native-skia';

import { BUDI_JUMP } from '../../../game/config';
import { colors } from '../../../lib/theme';

const R = BUDI_JUMP.budiRadius;
const SMILE = Skia.PathBuilder.Make()
  .moveTo(-R * 0.28, R * 0.28)
  .quadTo(0, R * 0.55, R * 0.28, R * 0.28)
  .detach();
const STEM = Skia.PathBuilder.Make()
  .moveTo(0, -R * 0.9)
  .lineTo(0, -R * 1.35)
  .detach();

export function JumpBudi() {
  return (
    <>
      <Path path={STEM} color={colors.plantDark} style="stroke" strokeWidth={0.6} strokeCap="round" />
      <Oval x={-R * 1.05} y={-R * 1.75} width={R * 1.0} height={R * 0.55} color={colors.plantLight} />
      <Oval x={R * 0.05} y={-R * 1.75} width={R * 1.0} height={R * 0.55} color={colors.plantLight} />
      <Circle cx={0} cy={0} r={R} color={colors.plantLight} />
      <Circle cx={0} cy={0} r={R} color={colors.plantDark} style="stroke" strokeWidth={0.7} />
      <Circle cx={-R * 0.35} cy={-R * 0.15} r={R * 0.22} color={colors.white} />
      <Circle cx={R * 0.35} cy={-R * 0.15} r={R * 0.22} color={colors.white} />
      <Circle cx={-R * 0.32} cy={-R * 0.12} r={R * 0.12} color={colors.ink} />
      <Circle cx={R * 0.38} cy={-R * 0.12} r={R * 0.12} color={colors.ink} />
      <Path path={SMILE} color={colors.ink} style="stroke" strokeWidth={0.5} strokeCap="round" />
      <Circle cx={-R * 0.62} cy={R * 0.25} r={R * 0.14} color={colors.coral} opacity={0.6} />
      <Circle cx={R * 0.62} cy={R * 0.25} r={R * 0.14} color={colors.coral} opacity={0.6} />
    </>
  );
}
