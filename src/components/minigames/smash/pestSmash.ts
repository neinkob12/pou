// Regeln von "Schädlings-Smash", ohne React. Die 'worklet'-Funktionen laufen im Frame-Callback
// und beim Tippen auf dem UI-Thread. Zufall kommt als Zahl in [0, 1) rein, damit alles testbar bleibt.

import { PEST_SMASH } from '../../../game/config';

export type SmashConfig = typeof PEST_SMASH;
export type CritterKind = 'mite' | 'gnat' | 'ladybug';

export interface Critter {
  id: number;
  kind: CritterKind;
  hole: number;
  /** Spielzeit (ms), zu der das Tier aufgetaucht ist. */
  spawnedAtMs: number;
  lifetimeMs: number;
  /** Spielzeit des Treffers, null solange nicht getroffen. */
  hitAtMs: number | null;
}

export interface SmashState {
  critters: Critter[];
  nextId: number;
  nextSpawnAtMs: number;
  /** Treffer in Folge; 0 = keine Kombo. */
  combo: number;
  lastHitAtMs: number | null;
}

export interface TapOutcome {
  state: SmashState;
  /** Punkte für diesen Tipp (negativ bei Marienkäfer), 0 bei Fehltipp. */
  points: number;
  kind: CritterKind | null;
}

export function createSmashState(): SmashState {
  'worklet';
  return { critters: [], nextId: 1, nextSpawnAtMs: 0, combo: 0, lastHitAtMs: null };
}

export function holeCount(cfg: SmashConfig = PEST_SMASH): number {
  'worklet';
  return cfg.gridCols * cfg.gridRows;
}

/** Rundenfortschritt 0 bis 1. */
function progress(elapsedMs: number, cfg: SmashConfig): number {
  'worklet';
  const total = cfg.durationSeconds * 1000;
  return Math.min(1, Math.max(0, elapsedMs / total));
}

function lerp(from: number, to: number, t: number): number {
  'worklet';
  return from + (to - from) * t;
}

/** Abstand bis zum nächsten Tier: wird über die Runde kürzer. */
export function spawnIntervalMs(elapsedMs: number, cfg: SmashConfig = PEST_SMASH): number {
  'worklet';
  return lerp(cfg.spawnIntervalStartMs, cfg.spawnIntervalEndMs, progress(elapsedMs, cfg));
}

/** Sichtbarkeit eines Tiers: wird über die Runde kürzer. */
export function critterLifetimeMs(elapsedMs: number, cfg: SmashConfig = PEST_SMASH): number {
  'worklet';
  return lerp(cfg.lifetimeStartMs, cfg.lifetimeEndMs, progress(elapsedMs, cfg));
}

export function critterKindFor(rand: number, cfg: SmashConfig = PEST_SMASH): CritterKind {
  'worklet';
  if (rand < cfg.ladybugChance) return 'ladybug';
  const pestRand = (rand - cfg.ladybugChance) / (1 - cfg.ladybugChance);
  return pestRand < cfg.miteShareOfPests ? 'mite' : 'gnat';
}

/** Freies Loch per Zufall, -1 wenn alle belegt sind. */
export function pickFreeHole(rand: number, critters: readonly Critter[], holes: number): number {
  'worklet';
  const free: number[] = [];
  for (let h = 0; h < holes; h++) {
    if (!critters.some((c) => c.hole === h)) free.push(h);
  }
  if (free.length === 0) return -1;
  return free[Math.min(free.length - 1, Math.floor(rand * free.length))];
}

export function isActive(critter: Critter, elapsedMs: number): boolean {
  'worklet';
  return critter.hitAtMs === null && elapsedMs - critter.spawnedAtMs < critter.lifetimeMs;
}

export function comboMultiplier(combo: number, cfg: SmashConfig = PEST_SMASH): number {
  'worklet';
  if (combo <= 0) return 1;
  return Math.min(cfg.maxComboMultiplier, 1 + Math.floor((combo - 1) / cfg.comboStep));
}

/**
 * Ein Frame: abgelaufene und fertig angezeigte Tiere weg, Kombo verfällt nach dem Zeitfenster,
 * neues Tier, wenn es Zeit ist. Gibt denselben Zustand zurück, wenn sich nichts ändert.
 */
