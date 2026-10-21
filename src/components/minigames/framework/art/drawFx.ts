// Effekte in die Szenen-Picture zeichnen (Auftrag 51): Partikel mit Glanzpunkt, Funkel-Sterne,
// Schockwellen-Ringe, weißer Blitz und das Kamera-Wackeln. Ersetzt FxLayer in den Spielen.
// Reihenfolge beachten: Worklets werden im Web nicht vorgezogen, Helfer stehen vor ihrer Nutzung.

import { PaintStyle, Skia, type SkCanvas, type SkPaint, type SkPicture } from '@shopify/react-native-skia';

import { flashAlpha, particleAt, ringAt, type FxState } from '../fx/fxLogic';
import { cached, record } from './kit';
import { ink } from './palette';

function solid(color: string, alpha = 1): SkPaint {
  'worklet';
  const p = Skia.Paint();
  p.setAntiAlias(true);
  p.setColor(Skia.Color(color));
  p.setAlphaf(alpha);
  return p;
}

/** Vierzackiger Funkel-Stern mit Radius 1 in einer Farbe. */
function sparkleSprite(color: string): SkPicture {
  'worklet';
  return cached(`sparkle:${color}`, () =>
    record((c, pen) => {
      const b = Skia.PathBuilder.Make();
      b.moveTo(0, -1);
      b.quadTo(0.14, -0.14, 1, 0);
      b.quadTo(0.14, 0.14, 0, 1);
      b.quadTo(-0.14, 0.14, -1, 0);
      b.quadTo(-0.14, -0.14, 0, -1);
      b.close();
      c.drawPath(b.detach(), pen.fill(color));
      c.drawCircle(0, 0, 0.22, pen.fill(ink.eyeWhite));
    }),
  );
}

interface FxPaints {
  fill: SkPaint[];
  ring: SkPaint[];
  glint: SkPaint;
  flash: SkPaint;
}

function fxPaints(palette: readonly string[]): FxPaints {
  'worklet';
  return cached(`fx:${palette.join(',')}`, () => ({
    fill: palette.map((c) => solid(c)),
    ring: palette.map((c) => {
      const p = solid(c);
      p.setStyle(PaintStyle.Stroke);
      return p;
    }),
    glint: solid(ink.eyeWhite, 0.75),
    flash: solid(ink.eyeWhite),
  }));
}

/**
 * Partikel und Ringe. `sparkles`: Farb-Indizes, die als drehende Funkel-Sterne statt als Kugeln
 * fliegen (Gold, Licht).
 */
export function drawFx(
  canvas: SkCanvas,
  fx: FxState,
  now: number,
  palette: readonly string[],
  sparkles: readonly number[] = [],
) {
  'worklet';
  const paints = fxPaints(palette);
  for (const r of fx.rings ?? []) {
    const { radius, width, alpha } = ringAt(r, now);
    if (alpha <= 0) continue;
    const p = paints.ring[r.color] ?? paints.ring[0];
    p.setStrokeWidth(width);
    p.setAlphaf(alpha);
    canvas.drawCircle(r.x, r.y, radius, p);
  }
  for (const p of fx.particles) {
    const { x, y, r } = particleAt(p, now);
    if (r <= 0.3) continue;
    if (sparkles.includes(p.color)) {
      const sprite = sparkleSprite(palette[p.color] ?? palette[0]);
      canvas.save();
      canvas.translate(x, y);
      canvas.rotate((now - p.bornMs) * 0.4 + p.vx, 0, 0);
      canvas.scale(r * 1.6, r * 1.6);
      canvas.drawPicture(sprite);
      canvas.restore();
      continue;
    }
    canvas.drawCircle(x, y, r, paints.fill[p.color] ?? paints.fill[0]);
    if (r > 2.2) canvas.drawCircle(x - r * 0.32, y - r * 0.32, r * 0.34, paints.glint);
  }
}

/** Weißer Blitz über das ganze Feld, nur solange er sichtbar ist. */
export function drawFlash(canvas: SkCanvas, fx: FxState, now: number, width: number, height: number) {
  'worklet';
  const alpha = flashAlpha(fx, now);
  if (alpha <= 0) return;
  const paints = fxPaints([ink.eyeWhite]);
  paints.flash.setAlphaf(alpha);
  canvas.drawRect(Skia.XYWHRect(-20, -20, width + 40, height + 40), paints.flash);
}
