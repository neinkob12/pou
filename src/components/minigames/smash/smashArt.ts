// Grafik von "Schädlings-Smash" (Auftrag 51, ART-6): Tiere als Sprites mit dicker Kontur, Verlauf und
// Glanz, dazu Blatt und Löcher als stilles Hintergrundbild. Einheiten der Tiere: Körper etwa Radius
// 0,6, Gesamtgröße etwa 1 (skaliert auf die Lochgröße).
// Reihenfolge beachten: Worklets werden im Web nicht vorgezogen, Helfer stehen vor ihrer Nutzung.

import { ClipOp, Skia, type SkCanvas, type SkPicture } from '@shopify/react-native-skia';

import { PEST_SMASH } from '../../../game/config';
import { cached, circlePath, eyes, outlined, ovalPath, record, shine, softShadow, type Pen } from '../framework/art/kit';
import { backdrops, ink, tones } from '../framework/art/palette';
import { holeLayout } from './pestSmash';

/** Konturbreite der Tiere in Einheiten. */
const LINE = 0.07;

function legs(c: SkCanvas, pen: Pen, count: number, reach: number) {
  'worklet';
  const outer = pen.stroke(ink.outline, 0.17);
  const inner = pen.stroke(tones.mite.dark, 0.07);
  for (let i = 0; i < count; i += 1) {
    const dy = -0.36 + (i * 0.72) / (count - 1);
    for (const side of [-1, 1]) {
      const b = Skia.PathBuilder.Make();
      b.moveTo(side * 0.3, dy);
      b.quadTo(side * reach * 0.8, dy - 0.25, side * reach, dy * 1.4 + 0.2);
      const leg = b.detach();
      c.drawPath(leg, outer);
      c.drawPath(leg, inner);
    }
  }
}

function brows(c: SkCanvas, pen: Pen, y: number) {
  'worklet';
  const p = pen.stroke(ink.outline, 0.09);
  c.drawLine(-0.36, y - 0.06, -0.08, y + 0.04, p);
  c.drawLine(0.36, y - 0.06, 0.08, y + 0.04, p);
}

function mite(c: SkCanvas, pen: Pen) {
  'worklet';
  legs(c, pen, 4, 0.95);
  const body = circlePath(0, 0, 0.62);
  outlined(c, pen, body, pen.linear(0, -0.62, 0, 0.62, [tones.mite.light, tones.mite.base, tones.mite.dark]), LINE);
  // Rücken-Punkte und Glanz
  c.drawCircle(-0.3, 0.3, 0.09, pen.fill(tones.mite.dark));
  c.drawCircle(0.28, 0.36, 0.07, pen.fill(tones.mite.dark));
  c.drawCircle(0.02, 0.44, 0.06, pen.fill(tones.mite.dark));
  shine(c, pen, -0.26, -0.36, 0.2, 0.1);
  eyes(c, pen, 0.22, -0.1, 0.16, 0.2);
  brows(c, pen, -0.32);
  const mouth = Skia.PathBuilder.Make().moveTo(-0.14, 0.2).quadTo(0, 0.12, 0.14, 0.2).detach();
  c.drawPath(mouth, pen.stroke(ink.outline, 0.06));
}

function shell(c: SkCanvas, pen: Pen) {
  'worklet';
  const plate = Skia.PathBuilder.Make()
    .moveTo(-0.7, 0.12)
    .cubicTo(-0.66, -0.62, 0.66, -0.62, 0.7, 0.12)
    .cubicTo(0.5, 0.34, -0.5, 0.34, -0.7, 0.12)
    .close()
    .detach();
  outlined(c, pen, plate, pen.linear(0, -0.5, 0, 0.3, [tones.shell.light, tones.shell.base, tones.shell.dark]), LINE);
  const seams = pen.stroke(tones.shell.dark, 0.06);
  c.drawLine(0, -0.46, 0, 0.26, seams);
  c.drawLine(-0.36, -0.36, -0.42, 0.22, seams);
  c.drawLine(0.36, -0.36, 0.42, 0.22, seams);
  shine(c, pen, -0.3, -0.3, 0.16, 0.07);
  // Nieten
  for (const x of [-0.18, 0.18]) c.drawCircle(x, -0.08, 0.05, pen.fill(tones.shell.light));
}

