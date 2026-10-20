// Wo der Münzzähler im Fenster steht (WEB-3): Ziel für fliegende Münzen. Der Zähler meldet seine
// Position beim Layout, die Feier-Ebene liest sie beim Abflug.

export interface Point {
  x: number;
  y: number;
}

let anchor: Point | null = null;

export function setCoinAnchor(point: Point | null) {
  anchor = point;
}

export function getCoinAnchor(): Point | null {
  return anchor;
}

/** Mitte eines Rechtecks im Fenster. */
export function centerOf(x: number, y: number, width: number, height: number): Point {
  return { x: x + width / 2, y: y + height / 2 };
}
