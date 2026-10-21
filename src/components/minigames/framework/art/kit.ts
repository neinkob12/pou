// Zeichen-Baukasten der Minigames (Auftrag 51, ART-6). Statt hunderter Skia-Knoten zeichnet jedes
// Spiel pro Frame eine einzige Picture: Figuren sind fertig aufgenommene Sprites (einmal je
// Laufzeit gebaut, mit Kontur, Verlauf und Glanz), die pro Frame nur noch verschoben und skaliert
// werden. Das spart im Web die Neuaufnahme der Szene (sksg) und auf dem Handy die Knoten-Arbeit.
// Alle Funktionen sind Worklets und laufen im Frame auf dem UI-Thread.
// Reihenfolge beachten: Worklets werden im Web nicht vorgezogen, Helfer stehen vor ihrer Nutzung.

import {
  PaintStyle,
  Skia,
  StrokeCap,
  StrokeJoin,
  TileMode,
  type SkCanvas,
  type SkColor,
  type SkPaint,
  type SkPath,
  type SkPicture,
} from '@shopify/react-native-skia';

import { ink } from './palette';

/**
 * Einmal je Laufzeit bauen und merken (UI-Thread und Web teilen sich nichts, jede Laufzeit hat
 * ihren eigenen Speicher). `build` muss ein Worklet sein.
 */
export function cached<T>(key: string, build: () => T): T {
  'worklet';
  const store = globalThis as unknown as { __minigameArt?: Record<string, unknown> };
  if (!store.__minigameArt) store.__minigameArt = {};
  const hit = store.__minigameArt[key];
  if (hit !== undefined) return hit as T;
  const made = build();
  store.__minigameArt[key] = made;
  return made;
}

/** Stifte für eine Aufnahme. Alles, was hier entsteht, wird nach der Aufnahme freigegeben. */
export interface Pen {
  fill: (color: string) => SkPaint;
  stroke: (color: string, width: number) => SkPaint;
  linear: (x0: number, y0: number, x1: number, y1: number, colors: readonly string[]) => SkPaint;
  radial: (cx: number, cy: number, r: number, colors: readonly string[]) => SkPaint;
}

function makePen(owned: { dispose: () => void }[]): Pen {
  'worklet';
  const base = () => {
    const p = Skia.Paint();
    p.setAntiAlias(true);
    owned.push(p);
    return p;
  };
  const colorsOf = (list: readonly string[]): SkColor[] => list.map((c) => Skia.Color(c));
  return {
    fill: (color) => {
      const p = base();
      p.setColor(Skia.Color(color));
      return p;
    },
    stroke: (color, width) => {
      const p = base();
      p.setColor(Skia.Color(color));
      p.setStyle(PaintStyle.Stroke);
      p.setStrokeWidth(width);
      p.setStrokeCap(StrokeCap.Round);
      p.setStrokeJoin(StrokeJoin.Round);
      return p;
    },
    linear: (x0, y0, x1, y1, colors) => {
      const p = base();
      const s = Skia.Shader.MakeLinearGradient(
        { x: x0, y: y0 },
        { x: x1, y: y1 },
        colorsOf(colors),
        null,
        TileMode.Clamp,
      );
      owned.push(s);
      p.setShader(s);
      return p;
    },
    radial: (cx, cy, r, colors) => {
      const p = base();
      const s = Skia.Shader.MakeRadialGradient({ x: cx, y: cy }, r, colorsOf(colors), null, TileMode.Clamp);
      owned.push(s);
      p.setShader(s);
      return p;
    },
  };
}

/** Nimmt eine Zeichnung als Picture auf und gibt Stifte und Rekorder danach frei. */
export function record(draw: (canvas: SkCanvas, pen: Pen) => void): SkPicture {
  'worklet';
  const owned: { dispose: () => void }[] = [];
  const recorder = Skia.PictureRecorder();
  const canvas = recorder.beginRecording(Skia.XYWHRect(-4096, -4096, 8192, 8192));
  draw(canvas, makePen(owned));
  const picture = recorder.finishRecordingAsPicture();
  for (const o of owned) o.dispose();
  recorder.dispose();
  return picture;
}

/**
 * Fläche mit dicker Kontur: erst die Kontur doppelt so breit, dann die Fläche darüber. So liegt
 * die Kontur außen und frisst nichts von der Fläche.
 */
export function outlined(canvas: SkCanvas, pen: Pen, path: SkPath, fill: SkPaint, width: number, color = ink.outline) {
  'worklet';
  canvas.drawPath(path, pen.stroke(color, width * 2));
  canvas.drawPath(path, fill);
}

/** Weicher Schlagschatten als Oval (radialer Verlauf, kein Weichzeichner: der wäre teuer). */
export function softShadow(canvas: SkCanvas, pen: Pen, cx: number, cy: number, rx: number, ry: number) {
  'worklet';
  canvas.save();
  canvas.translate(cx, cy);
  canvas.scale(1, ry / rx);
  canvas.drawCircle(0, 0, rx, pen.radial(0, 0, rx, [ink.shadow, ink.shadow, ink.shadowFade]));
  canvas.restore();
}

/** Glanzlicht oben links: helles Oval, schräg. */
export function shine(canvas: SkCanvas, pen: Pen, cx: number, cy: number, rx: number, ry: number, angle = -0.5) {
  'worklet';
  canvas.save();
  canvas.translate(cx, cy);
  canvas.rotate((angle * 180) / Math.PI, 0, 0);
  canvas.drawOval(Skia.XYWHRect(-rx, -ry, rx * 2, ry * 2), pen.fill(ink.shine));
  canvas.restore();
}

export function circlePath(cx: number, cy: number, r: number): SkPath {
  'worklet';
  return Skia.PathBuilder.Make().addCircle(cx, cy, r).detach();
}

export function ovalPath(cx: number, cy: number, rx: number, ry: number): SkPath {
  'worklet';
  return Skia.PathBuilder.Make()
    .addOval(Skia.XYWHRect(cx - rx, cy - ry, rx * 2, ry * 2))
    .detach();
}

/** Augenpaar mit Glanzpunkt, Blick leicht nach `look` verschoben (Einheiten der Figur). */
export function eyes(canvas: SkCanvas, pen: Pen, dx: number, y: number, r: number, look = 0) {
  'worklet';
  for (const side of [-1, 1]) {
    const x = side * dx;
    canvas.drawCircle(x, y, r * 1.18, pen.fill(ink.outline));
    canvas.drawCircle(x, y, r, pen.fill(ink.eyeWhite));
    canvas.drawCircle(x + look * r * 0.3, y + r * 0.12, r * 0.58, pen.fill(ink.pupil));
    canvas.drawCircle(x + look * r * 0.3 - r * 0.22, y - r * 0.12, r * 0.22, pen.fill(ink.eyeWhite));
  }
}

/** Sprite an (x, y) mit Skalierung und Drehung (Bogenmaß) zeichnen. */
export function stamp(canvas: SkCanvas, sprite: SkPicture, x: number, y: number, sx: number, sy = sx, rot = 0) {
  'worklet';
  canvas.save();
  canvas.translate(x, y);
  if (rot !== 0) canvas.rotate((rot * 180) / Math.PI, 0, 0);
  canvas.scale(sx, sy);
  canvas.drawPicture(sprite);
  canvas.restore();
}
