import { localDayIndex, weatherForDay } from '../weather';

const DAY = 24 * 60 * 60 * 1000;
const NOON = Date.UTC(2026, 9, 21, 12);

describe('weatherForDay', () => {
  it('bleibt den ganzen Tag gleich', () => {
    const morning = Date.UTC(2026, 9, 21, 0, 30);
    const evening = Date.UTC(2026, 9, 21, 23, 30);
    expect(weatherForDay(morning, 0)).toBe(weatherForDay(evening, 0));
  });

  it('zeigt in einer Woche jedes Wetter, meist schön', () => {
    const week = Array.from({ length: 7 }, (_, i) => weatherForDay(NOON + i * DAY, 0));
    expect(new Set(week)).toEqual(new Set(['clear', 'cloudy', 'rain']));
    expect(week.filter((w) => w === 'clear').length).toBeGreaterThanOrEqual(3);
  });

  it('wechselt um Mitternacht Ortszeit', () => {
    // UTC+2 (Offset -120): 23:30 UTC ist schon der nächste Tag.
    const lateUtc = Date.UTC(2026, 9, 21, 23, 30);
    expect(localDayIndex(lateUtc, -120)).toBe(localDayIndex(lateUtc, 0) + 1);
  });

  it('funktioniert auch vor 1970', () => {
    expect(['clear', 'cloudy', 'rain']).toContain(weatherForDay(-5 * DAY, 0));
  });
});
