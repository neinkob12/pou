// Grafik von "Tipp den Kreis" (Auftrag 51, ART-6): die Blüten-Knospe als Sprite mit Kontur, Verlauf
// und Glanz (normal lila, golden), dazu ein warmer Abendhimmel mit Strahlen, Lichtkugeln und Hügel
// als stilles Hintergrundbild. Knospe in Einheitsgröße (Radius etwa 1).
// Reihenfolge beachten: Worklets werden im Web nicht vorgezogen, Helfer stehen vor ihrer Nutzung.

import { Skia, type SkCanvas, type SkPicture } from '@shopify/react-native-skia';

import { cached, circlePath, eyes, outlined, record, shine, type Pen } from '../art/kit';
import { backdrops, ink, tones, type Tone } from '../art/palette';

const PETALS = 6;

function petals(c: SkCanvas, pen: Pen, petal: Tone) {
  'worklet';
  const shape = Skia.PathBuilder.Make()
    .moveTo(0, -0.28)
    .cubicTo(-0.46, -0.5, -0.4, -1.04, 0, -1.08)
    .cubicTo(0.4, -1.04, 0.46, -0.5, 0, -0.28)
    .close()
    .detach();
  // Erst alle Konturen, dann alle Flächen: die Blätter überlappen ohne Striche dazwischen.
  const line = pen.stroke(ink.outline, 0.14);
  for (let i = 0; i < PETALS; i += 1) {
    c.save();
    c.rotate((i * 360) / PETALS, 0, 0);
    c.drawPath(shape, line);
    c.restore();
  }
  const fill = pen.linear(0, -1.08, 0, -0.3, [petal.light, petal.base, petal.dark]);
  for (let i = 0; i < PETALS; i += 1) {
    c.save();
    c.rotate((i * 360) / PETALS, 0, 0);
    c.drawPath(shape, fill);
    c.drawOval(Skia.XYWHRect(-0.12, -0.96, 0.16, 0.34), pen.fill(ink.shineSoft));
    c.restore();
  }
}

function bud(c: SkCanvas, pen: Pen, petal: Tone, golden: boolean) {
  'worklet';
  if (golden) c.drawCircle(0, 0, 1.45, pen.radial(0, 0, 1.45, [tones.gold.light, 'rgba(255,210,58,0)']));
  petals(c, pen, petal);
  const core = circlePath(0, 0, 0.52);
  outlined(c, pen, core, pen.radial(-0.15, -0.2, 0.62, [tones.bloomCore.light, tones.bloomCore.base, tones.bloomCore.dark]), 0.06);
  shine(c, pen, -0.2, -0.26, 0.16, 0.08);
  eyes(c, pen, 0.18, -0.04, 0.11, 0);
  const smile = Skia.PathBuilder.Make().moveTo(-0.13, 0.16).quadTo(0, 0.3, 0.13, 0.16).detach();
  c.drawPath(smile, pen.stroke(ink.outline, 0.06));
  c.drawCircle(-0.33, 0.14, 0.08, pen.fill(ink.cheek));
  c.drawCircle(0.33, 0.14, 0.08, pen.fill(ink.cheek));
}

export interface TapSprites {
  bud: SkPicture;
  golden: SkPicture;
}

export function tapSprites(): TapSprites {
  'worklet';
  return cached('tap', () => ({
    bud: record((c, pen) => bud(c, pen, tones.petal, false)),
    golden: record((c, pen) => bud(c, pen, tones.gold, true)),
  }));
}

/** Knospe für die Auswahl-Karte. */
export function drawBudIcon(c: SkCanvas, pen: Pen) {
  'worklet';
  bud(c, pen, tones.petal, false);
}

/** Stilles Hintergrundbild: Abendhimmel, Sonnenstrahlen, Lichtkugeln, Hügel mit Blüten. */
export function drawTapBackdrop(c: SkCanvas, pen: Pen, width: number, height: number) {
  'worklet';
  const [top, mid, bottom] = backdrops.tap;
  c.drawRect(Skia.XYWHRect(0, 0, width, height), pen.linear(0, 0, 0, height, [top, mid, bottom]));
  // Strahlen aus der Sonne oben in der Mitte
  const sx = width / 2;
  const sy = height * 0.18;
  const rays = Skia.PathBuilder.Make();
  const reach = Math.max(width, height) * 1.2;
  for (let i = 0; i < 12; i += 1) {
    const a = (i / 12) * Math.PI * 2;
    const b = a + Math.PI / 24;
    rays.moveTo(sx, sy);
    rays.lineTo(sx + Math.cos(a) * reach, sy + Math.sin(a) * reach);
    rays.lineTo(sx + Math.cos(b) * reach, sy + Math.sin(b) * reach);
    rays.close();
  }
  const rayPaint = pen.fill(ink.eyeWhite);
  rayPaint.setAlphaf(0.14);
  c.drawPath(rays.detach(), rayPaint);
  c.drawCircle(sx, sy, width * 0.32, pen.radial(sx, sy, width * 0.32, [backdrops.tapGlow, 'rgba(255,255,255,0)']));
  c.drawCircle(sx, sy, width * 0.11, pen.radial(sx, sy, width * 0.11, [tones.sun.light, tones.sun.base]));
  // Hügel: hinten heller, vorne satter, mit Kontur
  const far = Skia.PathBuilder.Make()
    .moveTo(0, height * 0.86)
    .cubicTo(width * 0.3, height * 0.78, width * 0.55, height * 0.9, width, height * 0.82)
    .lineTo(width, height)
    .lineTo(0, height)
    .close()
    .detach();
  c.drawPath(far, pen.fill(backdrops.hillFar));
  const near = Skia.PathBuilder.Make()
    .moveTo(0, height * 0.93)
    .cubicTo(width * 0.35, height * 0.86, width * 0.7, height * 0.97, width, height * 0.9)
    .lineTo(width, height + 10)
    .lineTo(0, height + 10)
    .close()
    .detach();
  outlined(c, pen, near, pen.linear(0, height * 0.86, 0, height, [backdrops.hillNear, tones.leafDeep.dark]), 2, backdrops.hillEdge);
  // Kleine Blüten auf dem Hügel
  for (let i = 0; i < 7; i += 1) {
    const x = width * (0.08 + i * 0.14);
    const y = height * (0.92 + ((i * 7) % 5) * 0.012);
    const color = i % 2 === 0 ? tones.petalPink.base : tones.petal.light;
    for (let k = 0; k < 5; k += 1) {
      const a = (k / 5) * Math.PI * 2;
      c.drawCircle(x + Math.cos(a) * 4, y + Math.sin(a) * 4, 3.2, pen.fill(color));
    }
    c.drawCircle(x, y, 2.6, pen.fill(tones.bloomCore.base));
  }
}

/** Lichtkugeln für die Parallaxe-Ebene (zieht langsam nach oben), eine Feldhöhe, nahtlos gekachelt. */
export function drawTapBokeh(c: SkCanvas, pen: Pen, width: number, height: number) {
  'worklet';
  for (let i = 0; i < 9; i += 1) {
    const x = (((i * 41) % 100) / 100) * width;
    const y = (((i * 67) % 100) / 100) * height;
    const r = 10 + ((i * 13) % 5) * 7;
    c.drawCircle(x, y, r, pen.radial(x, y, r, ['rgba(255,255,255,0.45)', 'rgba(255,255,255,0)']));
  }
}
