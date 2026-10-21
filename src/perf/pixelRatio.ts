// Web-Leistung (WEB-6). Reines TypeScript, getestet in __tests__/pixelRatio.test.ts.

/**
 * WEB-6: Höchste Pixeldichte für Skia-Leinwände. Skia-Web richtet jede Leinwand nach
 * window.devicePixelRatio ein; Handys mit 3 zeichnen damit 9 Pixel je Punkt, bei 2 nur 4. Der Unterschied
 * ist bei Budis weichen Formen kaum zu sehen, spart der Grafikkarte schwacher Handys aber über die Hälfte
 * der Arbeit, vor allem in den Minigames (Vollbild-Leinwand in jedem Bild). CSS, Text und Bilder bleiben
 * scharf, sie lesen den Wert nicht.
 */
export const MAX_CANVAS_PIXEL_RATIO = 2;

export function capPixelRatio(target: { devicePixelRatio: number }, max = MAX_CANVAS_PIXEL_RATIO): void {
  const native = target.devicePixelRatio;
  if (!(native > max)) return;
  try {
    Object.defineProperty(target, 'devicePixelRatio', { configurable: true, get: () => max });
  } catch {
    // Browser erlaubt kein Überschreiben: dann eben volle Dichte.
  }
}
