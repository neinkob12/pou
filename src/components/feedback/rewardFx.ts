// Belohnungs-Effekte (ART-5): Konfetti, Münzregen, Kamera-Wackeln, Einfedern der Screens.
// Reine Rechnungen ohne React, damit testbar. Nur Darstellung, keine Spielwerte.

/** Wie lange ein Konfetti-Stück von oben nach unten fällt (Mittelwert). */
export const CONFETTI_FALL_MS = 2200;
/** Wie lange eine Münze beim Münzregen fällt. */
export const COIN_RAIN_FALL_MS = 1100;
/** Höchstens so viele Münzen regnen, egal wie groß die Belohnung ist. */
export const COIN_RAIN_MAX = 18;
/** Mindestens so viele Münzen, damit auch kleine Belohnungen nach etwas aussehen. */
export const COIN_RAIN_MIN = 6;

export interface ConfettiPiece {
  /** Start links, 0 bis 1 der Breite. */
  x: number;
  /** Seitliches Pendeln in Pixeln. */
  sway: number;
  /** Drehungen bis zum Boden (Vorzeichen = Richtung). */
  spin: number;
  width: number;
  height: number;
  /** Rund (Kreis) statt Streifen. */
  round: boolean;
  delayMs: number;
  durationMs: number;
  colorIndex: number;
}

/** Konfetti-Stücke, über die Breite verteilt, mit Zufall in Form, Drehung und Tempo. */
export function makeConfetti(count: number, colors: number, random: () => number = Math.random): ConfettiPiece[] {
  const n = Math.max(0, Math.floor(count));
  return Array.from({ length: n }, (_, i) => {
    const round = random() < 0.25;
    const size = 7 + random() * 6;
    return {
      x: (i + random()) / Math.max(1, n),
      sway: 12 + random() * 26,
      spin: (random() < 0.5 ? -1 : 1) * (1 + random() * 2),
      width: size,
      height: round ? size : size * 1.7,
      round,
      delayMs: Math.round(random() * 450),
      durationMs: Math.round(CONFETTI_FALL_MS * (0.8 + random() * 0.45)),
      colorIndex: i % Math.max(1, colors),
    };
  });
}

/** Wie viele Münzen für eine Belohnung regnen: wächst mit der Belohnung, aber gedeckelt. */
export function coinRainCount(coins: number): number {
  if (!(coins > 0)) return 0;
  const n = Math.round(Math.sqrt(coins) * 1.6);
  return Math.min(COIN_RAIN_MAX, Math.max(COIN_RAIN_MIN, n));
}

export interface RainCoin {
  /** Start links, 0 bis 1 der Breite. */
  x: number;
  /** Landehöhe, 0 bis 1 der Höhe (unteres Drittel). */
  landY: number;
  size: number;
  delayMs: number;
  /** Seitliche Neigung im Fall, Grad. */
  tilt: number;
}

/** Münzen für den Münzregen. Sie landen gestaffelt im unteren Bereich und hüpfen kurz. */
export function makeCoinRain(count: number, random: () => number = Math.random): RainCoin[] {
  const n = Math.max(0, Math.floor(count));
  return Array.from({ length: n }, (_, i) => ({
    x: 0.08 + ((i + random()) / Math.max(1, n)) * 0.84,
    landY: 0.7 + random() * 0.2,
    size: 22 + random() * 10,
    delayMs: Math.round(i * 55 + random() * 60),
    tilt: (random() - 0.5) * 50,
  }));
}

export interface ShakeStep {
  x: number;
  y: number;
  rotate: number;
}

/**
 * Kamera-Wackeln: abklingende Ausschläge links und rechts, endet genau in Ruhe.
 * `strength` 0 bis 1 skaliert die Weite (Ernte stark, Kauf leicht).
 */
export function shakeSteps(strength: number, steps = 8): ShakeStep[] {
  const s = Math.min(1, Math.max(0, strength));
  const out: ShakeStep[] = [];
  for (let i = 0; i < steps; i++) {
    const decay = 1 - i / steps;
    const dir = i % 2 === 0 ? 1 : -1;
    out.push({ x: dir * 10 * s * decay, y: (i % 3 === 0 ? -1 : 1) * 4 * s * decay, rotate: dir * 1.5 * s * decay });
  }
  out.push({ x: 0, y: 0, rotate: 0 });
  return out;
}

/** Dauer eines Schritts beim Wackeln. */
export const SHAKE_STEP_MS = 45;

/** Einfedern eines Screens: Start klein und etwas tiefer, Feder schießt leicht über. */
export const SCREEN_ENTER = {
  fromScale: 0.94,
  fromY: 26,
  /** Abdunkeln zu Beginn, blendet aus, während der Screen hereinfedert. */
  dim: 0.35,
  dimMs: 320,
  damping: 13,
  stiffness: 170,
} as const;

/** Wert zwischen Start und Ziel des Einfederns für Fortschritt `t` (0 bis 1, darf überschießen). */
export function enterPose(t: number): { scale: number; translateY: number; opacity: number } {
  'worklet';
  return {
    scale: SCREEN_ENTER.fromScale + (1 - SCREEN_ENTER.fromScale) * t,
    translateY: SCREEN_ENTER.fromY * (1 - t),
    opacity: Math.min(1, Math.max(0, t * 1.6)),
  };
}

/** Neues Level aus zwei Erfahrungsständen, oder null, wenn keins erreicht wurde. */
export function levelReached(levelBefore: number, levelAfter: number): number | null {
  return levelAfter > levelBefore ? levelAfter : null;
}
