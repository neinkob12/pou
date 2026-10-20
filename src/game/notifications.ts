// PotPou Benachrichtigungs-Plan (Auftrag P18). Reines TypeScript ohne Expo.
// Berechnet aus Zeitstempeln, wann Budi sich melden soll, solange die App zu ist:
// bald Durst, bald Hunger, Phasenwechsel, erntebereit, Koma droht.
// Regeln: höchstens NOTIFICATIONS_MAX_PER_DAY pro Tag, nie in der Ruhezeit, Mindestabstand.
// Die Texte und das eigentliche Planen beim System macht src/lib/notifications.ts.

import {
  COMA_AFTER_REAL_HOURS,
  NEED_DECAY_PER_REAL_HOUR,
  NEED_PHASE_DECAY_FACTOR,
  NEED_THRESHOLDS,
  NOTIFICATION_BEFORE_QUIET_MINUTES,
  NOTIFICATION_COMA_WARNING_HOURS_BEFORE,
  NOTIFICATION_HORIZON_REAL_HOURS,
  NOTIFICATION_MIN_DELAY_MINUTES,
  NOTIFICATION_MIN_GAP_MINUTES,
  NOTIFICATION_PRIORITY,
  NOTIFICATION_QUIET_HOURS,
  NOTIFICATIONS_MAX_PER_DAY,
  type PhaseId,
} from './config';
import { computeNeeds, NO_MODIFIERS, type NeedId, type NeedsState } from './needs';
import { getPlantStatus, type PlantRecord } from './timeEngine';

const MS_PER_MINUTE = 60 * 1000;
const MS_PER_HOUR = 60 * MS_PER_MINUTE;

export type NotificationKind = keyof typeof NOTIFICATION_PRIORITY;

export interface PlannedNotification {
  kind: NotificationKind;
  atMs: number;
  /** Nur bei phaseChanged: die neue Phase. */
  phase?: PhaseId;
}

export interface NotificationPlanInput {
  nowMs: number;
  plant: PlantRecord | null;
  needs: NeedsState;
  /** Zeitpunkte schon zugestellter Benachrichtigungen (für Tageslimit und Abstand). */
  sentMs: readonly number[];
  /** Zeitraffer aus dem Debug-Menü. Standard: wie die Zeit-Engine. */
  debugMultiplier?: number;
}

interface Candidate extends PlannedNotification {
  /** Später als hier ist die Nachricht sinnlos (z. B. Koma-Warnung nach dem Koma). */
  latestMs?: number;
}

const NEXT_PHASE: Partial<Record<PhaseId, PhaseId>> = {
  germination: 'seedling',
  seedling: 'vegetative',
  vegetative: 'flowering',
  flowering: 'ready',
  drying: 'done',
};

/** Liegt der Zeitpunkt in der Ruhezeit (Ortszeit)? */
export function isQuietTime(ms: number): boolean {
  const hour = new Date(ms).getHours();
  const { startHour, endHour } = NOTIFICATION_QUIET_HOURS;
  return startHour > endHour ? hour >= startHour || hour < endHour : hour >= startHour && hour < endHour;
}