function gnatBody(c: SkCanvas, pen: Pen) {
  'worklet';
  const antenna = pen.stroke(ink.outline, 0.06);
  c.drawLine(-0.1, -0.75, -0.3, -1.02, antenna);
  c.drawLine(0.1, -0.75, 0.3, -1.02, antenna);
  c.drawCircle(-0.3, -1.02, 0.06, pen.fill(tones.gnat.dark));
  c.drawCircle(0.3, -1.02, 0.06, pen.fill(tones.gnat.dark));
  const tail = ovalPath(0, 0.1, 0.27, 0.6);
  outlined(c, pen, tail, pen.linear(0, -0.4, 0, 0.7, [tones.gnat.light, tones.gnat.base, tones.gnat.dark]), LINE);
  const stripe = pen.stroke(tones.gnat.dark, 0.07);
  c.drawLine(-0.22, 0.22, 0.22, 0.22, stripe);
  c.drawLine(-0.18, 0.42, 0.18, 0.42, stripe);
  const head = circlePath(0, -0.52, 0.32);
  outlined(c, pen, head, pen.linear(0, -0.84, 0, -0.2, [tones.gnat.light, tones.gnat.base]), LINE);
  // Große rote Facettenaugen
  for (const side of [-1, 1]) {
    c.drawCircle(side * 0.15, -0.56, 0.15, pen.fill(ink.outline));
    c.drawCircle(side * 0.15, -0.56, 0.12, pen.fill(tones.coral.base));
    c.drawCircle(side * 0.12, -0.6, 0.045, pen.fill(ink.eyeWhite));
  }
  shine(c, pen, -0.1, 0.0, 0.07, 0.16, 0.2);
}

/** Ein Flügel, Gelenk bei (0, 0), zeigt nach links oben. Wird gespiegelt und flattert. */
function wing(c: SkCanvas, pen: Pen) {
  'worklet';
  const w = ovalPath(-0.45, -0.18, 0.5, 0.26);
  c.save();
  c.rotate(-20, 0, 0);
  c.drawPath(w, pen.stroke(ink.outline, 0.1));
  c.drawPath(w, pen.linear(-0.9, -0.4, 0, 0, [tones.wing.light, tones.wing.base]));
  c.drawLine(-0.1, -0.08, -0.7, -0.24, pen.stroke(tones.wing.dark, 0.04));
  c.restore();
}

function ladybug(c: SkCanvas, pen: Pen) {
  'worklet';
  legs(c, pen, 3, 0.85);
  const head = circlePath(0, -0.6, 0.3);
  outlined(c, pen, head, pen.fill(tones.gnat.dark), LINE);
  eyes(c, pen, 0.12, -0.66, 0.09, 0);
  const smile = Skia.PathBuilder.Make().moveTo(-0.1, -0.52).quadTo(0, -0.44, 0.1, -0.52).detach();
  c.drawPath(smile, pen.stroke(ink.eyeWhite, 0.045));
  const dome = circlePath(0, 0.06, 0.66);
  outlined(c, pen, dome, pen.linear(-0.4, -0.6, 0.4, 0.7, [tones.ladybug.light, tones.ladybug.base, tones.ladybug.dark]), LINE);
  c.drawLine(0, -0.58, 0, 0.72, pen.stroke(ink.outline, 0.07));
  for (const [x, y, r] of [
    [-0.32, -0.12, 0.13],
    [0.32, -0.12, 0.13],
    [-0.28, 0.34, 0.11],
    [0.28, 0.34, 0.11],
    [0, 0.56, 0.08],
  ] as const) {
    c.drawCircle(x, y, r, pen.fill(ink.outline));
  }
  shine(c, pen, -0.3, -0.26, 0.2, 0.09);
}

/** Klecks nach dem Treffer, Radius etwa 1, in der Farbe des Tiers. */
function splat(c: SkCanvas, pen: Pen, color: string) {
  'worklet';
  const b = Skia.PathBuilder.Make();
  const n = 9;
  for (let i = 0; i <= n; i += 1) {
    const a = (i / n) * Math.PI * 2;
    const r = i % 2 === 0 ? 0.95 : 0.62;
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r * 0.62;
    if (i === 0) b.moveTo(x, y);
    else b.lineTo(x, y);
  }
  b.close();
  c.drawPath(b.detach(), pen.fill(color));
  c.drawCircle(1.1, -0.2, 0.12, pen.fill(color));
  c.drawCircle(-1.05, 0.25, 0.1, pen.fill(color));
}

/** Vordere Lippe des Lochs, liegt über dem Tier, damit es aus dem Loch schaut. */
function lip(c: SkCanvas, pen: Pen) {
  'worklet';
  const b = Skia.PathBuilder.Make()
    .moveTo(-1.12, 0.32)
    .cubicTo(-1.0, 0.98, 1.0, 0.98, 1.12, 0.32)
    .cubicTo(0.9, 0.62, -0.9, 0.62, -1.12, 0.32)
    .close()
    .detach();
  c.drawPath(b, pen.stroke(ink.outline, 0.08));
  c.drawPath(b, pen.linear(0, 0.4, 0, 0.9, [tones.leaf.base, tones.leafDeep.dark]));
}

export interface SmashSprites {
  mite: SkPicture;
  shell: SkPicture;
  gnat: SkPicture;
  wing: SkPicture;
  ladybug: SkPicture;
  lip: SkPicture;
  splatMite: SkPicture;
  splatGnat: SkPicture;
  splatBug: SkPicture;
}

