import { Circle, Group, Oval, Path, RoundedRect } from '@shopify/react-native-skia';
import type { ReactNode } from 'react';

import { iconColors as c, iconInk } from './iconPalette';
import { Dot, Shape, shine, Sparkle, starPath } from './shapes';
import { darken, lighten } from './tint';

// Oberflächen-Icons (ART-2): Tabs, Münze, Stern, Schloss, Samen, Edelstein. Einheiten 100 × 100.

export type HudIconId =
  | 'minigames'
  | 'shop'
  | 'album'
  | 'settings'
  | 'coin'
  | 'star'
  | 'lock'
  | 'seed'
  | 'seedFragment'
  | 'gem';

const HEART = 'M50 86 C18 66 10 48 14 34 C18 20 38 14 50 30 C62 14 82 20 86 34 C90 48 82 66 50 86 Z';
const LEAF = 'M22 80 C18 48 38 18 82 16 C84 56 62 84 22 80 Z';
const SEED = 'M50 8 C72 20 80 44 76 66 C72 84 60 94 50 94 C40 94 28 84 24 66 C20 44 28 20 50 8 Z';

/** Zahnrad mit acht Zähnen, als ein Pfad, damit die Kontur außen herum läuft. */
function gearPath(): string {
  const teeth = 8;
  const pts: string[] = [];
  for (let i = 0; i < teeth; i++) {
    const a = (i / teeth) * Math.PI * 2;
    const w = (Math.PI / teeth) * 0.55;
    for (const [da, r] of [
      [-w * 1.25, 33],
      [-w * 0.75, 44],
      [w * 0.75, 44],
      [w * 1.25, 33],
    ] as const) {
      pts.push(`${(50 + Math.cos(a + da) * r).toFixed(2)} ${(50 + Math.sin(a + da) * r).toFixed(2)}`);
    }
  }
  return `M${pts.join(' L')} Z`;
}
const GEAR = gearPath();

