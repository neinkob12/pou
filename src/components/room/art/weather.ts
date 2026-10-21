// Wetter vor Budis Fenster (ART-4): reine Deko, wechselt einmal am Tag, keine Spielwirkung.
// Ohne React, damit testbar.

export type RoomWeather = 'clear' | 'cloudy' | 'rain';

const DAY_MS = 24 * 60 * 60 * 1000;
/** Eine Woche Wetter, meist schön. Die Reihenfolge wird je Tag durchgemischt (siehe weatherForDay). */
const WEEK: readonly RoomWeather[] = ['clear', 'cloudy', 'clear', 'rain', 'clear', 'cloudy', 'clear'];

/** Kalendertag in Ortszeit, damit das Wetter um Mitternacht wechselt und nicht mitten am Tag. */
export function localDayIndex(ms: number, timezoneOffsetMin: number): number {
  return Math.floor((ms - timezoneOffsetMin * 60 * 1000) / DAY_MS);
}

/** Wetter für den Tag von `ms`. Gleicher Tag, gleiches Wetter, auch nach Neustart. */
export function weatherForDay(ms: number, timezoneOffsetMin: number = new Date(ms).getTimezoneOffset()): RoomWeather {
  const day = localDayIndex(ms, timezoneOffsetMin);
  // 3 ist teilerfremd zu 7: aufeinanderfolgende Tage springen durch die Woche statt sie abzulaufen.
  const i = (((day * 3) % WEEK.length) + WEEK.length) % WEEK.length;
  return WEEK[i];
}
