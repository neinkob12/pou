// Budis Zeichengeometrie ohne React und ohne Skia, damit testbar: Blattformen als SVG-Pfade
// und der Bauplan der Pflanze je Phase. Koordinaten in Einheiten der Pflanzen-Leinwand
// (PLANT_W × PLANT_H), der Stängel steht bei SOIL. Reine Grafik, keine Balancing-Werte.

import type { BudiPlantId } from '../../../lib/assets';

export const PLANT_W = 100;
export const PLANT_H = 60;
/** Fußpunkt des Stängels in der Erde. */
export const SOIL = { x: 50, y: 58 } as const;

export interface Point {
  x: number;
  y: number;
}

const DEG = Math.PI / 180;

/** Punkt (x, y) um `deg` gedreht (0 = nach oben, positiv = im Uhrzeigersinn) und verschoben. */
export function place(x: number, y: number, deg: number, origin: Point): Point {
  const a = deg * DEG;
  const cos = Math.cos(a);
  const sin = Math.sin(a);
  return { x: origin.x + x * cos - y * sin, y: origin.y + x * sin + y * cos };
}

const fmt = (n: number) => Number(n.toFixed(2));
const pt = (p: Point) => `${fmt(p.x)} ${fmt(p.y)}`;

/**
 * Ein Fiederblatt als geschlossener Pfad: rund am Ansatz, spitz zulaufend.
 * Startet am Ansatz `base`, zeigt in Richtung `deg`.
 */
export function leafletPath(base: Point, deg: number, length: number, width: number): string {
  const p = (x: number, y: number) => pt(place(x, y, deg, base));
  const w = width / 2;
  return (
    `M${p(0, 0)} ` +
    `C${p(w * 1.25, -length * 0.22)} ${p(w * 0.9, -length * 0.78)} ${p(0, -length)} ` +
    `C${p(-w * 0.9, -length * 0.78)} ${p(-w * 1.25, -length * 0.22)} ${p(0, 0)} Z`
  );
}

/** Mittelrippe eines Fiederblatts (offener Pfad). */
export function leafletVein(base: Point, deg: number, length: number): string {
  return `M${pt(place(0, -length * 0.08, deg, base))} L${pt(place(0, -length * 0.82, deg, base))}`;
}

/** Spreizwinkel und Längen der Fiederblätter, von der Mitte nach außen. */
const LEAFLET_FAN: Record<FanLeafletCount, readonly { deg: number; len: number }[]> = {
  1: [{ deg: 0, len: 1 }],
  3: [
    { deg: 0, len: 1 },
    { deg: 38, len: 0.78 },
  ],
  5: [
    { deg: 0, len: 1 },
    { deg: 30, len: 0.86 },
    { deg: 62, len: 0.6 },
  ],
  7: [
    { deg: 0, len: 1 },
    { deg: 26, len: 0.9 },
    { deg: 52, len: 0.72 },
    { deg: 80, len: 0.48 },
  ],
};

export type FanLeafletCount = 1 | 3 | 5 | 7;

export interface Leaflet {
  shape: string;
  vein: string;
}

/**
 * Fächerblatt: ungerade Zahl Fiederblätter, symmetrisch um die Richtung `deg`.
 * `widthFactor` macht die Fiederblätter schmaler (Sativa) oder breiter (Indica), siehe STRAIN_STYLES.
 */
export function fanLeaf(base: Point, deg: number, size: number, count: FanLeafletCount, widthFactor = 1): Leaflet[] {
  const width = size * 0.34 * widthFactor;
  const out: Leaflet[] = [];
  for (const { deg: spread, len } of LEAFLET_FAN[count]) {
    const sides = spread === 0 ? [0] : [-spread, spread];
    for (const s of sides) {
      const d = deg + s;
      const l = size * len;
      out.push({ shape: leafletPath(base, d, l, width * (0.6 + len * 0.4)), vein: leafletVein(base, d, l) });
    }
  }
  // Außen zuerst zeichnen, damit das mittlere Blatt oben liegt.
  return out.reverse();
}

export interface FanLeafSpec {
  /** Ansatz am Stängel. */
  at: Point;
  /** Blattrichtung, 0 = nach oben. */
  deg: number;
  size: number;
  count: FanLeafletCount;
  /** Länge des Blattstiels vom Stängel zum Blatt. */
  petiole: number;
}

export interface BudSpec {
  at: Point;
  r: number;
}

export interface PlantSpec {
  /** Stängel als Kurve vom Boden nach oben. */
  stem: string;
  stemWidth: number;
  leaves: FanLeafSpec[];
  /** Keimblätter (rund), nur bei jungen Pflanzen. */
  cotyledons: { at: Point; size: number } | null;
  buds: BudSpec[];
  /** Samenschale beim Keimen. */
  seed: boolean;
  /** Höchster Punkt (für Tests und Hut-Platzierung). */
  top: number;
}

const stemTo = (top: number, lean = 0) =>
  `M${SOIL.x} ${SOIL.y} C${SOIL.x + lean} ${fmt(SOIL.y - (SOIL.y - top) * 0.4)} ` +
  `${SOIL.x - lean} ${fmt(SOIL.y - (SOIL.y - top) * 0.7)} ${SOIL.x} ${top}`;

