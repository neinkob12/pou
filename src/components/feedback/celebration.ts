// Zeitplan der Feiern (WEB-3): Kiste aufdecken, Sterne nacheinander, Belohnung zählt hoch.
// Reine Rechnungen ohne React, damit testbar. Nur Darstellung, keine Spielwerte.

/** Wie lange eine Zahl hochzählt. */
export const COUNT_UP_MS = 1200;
/** Wie lange der Münzzähler zum neuen Stand läuft. */
export const COIN_TWEEN_MS = 600;
/** Abstand zwischen zwei Sternen. */
export const STAR_STEP_MS = 280;
/** Wartezeit nach dem Aufdecken, bevor der erste Stern kommt. */
export const REVEAL_PAUSE_MS = 350;

/** Weiches Abbremsen am Ende (ease-out cubic), 0 bis 1. */
export function easeOutCubic(t: number): number {
  const c = Math.min(1, Math.max(0, t));
  return 1 - (1 - c) ** 3;
}

/** Angezeigter Wert beim Hochzählen nach `elapsedMs`. Endet genau auf `target`. */
export function countUpValue(target: number, elapsedMs: number, durationMs: number = COUNT_UP_MS): number {
  return tweenValue(0, target, elapsedMs, durationMs);
}

/** Wert beim Übergang von `from` nach `to` (etwa Münzstand nach Kauf oder Belohnung). */
export function tweenValue(from: number, to: number, elapsedMs: number, durationMs: number): number {
  if (durationMs <= 0 || elapsedMs >= durationMs) return to;
  if (elapsedMs <= 0) return from;
  return Math.round(from + (to - from) * easeOutCubic(elapsedMs / durationMs));
}

/** Verzögerung je Stern (volle zuerst), in Millisekunden ab dem Aufdecken. */
export function starDelays(total: number, startMs: number = REVEAL_PAUSE_MS, stepMs: number = STAR_STEP_MS): number[] {
  return Array.from({ length: Math.max(0, total) }, (_, i) => startMs + i * stepMs);
}

/** Wann nach dem Aufdecken die Münzen zu zählen beginnen: nach dem letzten Stern. */
export function coinsStartMs(totalStars: number): number {
  const delays = starDelays(totalStars);
  return (delays[delays.length - 1] ?? REVEAL_PAUSE_MS) + STAR_STEP_MS;
}

export interface Sparkle {
  /** Richtung in Grad. */
  angle: number;
  /** Flugweite in Pixeln. */
  distance: number;
  size: number;
  delayMs: number;
  colorIndex: number;
}

/** Funken für eine Feier, gleichmäßig im Kreis mit etwas Zufall. `random` liefert 0 bis 1. */
export function makeSparkles(count: number, colors: number, random: () => number = Math.random): Sparkle[] {
  return Array.from({ length: Math.max(0, count) }, (_, i) => ({
    angle: (360 / count) * i + (random() - 0.5) * 20,
    distance: 90 + random() * 90,
    size: 8 + random() * 10,
    delayMs: Math.round(random() * 120),
    colorIndex: i % Math.max(1, colors),
  }));
}
