// Rahmen der Web-Version am Rechner (WEB-3): Ab einer Fensterbreite, die eher Rechner als Handy ist,
// läuft das Spiel in einem zentrierten Handy-Rahmen statt über die volle Breite. Rein, damit testbar.

/** Ab dieser Fensterbreite gilt das Fenster als Rechner und bekommt den Rahmen. */
export const FRAME_FROM_WIDTH = 600;
/** Breite des Rahmens, etwa ein großes Handy. */
export const FRAME_WIDTH = 420;
/** Größte Höhe des Rahmens, damit er auf hohen Bildschirmen nicht absurd lang wird. */
export const FRAME_MAX_HEIGHT = 900;
/** Abstand des Rahmens zum Fensterrand oben und unten. */
export const FRAME_MARGIN = 24;

export interface FrameLayout {
  framed: boolean;
  width: number;
  height: number;
}

/** Größe der Spielfläche im Fenster. Am Handy die volle Fläche, am Rechner der Rahmen. */
export function frameLayout(windowWidth: number, windowHeight: number): FrameLayout {
  if (windowWidth < FRAME_FROM_WIDTH) return { framed: false, width: windowWidth, height: windowHeight };
  const height = Math.max(Math.min(windowHeight - 2 * FRAME_MARGIN, FRAME_MAX_HEIGHT), 0);
  return { framed: true, width: FRAME_WIDTH, height };
}

// WEB-5: Titel und Hinweise neben dem Rahmen, wenn links genug Platz ist.
/** Ab dieser Fensterbreite steht der Titel links neben dem Rahmen, sonst klein oben links. */
export const BRAND_BESIDE_FROM_WIDTH = 1000;
/** Breite der Titelspalte neben dem Rahmen. */
export const BRAND_WIDTH = 320;

/** Steht der Titel neben dem Rahmen (true) oder klein in der Ecke (false)? */
export function brandBeside(windowWidth: number): boolean {
  return windowWidth >= BRAND_BESIDE_FROM_WIDTH;
}