/** Schlüssel des Kalendertags in Ortszeit, z. B. "2026-9-20". */
export function localDayKey(ms: number): string {
  const d = new Date(ms);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

/** Ende der Ruhezeit, in der `ms` liegt (Ortszeit, volle Stunde). */
function quietEnd(ms: number): number {
  const d = new Date(ms);
  if (d.getHours() >= NOTIFICATION_QUIET_HOURS.startHour) d.setDate(d.getDate() + 1);
  d.setHours(NOTIFICATION_QUIET_HOURS.endHour, 0, 0, 0);
  return d.getTime();
}

/** Beginn der Ruhezeit, in der `ms` liegt. */
function quietStart(ms: number): number {
  const d = new Date(ms);
  if (d.getHours() < NOTIFICATION_QUIET_HOURS.startHour) d.setDate(d.getDate() - 1);
  d.setHours(NOTIFICATION_QUIET_HOURS.startHour, 0, 0, 0);
  return d.getTime();
}

/**
 * Schiebt einen Zeitpunkt aus der Ruhezeit: normal auf das Ende (morgens). Wäre die Nachricht
 * dann zu spät (`latestMs`), wird sie auf kurz vor Beginn der Ruhezeit vorgezogen. Geht beides
 * nicht, Rückgabe null.
 */
export function moveOutOfQuietTime(atMs: number, earliestMs: number, latestMs?: number): number | null {
  if (!isQuietTime(atMs)) return atMs;
  const morning = quietEnd(atMs);
  if (latestMs === undefined || morning <= latestMs) return morning;
  const evening = quietStart(atMs) - NOTIFICATION_BEFORE_QUIET_MINUTES * MS_PER_MINUTE;
  return evening >= earliestMs ? evening : null;
}

/** Echte Millisekunden, bis der Balken auf `level` fällt. null, wenn er nicht fällt. */
function msUntilNeedBelow(id: NeedId, current: number, level: number, phase: PhaseId): number | null {
  const rate = NEED_DECAY_PER_REAL_HOUR[id] * (NEED_PHASE_DECAY_FACTOR[phase]?.[id] ?? 1);
  if (rate <= 0) return null;
  return (Math.max(0, current - level) / rate) * MS_PER_HOUR;
}

function collectCandidates(input: NotificationPlanInput): Candidate[] {
  const { nowMs, plant, needs, debugMultiplier } = input;
  if (!plant) return [];

  const status = getPlantStatus(plant, nowMs, debugMultiplier);
  const candidates: Candidate[] = [];

  const next = NEXT_PHASE[status.phase];
  if (next && status.realMsUntilPhaseEnd !== null) {
    const atMs = nowMs + status.realMsUntilPhaseEnd;
    candidates.push(next === 'ready' ? { kind: 'harvestReady', atMs } : { kind: 'phaseChanged', atMs, phase: next });
  }

  if (status.phase === 'drying' || status.phase === 'done') return candidates;

  const comaAtMs = needs.lastCareAtMs + COMA_AFTER_REAL_HOURS * MS_PER_HOUR;
  if (nowMs >= comaAtMs) return candidates;

  candidates.push({
    kind: 'comaWarning',
    atMs: comaAtMs - NOTIFICATION_COMA_WARNING_HOURS_BEFORE * MS_PER_HOUR,
    latestMs: comaAtMs,
  });

  const snapshot = computeNeeds(needs, nowMs, NO_MODIFIERS, status.phase);
  const thirstyIn = msUntilNeedBelow('water', snapshot.water, NEED_THRESHOLDS.low, status.phase);
  if (thirstyIn !== null) candidates.push({ kind: 'thirsty', atMs: nowMs + thirstyIn, latestMs: comaAtMs });
  const hungryIn = msUntilNeedBelow('nutrients', snapshot.nutrients, NEED_THRESHOLDS.low, status.phase);
  if (hungryIn !== null) candidates.push({ kind: 'hungry', atMs: nowMs + hungryIn, latestMs: comaAtMs });

  return candidates;
}

/**
 * Plan der Benachrichtigungen ab `nowMs`, zeitlich sortiert. Wird bei jedem Schließen der App
 * neu berechnet; alte, noch nicht zugestellte Benachrichtigungen werden dabei ersetzt.
 */
export function planNotifications(input: NotificationPlanInput): PlannedNotification[] {
  const { nowMs, sentMs } = input;
  const earliestMs = nowMs + NOTIFICATION_MIN_DELAY_MINUTES * MS_PER_MINUTE;
  const horizonMs = nowMs + NOTIFICATION_HORIZON_REAL_HOURS * MS_PER_HOUR;
  const gapMs = NOTIFICATION_MIN_GAP_MINUTES * MS_PER_MINUTE;

  const timed: Candidate[] = [];
  for (const c of collectCandidates(input)) {
    const atMs = moveOutOfQuietTime(Math.max(c.atMs, earliestMs), earliestMs, c.latestMs);
    if (atMs === null || atMs > horizonMs) continue;
    if (c.latestMs !== undefined && atMs > c.latestMs) continue;
    timed.push({ ...c, atMs });
  }

  // Wichtigste zuerst annehmen, bis Tageslimit oder Mindestabstand greifen.
  timed.sort((a, b) => NOTIFICATION_PRIORITY[a.kind] - NOTIFICATION_PRIORITY[b.kind] || a.atMs - b.atMs);
  const taken: number[] = [...sentMs];
  const result: PlannedNotification[] = [];
  for (const c of timed) {
    const day = localDayKey(c.atMs);
    const sameDay = taken.filter((ms) => localDayKey(ms) === day).length;
    if (sameDay >= NOTIFICATIONS_MAX_PER_DAY) continue;
    if (taken.some((ms) => Math.abs(ms - c.atMs) < gapMs)) continue;
    taken.push(c.atMs);
    result.push(c.phase ? { kind: c.kind, atMs: c.atMs, phase: c.phase } : { kind: c.kind, atMs: c.atMs });
  }
  return result.sort((a, b) => a.atMs - b.atMs);
}
