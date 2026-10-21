// Bewegte Szene von Budi Jump (Auftrag 51): Blätter, Lichtkugeln (pulsieren), Sonnen (drehen), Budi
// mit Stauchen und Strecken, Blick in Laufrichtung, dazu Effekte. Alles in eine Picture.
// Reihenfolge beachten: Worklets werden im Web nicht vorgezogen, Helfer stehen vor ihrer Nutzung.

import type { SkCanvas } from '@shopify/react-native-skia';

import { BUDI_JUMP, MINIGAME_FUN } from '../../../game/config';
import { drawFlash, drawFx } from '../framework/art/drawFx';
import { stamp } from '../framework/art/kit';
import type { FxState } from '../framework/fx/fxLogic';
import { jumpSprites } from './jumpArt';
import { budiShape } from './jumpFeel';
import type { JumpWorld } from './jumpWorld';

export interface JumpFrame {
  world: JumpWorld;
  width: number;
  height: number;
  now: number;
  lastLandingMs: number;
  fx: FxState;
  palette: readonly string[];
  sparkles: readonly number[];
}

export function drawJumpScene(canvas: SkCanvas, f: JumpFrame) {
  'worklet';
  const sprites = jumpSprites();
  const { world: w, width, height, now } = f;
  if (width === 0) return;
  const k = width / BUDI_JUMP.worldWidth;
  const lw = BUDI_JUMP.platformWidth * k;
  const screenY = (y: number) => {
    'worklet';
    return height - (y - w.cameraY) * k;
  };
  for (const p of w.platforms) {
    const y = screenY(p.y);
    if (y < -lw || y > height + lw) continue;
    const x = p.x * k;
    let sprite = sprites.normal;
    if (p.broken) sprite = sprites.broken;
    else if (p.kind === 'breaking') sprite = sprites.breaking;
    else if (p.kind === 'spring') sprite = sprites.spring;
    else if (p.vx) sprite = sprites.moving;
    // Blätter wiegen sich leicht, jedes im eigenen Takt.
    const sway = p.broken ? 0 : Math.sin(now / 600 + p.y * 0.07) * 0.04;
    stamp(canvas, sprite, x, y, lw, lw, sway);
  }
  const pulse = 1 + Math.sin(now / 160) * 0.12;
  const lr = BUDI_JUMP.lightRadius * k;
  for (const l of w.lights) stamp(canvas, sprites.light, l.x * k, screenY(l.y), lr * pulse);
  const br = MINIGAME_FUN.jump.boostRadius * k;
  for (const s of w.boosts ?? []) stamp(canvas, sprites.sun, s.x * k, screenY(s.y), br, br, now / 600);
  // Budi: staucht um die Füße, schaut in Laufrichtung, zweites Bild am anderen Rand beim Wechsel.
  const { sx, sy } = budiShape(now - f.lastLandingMs, w.vy);
  const r = BUDI_JUMP.budiRadius * k;
  const face = w.vx < -2 ? -1 : 1;
  const by = screenY(w.y) + r * (1 - sy);
  const tilt = Math.max(-0.25, Math.min(0.25, w.vx / 400));
  stamp(canvas, sprites.budi, w.x * k, by, r * sx * face, r * sy, tilt);
  const wrap = w.x < BUDI_JUMP.worldWidth / 2 ? BUDI_JUMP.worldWidth : -BUDI_JUMP.worldWidth;
  stamp(canvas, sprites.budi, (w.x + wrap) * k, by, r * sx * face, r * sy, tilt);
  drawFx(canvas, f.fx, now, f.palette, f.sparkles);
  drawFlash(canvas, f.fx, now, width, height);
}
