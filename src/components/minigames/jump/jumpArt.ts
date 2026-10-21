// Grafik von Budi Jump (Auftrag 51, ART-6): Blätter je Typ, Lichtkugeln, Sonnen und Budi als Sprites
// mit Kontur, Verlauf und Glanz; Himmel (Tag, Abend, Nacht), Wolken und Startwiese als stille Ebenen,
// die mit der Kamera verschieden schnell wandern (Parallaxe).
// Blätter in Einheiten der Blattbreite (1 = BUDI_JUMP.platformWidth), Oberkante bei y = 0.
// Budi, Licht und Sonne in Einheiten ihres Radius.
// Reihenfolge beachten: Worklets werden im Web nicht vorgezogen, Helfer stehen vor ihrer Nutzung.

import { ClipOp, Skia, type SkCanvas, type SkPicture } from '@shopify/react-native-skia';

import { cached, circlePath, eyes, outlined, record, shine, type Pen } from '../framework/art/kit';
import { backdrops, ink, tones, type Tone } from '../framework/art/palette';

const LINE = 0.025;

function leafPath(dx = 0) {
  'worklet';
  return Skia.PathBuilder.Make()
    .moveTo(-0.5 + dx, 0.06)
    .quadTo(dx, -0.16, 0.5 + dx, 0.06)
    .quadTo(dx, 0.36, -0.5 + dx, 0.06)
    .close()
    .detach();
}

function leaf(c: SkCanvas, pen: Pen, tone: Tone, rib: string) {
  'worklet';
  outlined(c, pen, leafPath(), pen.linear(0, -0.1, 0, 0.3, [tone.light, tone.base, tone.dark]), LINE);
  c.drawLine(-0.4, 0.07, 0.4, 0.07, pen.stroke(rib, 0.022));
  for (const x of [-0.22, 0, 0.22]) c.drawLine(x, 0.07, x + 0.08, 0.0, pen.stroke(rib, 0.016));
  c.drawOval(Skia.XYWHRect(-0.3, -0.06, 0.28, 0.06), pen.fill(ink.shineSoft));
}

function movingLeaf(c: SkCanvas, pen: Pen) {
  'worklet';
  leaf(c, pen, tones.mint, tones.leafDeep.base);
  const arrow = pen.stroke(ink.outline, 0.04);
  for (const side of [-1, 1]) {
    const tip = side * 0.66;
    c.drawLine(tip - side * 0.07, -0.02, tip, 0.06, arrow);
    c.drawLine(tip - side * 0.07, 0.14, tip, 0.06, arrow);
  }
}

function breakingLeaf(c: SkCanvas, pen: Pen) {
  'worklet';
  leaf(c, pen, tones.breaking, tones.breaking.dark);
  const crack = Skia.PathBuilder.Make()
    .moveTo(-0.02, -0.08)
    .lineTo(0.04, 0.04)
    .lineTo(-0.04, 0.12)
    .lineTo(0.03, 0.26)
    .detach();
  c.drawPath(crack, pen.stroke(ink.outline, 0.03));
}

function brokenLeaf(c: SkCanvas, pen: Pen) {
  'worklet';
  for (const side of [-1, 1]) {
    c.save();
    c.translate(side * 0.08, 0.04);
    c.rotate(side * 18, side * 0.25, 0.06);
    c.save();
    c.clipRect(Skia.XYWHRect(side < 0 ? -0.6 : 0, -0.3, 0.6, 0.7), ClipOp.Intersect, true);
    outlined(c, pen, leafPath(), pen.linear(0, -0.1, 0, 0.3, [tones.breaking.base, tones.breaking.dark]), LINE);
    c.restore();
    c.restore();
  }
}

function springLeaf(c: SkCanvas, pen: Pen) {
  'worklet';
  // Feder unter dem Blatt
  const coil = Skia.PathBuilder.Make();
  coil.moveTo(0, 0.18);
  for (let i = 0; i < 4; i += 1) {
    coil.lineTo(i % 2 === 0 ? 0.1 : -0.1, 0.24 + i * 0.07);
  }
  coil.lineTo(0, 0.52);
  const spring = coil.detach();
  c.drawPath(spring, pen.stroke(ink.outline, 0.07));
  c.drawPath(spring, pen.stroke(tones.spring.light, 0.035));
  leaf(c, pen, tones.spring, ink.eyeWhite);
}

