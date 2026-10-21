// Grafik von "Tropfen fangen" (Auftrag 51, ART-6): Tropfen, Dünger, Salzkristall, Gold und Schutzblatt
// als Sprites mit Kontur, Verlauf und Glanz, der Topf mit Budi-Spross, dazu Himmel, Hügel und
// Fensterbrett als stilles Hintergrundbild und Wolken als Parallaxe-Ebene.
// Tropfen in Einheiten des Tropfenradius (1 = DROPS_GAME.dropRadius), Topf in dp um die Öffnungsmitte.
// Reihenfolge beachten: Worklets werden im Web nicht vorgezogen, Helfer stehen vor ihrer Nutzung.

import { Skia, type SkCanvas, type SkPicture } from '@shopify/react-native-skia';

import { DROPS_GAME } from '../../../game/config';
import { cached, circlePath, eyes, outlined, ovalPath, record, shine, softShadow, type Pen } from '../framework/art/kit';
import { backdrops, ink, tones, type Tone } from '../framework/art/palette';

const PW = DROPS_GAME.potWidth;
const PH = DROPS_GAME.potHeight;
const LINE = 0.12;

function dropPath() {
  'worklet';
  return Skia.PathBuilder.Make()
    .moveTo(0, -1.4)
    .cubicTo(1.12, -0.15, 0.98, 1, 0, 1)
    .cubicTo(-0.98, 1, -1.12, -0.15, 0, -1.4)
    .close()
    .detach();
}

function drop(c: SkCanvas, pen: Pen, tone: Tone, glow: boolean) {
  'worklet';
  if (glow) c.drawCircle(0, 0, 2.1, pen.radial(0, 0, 2.1, [tones.gold.light, 'rgba(255,244,168,0)']));
  outlined(c, pen, dropPath(), pen.linear(-0.6, -1.2, 0.6, 1, [tone.light, tone.base, tone.dark]), LINE);
  shine(c, pen, -0.34, -0.05, 0.16, 0.34, 0.35);
  c.drawCircle(0.32, 0.5, 0.1, pen.fill(ink.shineSoft));
}

function fertilizer(c: SkCanvas, pen: Pen) {
  'worklet';
  const ball = circlePath(0, 0, 0.9);
  outlined(c, pen, ball, pen.radial(-0.3, -0.35, 1.2, [tones.fertilizer.light, tones.fertilizer.base, tones.fertilizer.dark]), LINE);
  // Kleines Blatt-Zeichen auf der Kugel
  const leaf = Skia.PathBuilder.Make()
    .moveTo(-0.3, 0.3)
    .quadTo(-0.25, -0.35, 0.35, -0.3)
    .quadTo(0.3, 0.3, -0.3, 0.3)
    .close()
    .detach();
  c.drawPath(leaf, pen.fill(tones.fertilizer.dark));
  shine(c, pen, -0.34, -0.42, 0.24, 0.12);
}

function salt(c: SkCanvas, pen: Pen) {
  'worklet';
  // Würfel-Kristall: Vorderseite, Deckel, rechte Seite, mit grimmigem Gesicht (meiden!)
  const front = Skia.PathBuilder.Make().addRect(Skia.XYWHRect(-0.82, -0.5, 1.3, 1.3)).detach();
  const lid = Skia.PathBuilder.Make()
    .moveTo(-0.82, -0.5)
    .lineTo(-0.42, -0.95)
    .lineTo(0.88, -0.95)
    .lineTo(0.48, -0.5)
    .close()
    .detach();
  const side = Skia.PathBuilder.Make()
    .moveTo(0.48, -0.5)
    .lineTo(0.88, -0.95)
    .lineTo(0.88, 0.35)
    .lineTo(0.48, 0.8)
    .close()
    .detach();
  const line = pen.stroke(ink.outline, LINE * 2);
  c.drawPath(front, line);
  c.drawPath(lid, line);
  c.drawPath(side, line);
  c.drawPath(front, pen.linear(0, -0.5, 0, 0.8, [tones.salt.light, tones.salt.base]));
  c.drawPath(lid, pen.fill(tones.salt.light));
  c.drawPath(side, pen.fill(tones.salt.dark));
  eyes(c, pen, 0.26, 0.05, 0.13, 0);
  const brows = pen.stroke(ink.outline, 0.1);
  c.drawLine(-0.5, -0.24, -0.2, -0.12, brows);
  c.drawLine(0.4, -0.24, 0.1, -0.12, brows);
  const frown = Skia.PathBuilder.Make().moveTo(-0.3, 0.52).quadTo(-0.17, 0.38, -0.04, 0.52).detach();
  c.drawPath(frown, pen.stroke(ink.outline, 0.08));
}

