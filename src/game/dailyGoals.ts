// Tagesziele (Auftrag P19): ein Ziel pro Kalendertag, Fortschritt aus Ereignissen, Belohnungskiste.
// Reines TypeScript. Der Tag kommt immer aus dem Zeitstempel (Ortszeit), nie aus einem Timer:
// Wer nach drei Tagen wieder öffnet, bekommt sofort das Ziel von heute.

import { DAILY_GOAL_CHEST_COINS, DAILY_GOAL_POOL, DAILY_GOAL_TEMPLATES, type DailyGoalId } from './config';
import type { CareActionId, GameEvents } from './events';

export type DailyGoalTemplate =
  | { kind: 'minigameScore'; gameId: string; target: number }
  | { kind: 'minigameRounds'; target: number }
  | { kind: 'care'; careActions: readonly CareActionId[]; target: number };

const TEMPLATES: Record<DailyGoalId, DailyGoalTemplate> = DAILY_GOAL_TEMPLATES;

export interface DailyGoalState {
  /** Kalendertag (Ortszeit), siehe dayNumber. */
  day: number;
  goalId: DailyGoalId;
  progress: number;
  /** Kiste schon geöffnet. */
  claimed: boolean;
}

/** Ereignisse, die ein Tagesziel voranbringen können. */
export type DailyGoalEvent =
  | ({ type: 'minigameFinished' } & GameEvents['minigameFinished'])
  | ({ type: 'careAction' } & GameEvents['careAction']);

/** Fortlaufende Nummer des Kalendertags in Ortszeit. Sommer- und Winterzeit verschieben sie nicht. */
export function dayNumber(ms: number): number {
  const d = new Date(ms);
  return Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86_400_000);
}

/** Ziel eines Tages: reihum durch den Pool, zwei Tage hintereinander nie dasselbe (Pool > 1). */
export function goalIdForDay(day: number, pool: readonly DailyGoalId[] = DAILY_GOAL_POOL): DailyGoalId {
  const n = pool.length;
  return pool[((day % n) + n) % n];
}

export function goalTemplate(goalId: DailyGoalId): DailyGoalTemplate {
  return TEMPLATES[goalId];
}

export function createDailyGoal(nowMs: number): DailyGoalState {
  const day = dayNumber(nowMs);
  return { day, goalId: goalIdForDay(day), progress: 0, claimed: false };
}

/**
 * Ziel für den Tag von `nowMs`. Neuer Tag: neues Ziel, alter Fortschritt und ungeöffnete Kiste
 * verfallen. Steht die Uhr vor dem gespeicherten Tag (zurückgestellt), bleibt das Ziel, damit
 * Zurückdrehen kein frisches Ziel bringt.
 */
export function ensureDailyGoal(state: DailyGoalState | null, nowMs: number): DailyGoalState {
  if (!state || !(state.goalId in TEMPLATES)) return createDailyGoal(nowMs);
  return dayNumber(nowMs) > state.day ? createDailyGoal(nowMs) : state;
}

/** Wie viel ein Ereignis zum Ziel beiträgt. */
export function progressFor(template: DailyGoalTemplate, event: DailyGoalEvent): number {
  switch (template.kind) {
    case 'minigameScore':
      return event.type === 'minigameFinished' && event.gameId === template.gameId ? Math.max(0, event.score) : 0;
    case 'minigameRounds':
      return event.type === 'minigameFinished' ? 1 : 0;
    case 'care':
      return event.type === 'careAction' && template.careActions.includes(event.action) ? 1 : 0;
  }
}

/** Rechnet ein Ereignis ein. Tageswechsel aus `event.atMs`. Fortschritt ist beim Ziel gedeckelt. */
export function applyGoalEvent(state: DailyGoalState | null, event: DailyGoalEvent): DailyGoalState {
  const current = ensureDailyGoal(state, event.atMs);
  // Ereignis von einem früheren Tag (z. B. Uhr zurückgestellt): zählt nicht für heute.
  if (dayNumber(event.atMs) < current.day) return current;
  const template = TEMPLATES[current.goalId];
  const gained = progressFor(template, event);
  if (gained === 0 || current.progress >= template.target) return current;
  return { ...current, progress: Math.min(template.target, current.progress + gained) };
}

export function isGoalComplete(state: DailyGoalState): boolean {
  return state.progress >= TEMPLATES[state.goalId].target;
}

/** Kiste kann geöffnet werden: Ziel geschafft und noch nicht geöffnet. */
export function canClaimChest(state: DailyGoalState): boolean {
  return isGoalComplete(state) && !state.claimed;
}

/** Öffnet die Kiste. `coins` ist 0, wenn es nichts zu holen gibt. */
export function claimChest(state: DailyGoalState): { state: DailyGoalState; coins: number } {
  if (!canClaimChest(state)) return { state, coins: 0 };
  return { state: { ...state, claimed: true }, coins: DAILY_GOAL_CHEST_COINS };
}
