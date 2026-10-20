// Hintergrund von "Schädlings-Smash" (Auftrag 40): ein großes Blatt mit Spitze, Mittelrippe und
// Seitenadern, darunter Erde. Alles aus der Feldgröße berechnet, damit es auf jedem Bildschirm passt.

import { Group, LinearGradient, Path, Rect, Skia, vec } from '@shopify/react-native-skia';
import { useDerivedValue, type SharedValue } from 'react-native-reanimated';

import { colors, gameColors } from '../../../lib/theme';

/** Seitenadern je Seite. */
const VEINS = 6;

interface SmashLeafProps {
  size: SharedValue<{ width: number; height: number }>;
}

export function SmashLeaf({ size }: SmashLeafProps) {
  const w = useDerivedValue(() => size.get().width);
  const h = useDerivedValue(() => size.get().height);
  const gradientEnd = useDerivedValue(() => vec(size.get().width, size.get().height));
  const leaf = useDerivedValue(() => {
    const { width, height } = size.get();
    const b = Skia.PathBuilder.Make();
    const cx = width / 2;
    const top = height * 0.01;
    const bottom = height * 0.99;
    // Kontrollpunkte außerhalb des Felds, damit der Bauch des Blatts fast bis an den Rand reicht.
    const out = width * 0.62;
    b.moveTo(cx, top);
    b.cubicTo(cx + out, height * 0.12, cx + out, height * 0.78, cx, bottom);
    b.cubicTo(cx - out, height * 0.78, cx - out, height * 0.12, cx, top);
    b.close();
    return b.detach();
  });
  const veins = useDerivedValue(() => {
    const { width, height } = size.get();
    const b = Skia.PathBuilder.Make();
    const cx = width / 2;
    b.moveTo(cx, height * 0.04);
    b.lineTo(cx, height * 0.97);
    for (let i = 1; i <= VEINS; i += 1) {
      const y = height * (0.08 + (i / (VEINS + 1)) * 0.82);
      const reach = width * 0.42 * Math.sin((i / (VEINS + 1)) * Math.PI) + width * 0.05;
      b.moveTo(cx, y);
      b.quadTo(cx + reach * 0.5, y - height * 0.02, cx + reach, y - height * 0.07);
      b.moveTo(cx, y);
      b.quadTo(cx - reach * 0.5, y - height * 0.02, cx - reach, y - height * 0.07);
    }
    return b.detach();
  });

  return (
    <>
      <Rect x={0} y={0} width={w} height={h} color={gameColors.creamDeep} />
      <Path path={leaf}>
        <LinearGradient
          start={vec(0, 0)}
          end={gradientEnd}
          colors={[gameColors.leafLight, colors.plantLight, gameColors.leafVein]}
        />
      </Path>
      <Path path={leaf} color={colors.plantDark} style="stroke" strokeWidth={3} opacity={0.5} />
      <Group clip={leaf}>
        <Path path={veins} color={colors.plantDark} style="stroke" strokeWidth={2} strokeCap="round" opacity={0.25} />
      </Group>
    </>
  );
}