function shieldLeaf(c: SkCanvas, pen: Pen) {
  'worklet';
  const leaf = Skia.PathBuilder.Make()
    .moveTo(-1.3, 0.5)
    .cubicTo(-0.9, -1.2, 0.9, -1.3, 1.3, -0.6)
    .cubicTo(0.9, 0.9, -0.4, 1.2, -1.3, 0.5)
    .close()
    .detach();
  c.drawCircle(0, -0.1, 1.9, pen.radial(0, -0.1, 1.9, ['rgba(182,240,122,0.7)', 'rgba(182,240,122,0)']));
  outlined(c, pen, leaf, pen.linear(-1, -1, 1, 1, [tones.leaf.light, tones.leaf.base, tones.leafDeep.dark]), LINE);
  c.drawLine(-1.1, 0.45, 1.1, -0.55, pen.stroke(tones.mint.light, 0.12));
}

/** Topf in dp, (0, 0) ist die Mitte der Öffnung. Budis Spross schaut aus der Erde. */
function pot(c: SkCanvas, pen: Pen) {
  'worklet';
  // Spross mit Gesicht
  const stem = pen.stroke(tones.leafDeep.dark, 3);
  c.drawLine(0, 2, 0, -12, stem);
  for (const side of [-1, 1]) {
    const leaf = Skia.PathBuilder.Make()
      .moveTo(0, -12)
      .quadTo(side * 6, -24, side * 18, -20)
      .quadTo(side * 12, -9, 0, -12)
      .close()
      .detach();
    outlined(c, pen, leaf, pen.linear(0, -24, 0, -9, [tones.budi.light, tones.budi.base]), 1.6);
  }
  const head = circlePath(0, -3, 11);
  outlined(c, pen, head, pen.radial(-3, -7, 14, [tones.budi.light, tones.budi.base, tones.budi.dark]), 1.8);
  eyes(c, pen, 4, -4, 2.6, 0);
  const smile = Skia.PathBuilder.Make().moveTo(-3, 1).quadTo(0, 4, 3, 1).detach();
  c.drawPath(smile, pen.stroke(ink.outline, 1.4));
  c.drawCircle(-7, 0, 1.8, pen.fill(ink.cheek));
  c.drawCircle(7, 0, 1.8, pen.fill(ink.cheek));
  // Topfkörper
  const body = Skia.PathBuilder.Make()
    .moveTo(-PW * 0.46, 10)
    .lineTo(PW * 0.46, 10)
    .lineTo(PW * 0.37, PH)
    .quadTo(0, PH + 4, -PW * 0.37, PH)
    .close()
    .detach();
  outlined(c, pen, body, pen.linear(-PW / 2, 0, PW / 2, 0, [tones.pot.light, tones.pot.base, tones.pot.dark]), 2.2);
  // Rand
  const rim = Skia.PathBuilder.Make()
    .addRRect(Skia.RRectXY(Skia.XYWHRect(-PW * 0.53, -1, PW * 1.06, 15), 7, 7))
    .detach();
  outlined(c, pen, rim, pen.linear(0, -1, 0, 14, [tones.pot.light, tones.pot.base]), 2.2);
  c.drawOval(Skia.XYWHRect(-PW * 0.43, 1, PW * 0.86, 7), pen.fill(tones.soil.dark));
  // Glanz und Gesicht am Topf
  c.drawRRect(Skia.RRectXY(Skia.XYWHRect(-PW * 0.36, 18, 7, PH - 26), 4, 4), pen.fill(ink.shineSoft));
  c.drawRRect(Skia.RRectXY(Skia.XYWHRect(-PW * 0.48, 2, PW * 0.5, 4), 2, 2), pen.fill(ink.shineSoft));
  c.drawCircle(-12, 31, 3.2, pen.fill(ink.outline));
  c.drawCircle(12, 31, 3.2, pen.fill(ink.outline));
  c.drawCircle(-11, 30, 1, pen.fill(ink.eyeWhite));
  c.drawCircle(13, 30, 1, pen.fill(ink.eyeWhite));
  const mouth = Skia.PathBuilder.Make().moveTo(-7, 38).quadTo(0, 45, 7, 38).detach();
  c.drawPath(mouth, pen.stroke(ink.outline, 2.4));
  c.drawCircle(-20, 37, 4, pen.fill(ink.cheek));
  c.drawCircle(20, 37, 4, pen.fill(ink.cheek));
}

/** Schutzblase um den Topf: Fläche und Rand getrennt, damit die Fläche pulsieren kann. */
function bubble(c: SkCanvas, pen: Pen) {
  'worklet';
  const b = ovalPath(0, PH * 0.35, PW * 0.8, PH * 1.05);
  c.drawPath(b, pen.radial(0, PH * 0.35, PW * 0.9, ['rgba(182,240,122,0.1)', 'rgba(147,227,106,0.55)']));
  c.drawPath(b, pen.stroke(tones.leafDeep.base, 2.5));
  c.drawOval(Skia.XYWHRect(-PW * 0.55, -PH * 0.5, PW * 0.4, PH * 0.3), pen.fill(ink.shineSoft));
}

