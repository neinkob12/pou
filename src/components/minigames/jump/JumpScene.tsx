// Zeichnet Budi Jump mit Skia. Liest nur Shared Values, rendert also ohne React mit 60 fps.
// Platzhalter: Blätter als Pillen je Typ (normal grün, brechend terrakotta, Feder lavendel),
// Lichtpunkte als gelbe Kreise, Budi als grüner Kreis mit Gesicht (Assets M9, M10, M11, B11 fehlen).

import { Canvas, Circle, Group, Path, Skia, type SkPath } from '@shopify/react-native-skia';
import { useDerivedValue, type SharedValue } from 'react-native-reanimated';

import { BUDI_JUMP } from '../../../game/config';
import { colors } from '../../../lib/theme';
import type { JumpWorld, Platform } from './jumpWorld';

interface JumpSceneProps {
  world: SharedValue<JumpWorld>;
  size: SharedValue<{ width: number; height: number }>;
}

const R = BUDI_JUMP.budiRadius;

/** Budi in Welt-Einheiten um den Ursprung, die Gruppe skaliert auf Pixel. */
function BudiFigure() {
  return (
    <>
      <Circle cx={0} cy={0} r={R} color={colors.plantLight} />
      <Circle cx={0} cy={0} r={R} color={colors.plantDark} style="stroke" strokeWidth={0.8} />
      <Circle cx={-2} cy={-1.2} r={0.9} color={colors.ink} />
      <Circle cx={2} cy={-1.2} r={0.9} color={colors.ink} />
      <Circle cx={0} cy={1.8} r={1.1} color={colors.coral} />
    </>
  );
}

/** Alle Blätter, die `pick` auswählt, als ein Pfad in Pixeln. */
function leafPath(w: JumpWorld, width: number, height: number, pick: (p: Platform) => boolean): SkPath {
  'worklet';
  const k = width / BUDI_JUMP.worldWidth;
  const ph = BUDI_JUMP.platformHeight * k;
  const builder = Skia.PathBuilder.Make();
  for (const p of w.platforms) {
    if (!pick(p)) continue;
    builder.addRRect({
      rect: {
        x: (p.x - BUDI_JUMP.platformWidth / 2) * k,
        y: height - (p.y - w.cameraY) * k,
        width: BUDI_JUMP.platformWidth * k,
        height: ph,
      },
      rx: ph / 2,
      ry: ph / 2,
    });
  }
  return builder.detach();
}

export function JumpScene({ world, size }: JumpSceneProps) {
  const normal = useDerivedValue(() => {
    const { width, height } = size.get();
    return leafPath(world.get(), width, height, (p) => p.kind === 'normal');
  });
  const breaking = useDerivedValue(() => {
    const { width, height } = size.get();
    return leafPath(world.get(), width, height, (p) => p.kind === 'breaking' && !p.broken);
  });
  const broken = useDerivedValue(() => {
    const { width, height } = size.get();
    return leafPath(world.get(), width, height, (p) => p.broken);
  });
  const spring = useDerivedValue(() => {
    const { width, height } = size.get();
    return leafPath(world.get(), width, height, (p) => p.kind === 'spring');
  });

  const lights = useDerivedValue(() => {
    const { width, height } = size.get();
    const w = world.get();
    const k = width / BUDI_JUMP.worldWidth;
    const builder = Skia.PathBuilder.Make();
    for (const l of w.lights) {
      builder.addCircle(l.x * k, height - (l.y - w.cameraY) * k, BUDI_JUMP.lightRadius * k);
    }
    return builder.detach();
  });

  const budi = useDerivedValue(() => {
    const { width, height } = size.get();
    const w = world.get();
    const k = width / BUDI_JUMP.worldWidth;
    return [{ translateX: w.x * k }, { translateY: height - (w.y - w.cameraY) * k }, { scale: k }];
  });

  // Zweites Bild auf der anderen Seite, damit Budi beim Wechsel über den Rand nicht springt.
  const budiWrap = useDerivedValue(() => {
    const { width, height } = size.get();
    const w = world.get();
    const k = width / BUDI_JUMP.worldWidth;
    const shift = w.x < BUDI_JUMP.worldWidth / 2 ? BUDI_JUMP.worldWidth : -BUDI_JUMP.worldWidth;
    return [{ translateX: (w.x + shift) * k }, { translateY: height - (w.y - w.cameraY) * k }, { scale: k }];
  });

  return (
    <Canvas style={{ flex: 1 }} pointerEvents="none">
      <Path path={normal} color={colors.plantDark} />
      <Path path={breaking} color={colors.terracotta} />
      <Path path={broken} color={colors.terracotta} opacity={0.4} />
      <Path path={spring} color={colors.lavender} />
      <Path path={lights} color={colors.lamp} />
      <Group transform={budi}>
        <BudiFigure />
      </Group>
      <Group transform={budiWrap}>
        <BudiFigure />
      </Group>
    </Canvas>
  );
}
