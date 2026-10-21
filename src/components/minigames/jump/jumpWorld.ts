// Zustand von Budi Jump, ohne React. Welt-Einheiten: Breite immer BUDI_JUMP.worldWidth, y zählt nach oben.
// Die 'worklet'-Funktionen laufen im Frame-Callback auf dem UI-Thread.

import { BUDI_JUMP } from '../../../game/config';

export type JumpConfig = typeof BUDI_JUMP;

/** Normal: federt immer. Brechend: trägt einmal, dann fällt es. Feder: schießt Budi höher. */
export type PlatformKind = 'normal' | 'breaking' | 'spring';

export interface Platform {
  /** Mitte des Blatts. */
  x: number;
  /** Oberkante des Blatts. */
  y: number;
  kind: PlatformKind;
  /** Brechendes Blatt nach der Landung: fällt, trägt nicht mehr. */
  broken: boolean;
  /** Wander-Blatt (Auftrag 45): gleitet mit diesem Tempo seitlich, prallt an den Rändern ab. */
  vx?: number;
}

/** Sammelbarer Lichtpunkt (Mittelpunkt). */
export interface LightPoint {
  x: number;
  y: number;
}

export interface JumpWorld {
  /** Budis Mittelpunkt. */
  x: number;
  y: number;
  vx: number;
  vy: number;
  platforms: Platform[];
  lights: LightPoint[];
  /** In dieser Runde gesammelte Lichtpunkte. */
  lightsCollected: number;
  /** Unterer Rand des sichtbaren Ausschnitts in Welt-Einheiten. */
  cameraY: number;
  /** Oberkante des höchsten erzeugten Blatts. */
  topPlatformY: number;
  /** Höchster Punkt, den Budi erreicht hat (für die Punkte). */
  maxY: number;
  /** Zustand des Zufallsgenerators, damit jede Runde aus einem Startwert reproduzierbar ist. */
  seed: number;
  /** Noch nicht verrechnete Zeit unter einem Physik-Schritt. */
  restMs: number;
  /** Budi ist unten rausgefallen. */
  fallen: boolean;
  /** Sonnenstrahlen zum Einsammeln (Auftrag 45). */
  boosts?: LightPoint[];
  /** Restzeit (ms), in der ein Sonnenstrahl Budi nach oben trägt. */
  boostMs?: number;
  /** In dieser Runde eingesammelte Sonnenstrahlen. */
  boostsCollected?: number;
}

/** Zufallszahl in [0, 1) und neuer Zustand (mulberry32). */
export function nextRandom(seed: number): [number, number] {
  'worklet';
  const s = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(s ^ (s >>> 15), 1 | s);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return [((t ^ (t >>> 14)) >>> 0) / 4294967296, s];
}

/** Startwelt: ein normales Blatt mittig unter Budi, Budi springt sofort ab. */
export function createWorld(seed: number, cfg: JumpConfig = BUDI_JUMP): JumpWorld {
  'worklet';
  const startX = cfg.worldWidth / 2;
  return {
    x: startX,
    y: cfg.budiRadius,
    vx: 0,
    vy: cfg.jumpVelocity,
    platforms: [{ x: startX, y: 0, kind: 'normal', broken: false }],
    lights: [],
    lightsCollected: 0,
    cameraY: -cfg.budiRadius * 4,
    topPlatformY: 0,
    maxY: 0,
    seed,
    restMs: 0,
    fallen: false,
  };
}