export interface DropsSprites {
  water: SkPicture;
  golden: SkPicture;
  fertilizer: SkPicture;
  salt: SkPicture;
  leaf: SkPicture;
  pot: SkPicture;
  potShadow: SkPicture;
  bubble: SkPicture;
}

export function dropsSprites(): DropsSprites {
  'worklet';
  return cached('drops', () => ({
    water: record((c, pen) => drop(c, pen, tones.water, false)),
    golden: record((c, pen) => drop(c, pen, tones.gold, true)),
    fertilizer: record(fertilizer),
    salt: record(salt),
    leaf: record(shieldLeaf),
    pot: record(pot),
    potShadow: record((c, pen) => softShadow(c, pen, 0, 0, PW * 0.6, 7)),
    bubble: record(bubble),
  }));
}

/** Wassertropfen für die Auswahl-Karte (Einheiten wie im Spiel). */
export function drawDropIcon(c: SkCanvas, pen: Pen) {
  'worklet';
  drop(c, pen, tones.water, false);
}

/** Stilles Hintergrundbild: Himmel, Sonne, ferne Hügel, Fensterbrett. */
export function drawDropsBackdrop(c: SkCanvas, pen: Pen, width: number, height: number) {
  'worklet';
  const [top, mid, bottom] = backdrops.dropsSky;
  c.drawRect(Skia.XYWHRect(0, 0, width, height), pen.linear(0, 0, 0, height, [top, mid, bottom]));
  const sx = width * 0.82;
  const sy = height * 0.12;
  c.drawCircle(sx, sy, 90, pen.radial(sx, sy, 90, ['rgba(255,251,208,0.9)', 'rgba(255,251,208,0)']));
  c.drawCircle(sx, sy, 30, pen.radial(sx - 8, sy - 8, 34, [tones.sun.light, tones.sun.base]));
  const shelfY = height - DROPS_GAME.potBottomMargin;
  const hills = Skia.PathBuilder.Make()
    .moveTo(0, shelfY - 70)
    .cubicTo(width * 0.25, shelfY - 130, width * 0.45, shelfY - 40, width * 0.65, shelfY - 90)
    .cubicTo(width * 0.8, shelfY - 125, width * 0.92, shelfY - 70, width, shelfY - 85)
    .lineTo(width, shelfY)
    .lineTo(0, shelfY)
    .close()
    .detach();
  c.drawPath(hills, pen.linear(0, shelfY - 130, 0, shelfY, [backdrops.hillFar, backdrops.hillNear]));
  // Fensterbrett aus Holz mit Kontur und Maserung
  const board = Skia.PathBuilder.Make().addRect(Skia.XYWHRect(-4, shelfY - 4, width + 8, DROPS_GAME.potBottomMargin + 8)).detach();
  outlined(c, pen, board, pen.linear(0, shelfY - 4, 0, height, [tones.wood.light, tones.wood.base, tones.wood.dark]), 2);
  const grain = pen.stroke(tones.wood.dark, 1.2);
  for (let i = 0; i < 5; i += 1) {
    const x = width * (0.1 + i * 0.2);
    c.drawLine(x, shelfY + 4, x + 26, shelfY + 4, grain);
  }
  c.drawLine(0, shelfY - 2, width, shelfY - 2, pen.stroke(ink.shineSoft, 2));
}

/** Wolken für die Parallaxe-Ebene, eine Feldbreite, nahtlos gekachelt. */
export function drawDropsClouds(c: SkCanvas, pen: Pen, width: number, height: number) {
  'worklet';
  const clouds = [
    { x: 0.18, y: 0.1, s: 1 },
    { x: 0.62, y: 0.05, s: 0.75 },
    { x: 0.45, y: 0.24, s: 0.6 },
    { x: 0.9, y: 0.3, s: 0.5 },
  ];
  for (const cl of clouds) {
    const cx = cl.x * width;
    const cy = cl.y * height;
    const s = 34 * cl.s;
    const b = Skia.PathBuilder.Make();
    b.addOval(Skia.XYWHRect(cx - s * 1.7, cy - s * 0.45, s * 3.4, s * 1.15));
    b.addCircle(cx - s * 0.55, cy - s * 0.35, s * 0.72);
    b.addCircle(cx + s * 0.45, cy - s * 0.5, s * 0.88);
    const path = b.detach();
    c.save();
    c.translate(0, 4);
    c.drawPath(path, pen.fill(backdrops.cloudShade));
    c.restore();
    c.drawPath(path, pen.fill(backdrops.cloud));
  }
}
