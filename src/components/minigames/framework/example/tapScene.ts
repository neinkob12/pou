// Bewegte Szene von "Tipp den Kreis" (Auftrag 51): Knospe mit Aufblühen (Überschwingen), Atmen und
// Drehen, Zeit-Ring mit dunkler Kontur, der von Grün über Gelb nach Rot läuft und am Ende zittert,
// dazu Effekte. Alles in eine Picture.
// Reihenfolge beachten: Worklets werden im Web nicht vorgezogen, Helfer stehen vor ihrer Nutzung.

import { PaintStyle, Skia, StrokeCap, type SkCanvas, type SkPaint } from '@shopify/react-native-skia';

import { drawFlash, drawFx } from '../art/drawFx';
import { cached, stamp } from '../art/kit';
import { popIn } from '../art/motion';
import { ink, tones } from '../art/palette';
import type { FxState } from '../fx/fxLogic';
import type { TapCircle } from './tapCircle';
import { circleLifetime } from './tapGolden';
import { tapSprites } from './tapArt';

/** Aufblühen der Knospe in ms. */
const GROW_MS = 260;
/** Abstand des Rings vom Knospenrand (dp). */
const RING_GAP = 9;

interface RingPaints {
  back: SkPaint;
  outline: SkPaint;
  arc: SkPaint;
}

function ringPaints(): RingPaints {
  'worklet';
  return cached('tap:ring', () => {
    const make = (color: string) => {
      const p = Skia.Paint();
      p.setAntiAlias(true);
      p.setStyle(PaintStyle.Stroke);
      p.setStrokeCap(StrokeCap.Round);
      p.setColor(Skia.Color(color));
      return p;
    };
    const back = make(ink.eyeWhite);
    back.setAlphaf(0.45);
    return { back, outline: make(ink.outline), arc: make(tones.leaf.base) };
  });
}

/** Ringfarbe je Restzeit: grün, dann gelb, unter 30 % rot. Gold bleibt gold, bis es knapp wird. */
export function ringColor(left: number, golden: boolean): string {
  'worklet';
  if (left < 0.3) return tones.coral.base;
  if (golden) return tones.gold.base;
  return left < 0.6 ? tones.sun.base : tones.leaf.light;
}

export interface TapFrame {
  circle: TapCircle;
  elapsedMs: number;
  width: number;
  fx: FxState;
  now: number;
  height: number;
  palette: readonly string[];
  sparkles: readonly number[];
}

export function drawTapScene(canvas: SkCanvas, f: TapFrame) {
  'worklet';
  const sprites = tapSprites();
  const c = f.circle;
  if (f.width > 0 && c.r > 0) {
    const age = f.elapsedMs - c.spawnedAtMs;
    const left = Math.max(0, 1 - age / circleLifetime(c));
    const grow = popIn(Math.min(1, age / GROW_MS));
    const breathe = Math.sin(age / 140) * 0.05;
    const tremble = left < 0.3 ? Math.sin(age / 18) * 0.06 : 0;
    // Ring: heller Grund, dunkle Kontur, farbiger Bogen für die Restzeit
    const rr = (c.r + RING_GAP) * Math.min(1, grow);
    const paints = ringPaints();
    const rect = Skia.XYWHRect(c.x - rr, c.y - rr, rr * 2, rr * 2);
    paints.back.setStrokeWidth(7);
    canvas.drawCircle(c.x, c.y, rr, paints.back);
    if (left > 0) {
      const arc = Skia.PathBuilder.Make().addArc(rect, -90, 360 * left).detach();
      paints.outline.setStrokeWidth(10);
      canvas.drawPath(arc, paints.outline);
      paints.arc.setColor(Skia.Color(ringColor(left, c.golden === true)));
      paints.arc.setStrokeWidth(6);
      canvas.drawPath(arc, paints.arc);
    }
    const s = c.r * grow;
    stamp(
      canvas,
      c.golden ? sprites.golden : sprites.bud,
      c.x,
      c.y,
      Math.max(0.01, s * (1 - breathe * 0.5)),
      Math.max(0.01, s * (1 + breathe)),
      age / 2200 + tremble,
    );
  }
  drawFx(canvas, f.fx, f.now, f.palette, f.sparkles);
  drawFlash(canvas, f.fx, f.now, f.width, f.height);
}