/** Blattpaar links und rechts auf Höhe `y`. */
function pair(y: number, spread: number, size: number, count: FanLeafletCount, petiole: number): FanLeafSpec[] {
  return [
    { at: { x: SOIL.x, y }, deg: -spread, size, count, petiole },
    { at: { x: SOIL.x, y }, deg: spread, size, count, petiole },
  ];
}

/** Bauplan der Pflanze je Ebene. Ernte-Ebenen (b07, b08) zeichnet HarvestArt selbst. */
export function plantSpec(id: BudiPlantId): PlantSpec {
  switch (id) {
    case 'b01_germination':
      return {
        stem: `M${SOIL.x} ${SOIL.y} C${SOIL.x} 53 ${SOIL.x + 4} 50 ${SOIL.x + 1} 49`,
        stemWidth: 2.4,
        leaves: [],
        cotyledons: { at: { x: SOIL.x + 1, y: 49 }, size: 3.2 },
        buds: [],
        seed: true,
        top: 45,
      };
    case 'b02_seedling':
      return {
        stem: stemTo(42),
        stemWidth: 2.6,
        leaves: [
          ...pair(44, 58, 8, 3, 1),
          { at: { x: SOIL.x, y: 42 }, deg: 0, size: 9, count: 3, petiole: 0 },
        ],
        cotyledons: { at: { x: SOIL.x, y: 50 }, size: 5.5 },
        buds: [],
        seed: false,
        top: 34,
      };
    case 'b03_vegetative_small':
      return {
        stem: stemTo(30, 2),
        stemWidth: 3.2,
        leaves: [
          ...pair(47, 68, 16, 5, 4),
          ...pair(38, 50, 14, 5, 2),
          { at: { x: SOIL.x, y: 30 }, deg: 0, size: 12, count: 5, petiole: 0 },
        ],
        cotyledons: null,
        buds: [],
        seed: false,
        top: 21,
      };
    case 'b04_vegetative_large':
      return {
        stem: stemTo(16, 3),
        stemWidth: 3.8,
        leaves: [
          ...pair(49, 76, 21, 7, 6),
          ...pair(39, 62, 19, 7, 5),
          ...pair(29, 48, 16, 7, 3),
          ...pair(21, 36, 12, 5, 1),
          { at: { x: SOIL.x, y: 16 }, deg: 0, size: 12, count: 5, petiole: 0 },
        ],
        cotyledons: null,
        buds: [],
        seed: false,
        top: 7,
      };
    case 'b05_flowering_early':
      return {
        stem: stemTo(12, 3),
        stemWidth: 4,
        leaves: [
          ...pair(49, 78, 21, 7, 6),
          ...pair(40, 64, 19, 7, 5),
          ...pair(30, 50, 16, 7, 3),
          ...pair(21, 38, 12, 5, 1),
        ],
        cotyledons: null,
        buds: [
          { at: { x: SOIL.x, y: 12 }, r: 4 },
          { at: { x: SOIL.x - 4, y: 30 }, r: 2.4 },
          { at: { x: SOIL.x + 4, y: 30 }, r: 2.4 },
          { at: { x: SOIL.x - 3, y: 21 }, r: 2.6 },
          { at: { x: SOIL.x + 3, y: 21 }, r: 2.6 },
        ],
        seed: false,
        top: 7,
      };
    case 'b06_flowering_full':
      return {
        stem: stemTo(9, 3),
        stemWidth: 4.4,
        leaves: [
          ...pair(50, 80, 22, 7, 6),
          ...pair(41, 66, 20, 7, 5),
          ...pair(31, 52, 16, 7, 3),
          ...pair(22, 40, 12, 5, 1),
        ],
        cotyledons: null,
        buds: [
          { at: { x: SOIL.x, y: 9 }, r: 6.2 },
          { at: { x: SOIL.x, y: 16 }, r: 5.4 },
          { at: { x: SOIL.x - 5, y: 31 }, r: 3.6 },
          { at: { x: SOIL.x + 5, y: 31 }, r: 3.6 },
          { at: { x: SOIL.x - 4, y: 22 }, r: 4 },
          { at: { x: SOIL.x + 4, y: 22 }, r: 4 },
          { at: { x: SOIL.x - 6, y: 41 }, r: 2.8 },
          { at: { x: SOIL.x + 6, y: 41 }, r: 2.8 },
        ],
        seed: false,
        top: 2,
      };
    case 'b07_drying':
    case 'b08_harvest_ready':
      return { stem: '', stemWidth: 0, leaves: [], cotyledons: null, buds: [], seed: false, top: 0 };
  }
}

/** Ende des Blattstiels: dort sitzt das Fächerblatt. */
export function leafBase(spec: FanLeafSpec): Point {
  return place(0, -spec.petiole, spec.deg, spec.at);
}

/**
 * Knospe als Traube aus Kugeln (Blütenstand): Mittelpunkt und Radius je Kugel.
 * Deterministisch, damit die Zeichnung nicht bei jedem Rendern springt.
 */
export function budCluster(bud: BudSpec): { x: number; y: number; r: number }[] {
  const { at, r } = bud;
  return [
    { x: at.x, y: at.y + r * 0.55, r: r * 0.7 },
    { x: at.x - r * 0.5, y: at.y + r * 0.1, r: r * 0.62 },
    { x: at.x + r * 0.5, y: at.y + r * 0.1, r: r * 0.62 },
    { x: at.x, y: at.y - r * 0.35, r: r * 0.66 },
  ];
}