function lightOrb(c: SkCanvas, pen: Pen) {
  'worklet';
  c.drawCircle(0, 0, 2, pen.radial(0, 0, 2, ['rgba(255,236,140,0.6)', 'rgba(255,236,140,0)']));
  outlined(c, pen, circlePath(0, 0, 1), pen.radial(-0.3, -0.3, 1.2, [tones.sun.light, tones.sun.base, tones.sun.dark]), 0.14);
  shine(c, pen, -0.35, -0.4, 0.3, 0.16);
}

function sun(c: SkCanvas, pen: Pen) {
  'worklet';
  c.drawCircle(0, 0, 2.4, pen.radial(0, 0, 2.4, ['rgba(255,210,58,0.55)', 'rgba(255,210,58,0)']));
  const rays = Skia.PathBuilder.Make();
  for (let i = 0; i < 16; i += 1) {
    const a = (i * Math.PI) / 8;
    const r = i % 2 === 0 ? 1.9 : 1.15;
    if (i === 0) rays.moveTo(Math.cos(a) * r, Math.sin(a) * r);
    else rays.lineTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  rays.close();
  outlined(c, pen, rays.detach(), pen.radial(0, 0, 1.9, [tones.sun.light, tones.gold.base, tones.gold.dark]), 0.1);
  outlined(c, pen, circlePath(0, 0, 0.95), pen.radial(-0.3, -0.3, 1.1, [tones.sun.light, tones.sun.base]), 0.1);
  eyes(c, pen, 0.3, -0.12, 0.17, 0);
  const smile = Skia.PathBuilder.Make().moveTo(-0.3, 0.25).quadTo(0, 0.55, 0.3, 0.25).detach();
  c.drawPath(smile, pen.stroke(ink.outline, 0.1));
}

/** Budi als Spross (Radius 1), schaut nach rechts; gespiegelt schaut er nach links. */
function budi(c: SkCanvas, pen: Pen) {
  'worklet';
  c.drawLine(0, -0.85, 0, -1.35, pen.stroke(tones.leafDeep.dark, 0.22));
  for (const side of [-1, 1]) {
    const l = Skia.PathBuilder.Make()
      .moveTo(0, -1.3)
      .quadTo(side * 0.45, -2.05, side * 1.25, -1.8)
      .quadTo(side * 0.9, -1.1, 0, -1.3)
      .close()
      .detach();
    outlined(c, pen, l, pen.linear(0, -2, 0, -1.1, [tones.budi.light, tones.budi.base]), 0.11);
  }
  outlined(c, pen, circlePath(0, 0, 1), pen.radial(-0.3, -0.4, 1.4, [tones.budi.light, tones.budi.base, tones.budi.dark]), 0.12);
  shine(c, pen, -0.4, -0.5, 0.26, 0.13);
  eyes(c, pen, 0.36, -0.12, 0.25, 0.6);
  const smile = Skia.PathBuilder.Make().moveTo(-0.22, 0.32).quadTo(0.05, 0.6, 0.32, 0.3).detach();
  c.drawPath(smile, pen.stroke(ink.outline, 0.12));
  c.drawCircle(-0.62, 0.3, 0.16, pen.fill(ink.cheek));
  c.drawCircle(0.68, 0.3, 0.16, pen.fill(ink.cheek));
}

export interface JumpSprites {
  normal: SkPicture;
  moving: SkPicture;
  breaking: SkPicture;
  broken: SkPicture;
  spring: SkPicture;
  light: SkPicture;
  sun: SkPicture;
  budi: SkPicture;
}

export function jumpSprites(): JumpSprites {
  'worklet';
  return cached('jump', () => ({
    normal: record((c, pen) => leaf(c, pen, tones.leaf, tones.leafDeep.dark)),
    moving: record(movingLeaf),
    breaking: record(breakingLeaf),
    broken: record(brokenLeaf),
    spring: record(springLeaf),
    light: record(lightOrb),
    sun: record(sun),
    budi: record(budi),
  }));
}

/** Budi für die Auswahl-Karte (Radius 1). */
export function drawBudiIcon(c: SkCanvas, pen: Pen) {
  'worklet';
  budi(c, pen);
}

function sky(c: SkCanvas, pen: Pen, width: number, height: number, stops: readonly string[]) {
  'worklet';
  c.drawRect(Skia.XYWHRect(0, 0, width, height), pen.linear(0, 0, 0, height, stops));
}

export function drawJumpDay(c: SkCanvas, pen: Pen, width: number, height: number) {
  'worklet';
  sky(c, pen, width, height, backdrops.jumpDay);
}

export function drawJumpDusk(c: SkCanvas, pen: Pen, width: number, height: number) {
  'worklet';
  sky(c, pen, width, height, backdrops.jumpDusk);
}

/** Nachthimmel mit Mond und Sternen. */
export function drawJumpNight(c: SkCanvas, pen: Pen, width: number, height: number) {
  'worklet';
  sky(c, pen, width, height, backdrops.jumpNight);
  for (let i = 0; i < 40; i += 1) {
    const x = (((i * 37) % 100) / 100) * width;
    const y = (((i * 61) % 97) / 97) * height;
    const r = 0.8 + (i % 3) * 0.7;
    c.drawCircle(x, y, r, pen.fill(i % 5 === 0 ? tones.sun.light : ink.eyeWhite));
  }
  const mx = width * 0.78;
  const my = height * 0.14;
  c.drawCircle(mx, my, 60, pen.radial(mx, my, 60, ['rgba(255,251,208,0.35)', 'rgba(255,251,208,0)']));
  c.drawCircle(mx, my, 24, pen.fill('#FFF6D0'));
  c.drawCircle(mx + 10, my - 6, 20, pen.fill(backdrops.jumpNight[0]));
}

/** Wolken als Kachel für die Parallaxe (eine Feldhöhe). */
export function drawJumpClouds(c: SkCanvas, pen: Pen, width: number, height: number) {
  'worklet';
  const clouds = [
    { x: 0.15, y: 0.12, s: 0.9 },
    { x: 0.78, y: 0.38, s: 0.7 },
    { x: 0.3, y: 0.66, s: 0.55 },
    { x: 0.85, y: 0.88, s: 0.8 },
  ];
  for (const cl of clouds) {
    const cx = cl.x * width;
    const cy = cl.y * height;
    const s = 30 * cl.s;
    const b = Skia.PathBuilder.Make();
    b.addOval(Skia.XYWHRect(cx - s * 1.7, cy - s * 0.45, s * 3.4, s * 1.1));
    b.addCircle(cx - s * 0.5, cy - s * 0.35, s * 0.7);
    b.addCircle(cx + s * 0.45, cy - s * 0.5, s * 0.85);
    const path = b.detach();
    const paint = pen.fill(backdrops.cloud);
    paint.setAlphaf(0.8);
    c.drawPath(path, paint);
  }
}

/** Startwiese ganz unten: Hügel mit Kontur und Blüten. Wandert mit der Kamera nach unten weg. */
export function drawJumpGround(c: SkCanvas, pen: Pen, width: number, height: number) {
  'worklet';
  const far = Skia.PathBuilder.Make()
    .moveTo(0, height * 0.8)
    .cubicTo(width * 0.3, height * 0.7, width * 0.6, height * 0.86, width, height * 0.76)
    .lineTo(width, height)
    .lineTo(0, height)
    .close()
    .detach();
  c.drawPath(far, pen.fill(backdrops.hillFar));
  const near = Skia.PathBuilder.Make()
    .moveTo(0, height * 0.9)
    .cubicTo(width * 0.4, height * 0.82, width * 0.7, height * 0.94, width, height * 0.87)
    .lineTo(width, height + 10)
    .lineTo(0, height + 10)
    .close()
    .detach();
  outlined(c, pen, near, pen.linear(0, height * 0.82, 0, height, [backdrops.hillNear, tones.leafDeep.dark]), 2, backdrops.hillEdge);
  for (let i = 0; i < 6; i += 1) {
    const x = width * (0.1 + i * 0.16);
    const y = height * (0.9 + ((i * 3) % 4) * 0.01);
    for (let k = 0; k < 5; k += 1) {
      const a = (k / 5) * Math.PI * 2;
      c.drawCircle(x + Math.cos(a) * 4, y + Math.sin(a) * 4, 3, pen.fill(i % 2 ? tones.petalPink.base : ink.eyeWhite));
    }
    c.drawCircle(x, y, 2.4, pen.fill(tones.bloomCore.base));
  }
}
