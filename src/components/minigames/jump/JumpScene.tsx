// Zeichnet Budi Jump mit Skia (Auftrag 40: eigene Grafik statt Platzhalter). Liest nur Shared Values,
// rendert also ohne React mit 60 fps. Himmel wird mit der Höhe zur Nacht, Blätter als Blattformen je
// Typ (normal grün, brechend braun mit Riss, Feder lavendel mit Spirale), Lichtpunkte leuchten,
// Budi ist ein Spross mit Gesicht und staucht sich beim Landen.

import { Group, LinearGradient, Path, Rect, Skia, vec, type SkPathBuilder } from '@shopify/react-native-skia';
import type { ReactNode } from 'react';
import { useDerivedValue, type SharedValue } from 'react-native-reanimated';

import { BUDI_JUMP } from '../../../game/config';
import { colors, gameColors } from '../../../lib/theme';
import { JumpBudi } from './JumpBudi';
import { budiShape, skyAt, starsVisibility } from './jumpFeel';
import type { JumpWorld, Platform } from './jumpWorld';

interface JumpSceneProps {
  world: SharedValue<JumpWorld>;
  size: SharedValue<{ width: number; height: number }>;
  /** Effekt-Uhr und Zeitpunkt der letzten Landung (ms), für Budis Stauchen. */
  now: SharedValue<number>;
  lastLandingMs: SharedValue<number>;
  children?: ReactNode;
}

/** Sterne am Nachthimmel: Lage als Anteil der Fläche. */
const STARS = Array.from({ length: 28 }, (_, i) => ({
  x: ((i * 37) % 100) / 100,
  y: ((i * 61) % 97) / 97,
  r: 1 + (i % 3),
}));

/** Ein Blatt mit Spitzen links und rechts, (x, y) ist die Oberkante in Pixeln. */
function addLeaf(b: SkPathBuilder, x: number, y: number, w: number, h: number) {
  'worklet';
  b.moveTo(x - w / 2, y + h / 2);
  b.quadTo(x, y - h * 0.9, x + w / 2, y + h / 2);
  b.quadTo(x, y + h * 1.9, x - w / 2, y + h / 2);
  b.close();
}

type Part = 'leaf' | 'rib' | 'crack' | 'coil';

/** Alle Blätter, die `pick` auswählt, als ein Pfad in Pixeln: Fläche, Mittelrippe, Riss oder Feder. */
function leafPath(w: JumpWorld, width: number, height: number, pick: (p: Platform) => boolean, part: Part) {
  'worklet';
  const k = width / BUDI_JUMP.worldWidth;
  const lw = BUDI_JUMP.platformWidth * k;
  const lh = BUDI_JUMP.platformHeight * k * 1.3;
  const b = Skia.PathBuilder.Make();
  for (const p of w.platforms) {
    if (!pick(p)) continue;
    const x = p.x * k;
    const y = height - (p.y - w.cameraY) * k;
    if (y < -lh * 3 || y > height + lh * 3) continue;
    if (part === 'leaf') addLeaf(b, x, y, lw, lh);
    else if (part === 'rib') {
      b.moveTo(x - lw * 0.42, y + lh / 2);
      b.lineTo(x + lw * 0.42, y + lh / 2);
    } else if (part === 'crack') {
      b.moveTo(x - lw * 0.05, y - lh * 0.2);
      b.lineTo(x + lw * 0.04, y + lh * 0.4);
      b.lineTo(x - lw * 0.06, y + lh * 0.8);
      b.lineTo(x + lw * 0.03, y + lh * 1.2);
    } else {
      const top = y + lh;
      for (let i = 0; i < 4; i += 1) {
        b.moveTo(x - lw * 0.12, top + i * lh * 0.35);
        b.lineTo(x + lw * 0.12, top + (i + 0.5) * lh * 0.35);
      }
    }
  }
  return b.detach();
}

function Sky({ world, size }: Pick<JumpSceneProps, 'world' | 'size'>) {
  const w = useDerivedValue(() => size.get().width);
  const h = useDerivedValue(() => size.get().height);
  const end = useDerivedValue(() => vec(0, size.get().height));
  const sky = useDerivedValue(() => {
    const { top, bottom } = skyAt(world.get().cameraY);
    return [top, bottom];
  });
  const starOpacity = useDerivedValue(() => starsVisibility(world.get().cameraY));
  const stars = useDerivedValue(() => {
    const { width, height } = size.get();
    const shift = (world.get().cameraY * 0.15) % height;
    const b = Skia.PathBuilder.Make();
    for (const s of STARS) b.addCircle(s.x * width, (s.y * height + shift) % height, s.r);
    return b.detach();
  });
  return (
    <>
      <Rect x={0} y={0} width={w} height={h}>
        <LinearGradient start={vec(0, 0)} end={end} colors={sky} />
      </Rect>
      <Path path={stars} color={colors.white} opacity={starOpacity} />
    </>
  );
}

