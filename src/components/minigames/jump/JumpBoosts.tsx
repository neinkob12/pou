// Sonnenstrahlen von Budi Jump (Auftrag 45): Sonnen mit acht Strahlen, die sich drehen. Ein Pfad für alle.

import { Path, Skia } from '@shopify/react-native-skia';
import { useDerivedValue, type SharedValue } from 'react-native-reanimated';

import { BUDI_JUMP, MINIGAME_FUN } from '../../../game/config';
import { funColors } from '../../../lib/theme';
import type { JumpWorld } from './jumpWorld';

interface JumpBoostsProps {
  world: SharedValue<JumpWorld>;
  size: SharedValue<{ width: number; height: number }>;
  now: SharedValue<number>;
}

export function JumpBoosts({ world, size, now }: JumpBoostsProps) {
  const boosts = useDerivedValue(() => {
    const { width, height } = size.get();
    const w = world.get();
    const k = width / BUDI_JUMP.worldWidth;
    const r = MINIGAME_FUN.jump.boostRadius * k;
    const turn = now.get() / 600;
    const b = Skia.PathBuilder.Make();
    for (const s of w.boosts ?? []) {
      const cx = s.x * k;
      const cy = height - (s.y - w.cameraY) * k;
      for (let i = 0; i < 16; i += 1) {
        const a = turn + (i * Math.PI) / 8;
        const rr = i % 2 === 0 ? r * 1.9 : r * 1.1;
        if (i === 0) b.moveTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
        else b.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
      }
      b.close();
    }
    return b.detach();
  });
  return (
    <>
      <Path path={boosts} color={funColors.gold} />
      <Path path={boosts} color={funColors.goldDeep} style="stroke" strokeWidth={1.5} />
    </>
  );
}
