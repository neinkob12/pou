// Lokale Benachrichtigungen über expo-notifications (Auftrag P18). Kein Push, kein Server.
// Wann Budi sich meldet, berechnet src/game/notifications.ts; hier passieren Berechtigung,
// Texte und das Planen beim Betriebssystem. Einstellungen liegen in MMKV.

import * as Notifications from 'expo-notifications';
import { AndroidImportance, IosAuthorizationStatus } from 'expo-notifications';
import { Platform } from 'react-native';

import { PHASE_LABELS } from '../game/config';
import type { NeedsState } from '../game/needs';
import { planNotifications, type PlannedNotification } from '../game/notifications';
import type { PlantRecord } from '../game/timeEngine';
import { notifications as texts } from '../content/strings';
import { safeSet, storage } from './storage';

export const NOTIFICATION_KEYS = {
  enabled: 'notifications.enabled',
  permissionAsked: 'notifications.permissionAsked',
  sentLog: 'notifications.sentLog',
} as const;

const CHANNEL_ID = 'budi';
const MS_PER_HOUR = 60 * 60 * 1000;
/** Zugestellte Benachrichtigungen älter als das braucht das Tageslimit nicht mehr. */
const SENT_LOG_KEEP_MS = 48 * MS_PER_HOUR;

/** Standard: an. Der Spieler kann es in den Einstellungen abschalten. */
export function notificationsEnabled(): boolean {
  return storage.getBoolean(NOTIFICATION_KEYS.enabled) ?? true;
}

/** Titel und Text in Budis Stimme. Die Variante hängt an der Stunde, damit es nicht immer gleich klingt. */
export function notificationContent(n: PlannedNotification): { title: string; body: string } {
  if (n.kind === 'phaseChanged') return texts.phaseChanged(PHASE_LABELS[n.phase ?? 'seedling']);
  const variants = texts[n.kind];
  return variants[Math.floor(n.atMs / MS_PER_HOUR) % variants.length];
}

/** Behält nur zugestellte Einträge (Zeitpunkt vorbei) der letzten zwei Tage. */
export function deliveredOnly(log: readonly number[], nowMs: number): number[] {
  return log.filter((ms) => ms <= nowMs && ms > nowMs - SENT_LOG_KEEP_MS);
}

function readSentLog(): number[] {
  try {
    const parsed: unknown = JSON.parse(storage.getString(NOTIFICATION_KEYS.sentLog) ?? '[]');
    return Array.isArray(parsed) ? parsed.filter((v): v is number => typeof v === 'number') : [];
  } catch {
    return [];
  }
}

function writeSentLog(log: number[]): void {
  safeSet(NOTIFICATION_KEYS.sentLog, JSON.stringify(log));
}

/** Einmal beim Start: Verhalten im Vordergrund und Android-Kanal. */
export async function configureNotifications(): Promise<void> {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: texts.channelName,
      importance: AndroidImportance.DEFAULT,
    });
  }
}

export async function hasPermission(): Promise<boolean> {
  const status = await Notifications.getPermissionsAsync();
  return status.granted || status.ios?.status === IosAuthorizationStatus.PROVISIONAL;
}

/** Ob das System schon einmal gefragt wurde (nach der ersten Pflege). */
export function permissionAsked(): boolean {
  return storage.getBoolean(NOTIFICATION_KEYS.permissionAsked) ?? false;
}

/** Fragt das System nach der Erlaubnis. Nur einmal automatisch, danach über die Einstellungen. */
export async function requestPermission(): Promise<boolean> {
  safeSet(NOTIFICATION_KEYS.permissionAsked, true);
  if (await hasPermission()) return true;
  const status = await Notifications.requestPermissionsAsync();
  return status.granted;
}

/** App kommt in den Vordergrund oder Benachrichtigungen sind aus: alles Geplante weg. */
export async function cancelPendingNotifications(nowMs: number): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
  writeSentLog(deliveredOnly(readSentLog(), nowMs));
}

/** App geht in den Hintergrund: Plan neu berechnen und beim System eintragen. */
export async function rescheduleNotifications(
  plant: PlantRecord | null,
  needs: NeedsState,
  nowMs: number,
  debugMultiplier?: number,
): Promise<void> {
  await cancelPendingNotifications(nowMs);
  if (!notificationsEnabled() || !(await hasPermission())) return;

  const delivered = readSentLog();
  const plan = planNotifications({ nowMs, plant, needs, sentMs: delivered, debugMultiplier });
  for (const n of plan) {
    await Notifications.scheduleNotificationAsync({
      content: notificationContent(n),
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: n.atMs, channelId: CHANNEL_ID },
    });
  }
  writeSentLog([...delivered, ...plan.map((n) => n.atMs)]);
}
