// Bewegte Szene von "Schädlings-Smash" (Auftrag 51): zeichnet alle Tiere, Kleckse und Effekte in eine
// Picture. Auftauchen mit Überschwingen aus dem Loch, Atmen (Squash & Stretch), Wackeln, Flügelschlag,
// Abtauchen kurz vor Ende, Treffer quetscht platt auf einen Klecks.
// Reihenfolge beachten: Worklets werden im Web nicht vorgezogen, Helfer stehen vor ihrer Nutzung.

import type { SkCanvas } from '@shopify/react-native-skia';

import { PEST_SMASH } from '../../../game/config';
import { drawFlash, drawFx } from '../framework/art/drawFx';
import { stamp } from '../framework/art/kit';
import { popIn } from '../framework/art/motion';
import type { FxState } from '../framework/fx/fxLogic';
import { holeLayout, type Critter, type SmashState } from './pestSmash';
import { smashSprites } from './smashArt';

/** Tiergröße relativ zur halben Zellbreite (wie das Loch im Hintergrund). */
const CRITTER_SCALE = 0.6;
const POP_IN_MS = 220;
const SINK_MS = 140;

/** Wie weit ein Tier gerade aus dem Loch schaut (0 drin, 1 ganz draußen). */
export function emergeAt(c: Critter, elapsedMs: number): number {
  'worklet';
  const age = elapsedMs - c.spawnedAtMs;
  if (c.hitAtMs !== null) return 1;
  const left = c.lifetimeMs - age;
  if (left < SINK_MS) return Math.max(0, left / SINK_MS);
  return popIn(Math.min(1, age / POP_IN_MS));
}

function drawCritter(canvas: SkCanvas, c: Critter, elapsed: number, width: number, height: number) {
  'worklet';
  const sprites = smashSprites();
  const { x, y, cell } = holeLayout(c.hole, width, height, PEST_SMASH);
  const k = cell * CRITTER_SCALE;
  const armored = c.kind === 'armored';
  const size = armored ? k * 1.15 : k;
  if (c.hitAtMs !== null) {
    const t = Math.min(1, (elapsed - c.hitAtMs) / PEST_SMASH.hitShowMs);
    const splat = c.kind === 'gnat' ? sprites.splatGnat : c.kind === 'ladybug' ? sprites.splatBug : sprites.splatMite;
    const grow = 0.5 + 0.7 * Math.min(1, t * 3);
    stamp(canvas, splat, x, y + k * 0.25, k * grow, k * grow);
    const body = c.kind === 'gnat' ? sprites.gnat : c.kind === 'ladybug' ? sprites.ladybug : sprites.mite;
    stamp(canvas, body, x, y + k * 0.2, size * (1.45 + t * 0.15), size * (0.38 - t * 0.2));
    return;
  }
  const out = emergeAt(c, elapsed);
  if (out <= 0.01) return;
  const phase = elapsed / 130 + c.hole * 1.7;
  const breathe = Math.sin(phase) * 0.06;
  const sx = size * Math.max(0.01, out) * (1 - breathe * 0.6);
  const sy = size * Math.max(0.01, out) * (1 + breathe);
  const cy = y + k * (0.55 - 0.6 * Math.min(1, out));
  const wobble = Math.sin(elapsed / 170 + c.hole) * 0.09;
  if (c.kind === 'gnat') {
    const flap = 0.35 + 0.65 * Math.abs(Math.sin(elapsed / 28 + c.hole));
    stamp(canvas, sprites.wing, x - sx * 0.12, cy - sy * 0.15, sx, sy * flap);
    stamp(canvas, sprites.wing, x + sx * 0.12, cy - sy * 0.15, -sx, sy * flap);
    stamp(canvas, sprites.gnat, x, cy, sx, sy, wobble * 0.6);
  } else if (c.kind === 'ladybug') {
    stamp(canvas, sprites.ladybug, x, cy, sx, sy, wobble * 0.5);
  } else {
    stamp(canvas, sprites.mite, x, cy, sx, sy, wobble);
    if (armored && (c.hitsLeft ?? 1) > 1) stamp(canvas, sprites.shell, x, cy - sy * 0.12, sx, sy, wobble);
  }
  stamp(canvas, sprites.lip, x, y, k, k);
}

export interface SmashFrame {
  state: SmashState;
  elapsedMs: number;
  width: number;
  height: number;
  fx: FxState;
  now: number;
  palette: readonly string[];
  sparkles: readonly number[];
}

export function drawSmashScene(canvas: SkCanvas, f: SmashFrame) {
  'worklet';
  // Sprites schon im Countdown bauen, nicht erst beim ersten Tier mitten im Spiel.
  smashSprites();
  if (f.width === 0) return;
  for (const c of f.state.critters) drawCritter(canvas, c, f.elapsedMs, f.width, f.height);
  drawFx(canvas, f.fx, f.now, f.palette, f.sparkles);
  drawFlash(canvas, f.fx, f.now, f.width, f.height);
}