function useLeaves(
  world: SharedValue<JumpWorld>,
  size: JumpSceneProps['size'],
  pick: (p: Platform) => boolean,
  part: Part,
) {
  return useDerivedValue(() => {
    const { width, height } = size.get();
    return leafPath(world.get(), width, height, pick, part);
  });
}

export function JumpScene({ world, size, now, lastLandingMs, children }: JumpSceneProps) {
  const isNormal = (p: Platform) => {
    'worklet';
    return p.kind === 'normal';
  };
  const isBreaking = (p: Platform) => {
    'worklet';
    return p.kind === 'breaking' && !p.broken;
  };
  const isBroken = (p: Platform) => {
    'worklet';
    return p.broken;
  };
  const isSpring = (p: Platform) => {
    'worklet';
    return p.kind === 'spring';
  };
  const normal = useLeaves(world, size, isNormal, 'leaf');
  const normalRib = useLeaves(world, size, isNormal, 'rib');
  const breaking = useLeaves(world, size, isBreaking, 'leaf');
  const crack = useLeaves(world, size, isBreaking, 'crack');
  const broken = useLeaves(world, size, isBroken, 'leaf');
  const spring = useLeaves(world, size, isSpring, 'leaf');
  const springRib = useLeaves(world, size, isSpring, 'rib');
  const coil = useLeaves(world, size, isSpring, 'coil');

  const lights = useDerivedValue(() => {
    const { width, height } = size.get();
    const w = world.get();
    const k = width / BUDI_JUMP.worldWidth;
    const b = Skia.PathBuilder.Make();
    for (const l of w.lights) b.addCircle(l.x * k, height - (l.y - w.cameraY) * k, BUDI_JUMP.lightRadius * k);
    return b.detach();
  });
  const halos = useDerivedValue(() => {
    const { width, height } = size.get();
    const w = world.get();
    const k = width / BUDI_JUMP.worldWidth;
    const pulse = 1.8 + Math.sin(now.get() / 160) * 0.25;
    const b = Skia.PathBuilder.Make();
    for (const l of w.lights) b.addCircle(l.x * k, height - (l.y - w.cameraY) * k, BUDI_JUMP.lightRadius * k * pulse);
    return b.detach();
  });

  const budiAt = (shift: number) => {
    'worklet';
    const { width, height } = size.get();
    const w = world.get();
    const k = width / BUDI_JUMP.worldWidth;
    const { sx, sy } = budiShape(now.get() - lastLandingMs.get(), w.vy);
    // Stauchen um die Füße, damit Budi auf dem Blatt stehen bleibt.
    const feet = BUDI_JUMP.budiRadius * k;
    return [
      { translateX: (w.x + shift) * k },
      { translateY: height - (w.y - w.cameraY) * k + feet * (1 - sy) },
      { scaleX: k * sx },
      { scaleY: k * sy },
    ];
  };
  const budi = useDerivedValue(() => budiAt(0));
  // Zweites Bild auf der anderen Seite, damit Budi beim Wechsel über den Rand nicht springt.
  const budiWrap = useDerivedValue(() =>
    budiAt(world.get().x < BUDI_JUMP.worldWidth / 2 ? BUDI_JUMP.worldWidth : -BUDI_JUMP.worldWidth),
  );

  return (
    <>
      <Sky world={world} size={size} />
      <Path path={halos} color={colors.lamp} opacity={0.3} />
      <Path path={lights} color={colors.lamp} />
      <Path path={normal} color={colors.plantLight} />
      <Path path={normal} color={colors.plantDark} style="stroke" strokeWidth={1.5} />
      <Path path={normalRib} color={colors.plantDark} style="stroke" strokeWidth={1.2} opacity={0.6} />
      <Path path={breaking} color={colors.terracotta} />
      <Path path={breaking} color={gameColors.soil} style="stroke" strokeWidth={1.5} />
      <Path path={crack} color={gameColors.soil} style="stroke" strokeWidth={1.5} />
      <Path path={broken} color={colors.terracotta} opacity={0.35} />
      <Path path={coil} color={colors.night} style="stroke" strokeWidth={1.5} strokeCap="round" opacity={0.6} />
      <Path path={spring} color={colors.lavender} />
      <Path path={spring} color={colors.night} style="stroke" strokeWidth={1.5} opacity={0.6} />
      <Path path={springRib} color={colors.white} style="stroke" strokeWidth={1.2} opacity={0.7} />
      <Group transform={budi}>
        <JumpBudi />
      </Group>
      <Group transform={budiWrap}>
        <JumpBudi />
      </Group>
      {children}
    </>
  );
}