export const HUD_ICONS: Record<HudIconId, () => ReactNode> = {
  minigames: () => (
    <Group>
      <Shape d="M24 30 C10 30 4 48 6 66 C8 82 22 86 30 76 L38 66 L62 66 L70 76 C78 86 92 82 94 66 C96 48 90 30 76 30 Z" fill={c.lavender} />
      <RoundedRect x={19} y={44} width={8} height={22} r={2} color={iconInk.outline} />
      <RoundedRect x={12} y={51} width={22} height={8} r={2} color={iconInk.outline} />
      <Dot cx={70} cy={46} r={5} fill={c.coral} line={4} />
      <Dot cx={80} cy={56} r={5} fill={c.sun} line={4} />
      <Dot cx={60} cy={56} r={5} fill={c.leaf} line={4} />
      <Dot cx={70} cy={66} r={4.5} fill={c.water} line={4} />
    </Group>
  ),
  shop: () => (
    <Group>
      <Path path="M34 36 C34 12 66 12 66 36" color={iconInk.outline} style="stroke" strokeWidth={11} strokeCap="round" />
      <Path path="M34 36 C34 12 66 12 66 36" color={c.coinRim} style="stroke" strokeWidth={5} strokeCap="round" />
      <Shape d="M16 32 L84 32 L78 88 C78 92 75 94 71 94 L29 94 C25 94 22 92 22 88 Z" fill={c.coral} />
      <Path path="M16 44 L84 44" color={iconInk.outline} style="stroke" strokeWidth={4} opacity={0.35} />
      <Path path={HEART} color={iconInk.outline} transform={[{ translateX: 30 }, { translateY: 46 }, { scale: 0.4 }]} />
      <Path path={HEART} color={c.white} transform={[{ translateX: 32.5 }, { translateY: 48 }, { scale: 0.35 }]} />
    </Group>
  ),
  album: () => (
    <Group>
      <Shape d="M10 24 C28 16 42 18 50 28 L50 90 C42 80 28 78 10 86 Z" fill={c.leaf} />
      <Shape d="M90 24 C72 16 58 18 50 28 L50 90 C58 80 72 78 90 86 Z" fill={lighten(c.leaf, 0.35)} />
      <Path path="M18 40 L40 35 M18 52 L40 47 M18 64 L34 60" color={iconInk.outline} style="stroke" strokeWidth={3.5} strokeCap="round" opacity={0.5} />
      <Path path={starPath(70, 52, 13)} color={iconInk.outline} />
      <Path path={starPath(70, 52, 9.5)} color={c.star} />
      <Path path="M60 10 L60 30 L65 25 L70 30 L70 10 Z" color={c.coral} />
    </Group>
  ),
  settings: () => (
    <Group>
      <Shape d={GEAR} fill={c.metalLight} />
      <Dot cx={50} cy={50} r={13} fill={c.cream} flat />
      <Circle cx={50} cy={50} r={6} color={iconInk.outline} opacity={0.25} />
    </Group>
  ),
  coin: () => (
    <Group>
      <Dot cx={50} cy={52} r={40} fill={c.coinRim} />
      <Dot cx={50} cy={48} r={40} fill={c.coin} />
      <Circle cx={50} cy={48} r={29} color={darken(c.coin, 0.2)} />
      <Circle cx={50} cy={49.5} r={27} color={c.coinFace} />
      <Path path={LEAF} color={darken(c.coin, 0.35)} transform={[{ translateX: 28 }, { translateY: 28 }, { scale: 0.44 }]} />
      <Path path={LEAF} color={c.white} opacity={0.95} transform={[{ translateX: 27 }, { translateY: 26.5 }, { scale: 0.44 }]} />
      {shine('M22 40 C24 30 32 20 42 17', 6)}
      <Sparkle cx={80} cy={18} r={10} />
    </Group>
  ),
  star: () => (
    <Group>
      <Shape d={starPath(50, 54, 44, 0.5)} fill={c.star} line={8} />
      <Path path={starPath(50, 54, 22, 0.5)} color={lighten(c.star, 0.45)} opacity={0.7} />
      <Sparkle cx={84} cy={16} r={9} />
    </Group>
  ),
  lock: () => (
    <Group>
      <Path path="M30 46 L30 32 C30 6 70 6 70 32 L70 46" color={iconInk.outline} style="stroke" strokeWidth={17} strokeCap="round" />
      <Path path="M30 46 L30 32 C30 6 70 6 70 32 L70 46" color={c.metalLight} style="stroke" strokeWidth={9} strokeCap="round" />
      <Shape d="M20 42 L80 42 C85 42 88 45 88 50 L88 84 C88 89 85 92 80 92 L20 92 C15 92 12 89 12 84 L12 50 C12 45 15 42 20 42 Z" fill={c.lockBody} />
      <Circle cx={50} cy={62} r={8} color={iconInk.outline} />
      <RoundedRect x={46} y={64} width={8} height={16} r={3} color={iconInk.outline} />
    </Group>
  ),
  seed: () => (
    <Group>
      <Shape d={SEED} fill={c.seed} />
      <Path path="M50 12 C46 40 46 66 50 90" color={iconInk.outline} style="stroke" strokeWidth={3.5} strokeCap="round" opacity={0.45} />
      {[
        [36, 46],
        [62, 58],
        [40, 72],
        [60, 34],
      ].map(([x, y]) => (
        <Oval key={`${x}${y}`} x={x - 4} y={y - 2.5} width={8} height={5} color={c.seedDeep} opacity={0.7} />
      ))}
      {shine('M34 32 C36 26 40 20 44 18', 5)}
    </Group>
  ),
  // U10: Viertel eines leuchtenden Samens
  seedFragment: () => (
    <Group>
      <Circle cx={50} cy={54} r={40} color={c.sun} opacity={0.3} />
      <Circle cx={50} cy={54} r={28} color={c.sun} opacity={0.35} />
      <Shape d="M50 10 C70 22 78 44 76 62 L50 62 Z" fill={lighten(c.seed, 0.25)} />
      <Path path="M50 62 L50 14 M50 62 L74 62" color={iconInk.outline} style="stroke" strokeWidth={3} opacity={0.5} />
      <Path path="M54 22 C64 30 70 42 70 54" color={c.sun} style="stroke" strokeWidth={3} strokeCap="round" opacity={0.8} />
      <Sparkle cx={28} cy={30} r={9} color={c.star} />
      <Sparkle cx={78} cy={82} r={7} />
      <Sparkle cx={30} cy={78} r={5} color={c.star} />
    </Group>
  ),
  gem: () => (
    <Group>
      <Shape d="M28 18 L72 18 L92 40 L50 92 L8 40 Z" fill={c.gem} />
      <Path path="M8 40 L92 40 M28 18 L38 40 L50 92 L62 40 L72 18 M38 40 L50 18 L62 40" color={iconInk.outline} style="stroke" strokeWidth={3} strokeJoin="round" opacity={0.5} />
      <Path path="M28 18 L38 40 L8 40 Z" color={c.white} opacity={0.45} />
      <Sparkle cx={78} cy={70} r={10} />
    </Group>
  ),
};