export function stepSmash(
  state: SmashState,
  elapsedMs: number,
  randKind: number,
  randHole: number,
  cfg: SmashConfig = PEST_SMASH,
): SmashState {
  'worklet';
  const critters = state.critters.filter((c) =>
    c.hitAtMs === null ? elapsedMs - c.spawnedAtMs < c.lifetimeMs : elapsedMs - c.hitAtMs < cfg.hitShowMs,
  );
  let changed = critters.length !== state.critters.length;

  let combo = state.combo;
  if (combo > 0 && state.lastHitAtMs !== null && elapsedMs - state.lastHitAtMs > cfg.comboWindowMs) {
    combo = 0;
    changed = true;
  }

  let { nextId, nextSpawnAtMs } = state;
  if (elapsedMs >= nextSpawnAtMs) {
    const hole = pickFreeHole(randHole, critters, holeCount(cfg));
    if (hole >= 0) {
      critters.push({
        id: nextId,
        kind: critterKindFor(randKind, cfg),
        hole,
        spawnedAtMs: elapsedMs,
        lifetimeMs: critterLifetimeMs(elapsedMs, cfg),
        hitAtMs: null,
      });
      nextId += 1;
      nextSpawnAtMs = elapsedMs + spawnIntervalMs(elapsedMs, cfg);
      changed = true;
    }
  }

  if (!changed) return state;
  return { ...state, critters, combo, nextId, nextSpawnAtMs };
}

/**
 * Tipp auf ein Loch. Schädling: Punkte mal Kombo-Multiplikator, Kombo steigt bei schnellen Treffern.
 * Marienkäfer: Abzug, höchstens bis 0 (`currentScore`), Kombo vorbei.
 */
export function tapHole(
  state: SmashState,
  hole: number,
  elapsedMs: number,
  currentScore: number,
  cfg: SmashConfig = PEST_SMASH,
): TapOutcome {
  'worklet';
  const target = state.critters.find((c) => c.hole === hole && isActive(c, elapsedMs));
  if (!target) return { state, points: 0, kind: null };

  const critters = state.critters.map((c) => (c.id === target.id ? { ...c, hitAtMs: elapsedMs } : c));
  if (target.kind === 'ladybug') {
    const penalty = Math.min(cfg.ladybugPenalty, Math.max(0, currentScore));
    const points = penalty > 0 ? -penalty : 0;
    return { state: { ...state, critters, combo: 0, lastHitAtMs: null }, points, kind: target.kind };
  }

  const quick = state.lastHitAtMs !== null && elapsedMs - state.lastHitAtMs <= cfg.comboWindowMs;
  const combo = quick ? state.combo + 1 : 1;
  const points = cfg.pointsPerPest * comboMultiplier(combo, cfg);
  return { state: { ...state, critters, combo, lastHitAtMs: elapsedMs }, points, kind: target.kind };
}

export interface HoleLayout {
  /** Mitte des Lochs. */
  x: number;
  y: number;
  /** Halbe Breite einer Zelle; Grundmaß für Tiergröße und Trefferkreis. */
  cell: number;
}

export function holeLayout(hole: number, width: number, height: number, cfg: SmashConfig = PEST_SMASH): HoleLayout {
  'worklet';
  const col = hole % cfg.gridCols;
  const row = Math.floor(hole / cfg.gridCols);
  const cellW = width / cfg.gridCols;
  const cellH = height / cfg.gridRows;
  return { x: (col + 0.5) * cellW, y: (row + 0.5) * cellH, cell: Math.min(cellW, cellH) / 2 };
}

/** Welches Loch liegt unter dem Finger? -1, wenn keins nah genug ist. */
export function holeAt(px: number, py: number, width: number, height: number, cfg: SmashConfig = PEST_SMASH): number {
  'worklet';
  if (width <= 0 || height <= 0) return -1;
  const col = Math.floor(px / (width / cfg.gridCols));
  const row = Math.floor(py / (height / cfg.gridRows));
  if (col < 0 || col >= cfg.gridCols || row < 0 || row >= cfg.gridRows) return -1;
  const hole = row * cfg.gridCols + col;
  const { x, y, cell } = holeLayout(hole, width, height, cfg);
  const reach = cell * 2 * cfg.hitRadiusFactor;
  const dx = px - x;
  const dy = py - y;
  return dx * dx + dy * dy <= reach * reach ? hole : -1;
}

/** Gibt es zur Belohnung den Schädlingsschutz? */
export function earnsPestProtection(score: number, cfg: SmashConfig = PEST_SMASH): boolean {
  return score >= cfg.protectionMinScore;
}