export function smashSprites(): SmashSprites {
  'worklet';
  return cached('smash', () => ({
    mite: record(mite),
    shell: record(shell),
    gnat: record(gnatBody),
    wing: record(wing),
    ladybug: record(ladybug),
    lip: record(lip),
    splatMite: record((c, pen) => splat(c, pen, tones.mite.base)),
    splatGnat: record((c, pen) => splat(c, pen, tones.gnat.light)),
    splatBug: record((c, pen) => splat(c, pen, tones.ladybug.light)),
  }));
}

/** Kleine Kopie der Milbe für Auswahl-Karte und Legende (mit Schatten). */
export function drawMiteIcon(c: SkCanvas, pen: Pen) {
  'worklet';
  softShadow(c, pen, 0, 0.7, 0.8, 0.2);
  mite(c, pen);
}

/** Blatt mit Spitze, Bauch fast bis an den Rand. */
function leafPath(width: number, height: number) {
  'worklet';
  const b = Skia.PathBuilder.Make();
  const cx = width / 2;
  const out = width * 0.62;
  b.moveTo(cx, height * 0.01);
  b.cubicTo(cx + out, height * 0.12, cx + out, height * 0.78, cx, height * 0.99);
  b.cubicTo(cx - out, height * 0.78, cx - out, height * 0.12, cx, height * 0.01);
  b.close();
  return b.detach();
}

/** Stilles Hintergrundbild: Erde mit Steinchen, großes Blatt mit Adern, Löcher. */
export function drawSmashBackdrop(c: SkCanvas, pen: Pen, width: number, height: number) {
  'worklet';
  const [soilTop, soilMid, soilBottom] = backdrops.smashSoil;
  c.drawRect(Skia.XYWHRect(0, 0, width, height), pen.linear(0, 0, 0, height, [soilTop, soilMid, soilBottom]));
  for (let i = 0; i < 26; i += 1) {
    const x = ((i * 53) % 100) / 100;
    const y = ((i * 37) % 97) / 97;
    const r = 2 + (i % 4);
    c.drawCircle(x * width, y * height, r, pen.fill(i % 3 === 0 ? tones.soil.light : tones.soil.dark));
  }
  const leaf = leafPath(width, height);
  // Schlagschatten des Blatts
  c.save();
  c.translate(0, 8);
  c.drawPath(leaf, pen.fill(ink.shadow));
  c.restore();
  outlined(
    c,
    pen,
    leaf,
    pen.linear(width * 0.1, 0, width * 0.9, height, [tones.leaf.light, tones.leaf.base, tones.leafDeep.base]),
    3,
  );
  // Adern: helle Linie mit dunklem Schatten darunter, nur innerhalb des Blatts
  c.save();
  c.clipPath(leaf, ClipOp.Intersect, true);
  const cx = width / 2;
  const veins = Skia.PathBuilder.Make();
  veins.moveTo(cx, height * 0.04);
  veins.lineTo(cx, height * 0.97);
  for (let i = 1; i <= 6; i += 1) {
    const y = height * (0.08 + (i / 7) * 0.82);
    const reach = width * 0.42 * Math.sin((i / 7) * Math.PI) + width * 0.05;
    for (const side of [-1, 1]) {
      veins.moveTo(cx, y);
      veins.quadTo(cx + side * reach * 0.5, y - height * 0.02, cx + side * reach, y - height * 0.07);
    }
  }
  const v = veins.detach();
  c.save();
  c.translate(0, 2);
  c.drawPath(v, pen.stroke(tones.leafDeep.dark, 4));
  c.restore();
  c.drawPath(v, pen.stroke(tones.mint.light, 3));
  // Glanzkante links oben, folgt dem Blattrand
  const gloss = Skia.PathBuilder.Make()
    .moveTo(width * 0.42, height * 0.06)
    .cubicTo(width * 0.2, height * 0.14, width * 0.1, height * 0.28, width * 0.09, height * 0.42)
    .detach();
  c.drawPath(gloss, pen.stroke(ink.shineSoft, 7));
  c.restore();
  // Löcher: Rand, dunkle Tiefe, Innenschatten
  for (let h = 0; h < PEST_SMASH.gridCols * PEST_SMASH.gridRows; h += 1) {
    const { x, y, cell } = holeLayout(h, width, height, PEST_SMASH);
    const k = cell * 0.6;
    c.save();
    c.translate(x, y);
    c.scale(k, k);
    const rim = ovalPath(0, 0.3, 1.18, 0.62);
    c.drawPath(rim, pen.fill(tones.leafDeep.dark));
    const pit = ovalPath(0, 0.3, 1.08, 0.54);
    c.drawPath(pit, pen.radial(0, 0.42, 1.08, [tones.soil.dark, tones.soil.base, tones.soil.light]));
    c.drawOval(Skia.XYWHRect(-0.9, -0.2, 1.8, 0.5), pen.fill(ink.shadow));
    c.restore();
  }
}
