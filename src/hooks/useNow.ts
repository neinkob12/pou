import { useEffect, useState } from 'react';
import { clock } from '../lib/clock';

/** Wie oft der Raum die Uhrzeit neu liest. Gezählt wird nichts, nur neu berechnet. */
export const ROOM_REFRESH_MS = 60 * 1000;

/** Für Ansichten, die im Zeitraffer flüssig laufen müssen (Ernte, Debug-Menü). */
export const FAST_REFRESH_MS = 1000;

/** Aktuelle Spielzeit in ms, aktualisiert alle `refreshMs`, damit Anzeigen aus Zeitstempeln neu rechnen. */
export function useNow(refreshMs: number = ROOM_REFRESH_MS): number {
  const [now, setNow] = useState(() => clock.now());
  useEffect(() => {
    const id = setInterval(() => setNow(clock.now()), refreshMs);
    return () => clearInterval(id);
  }, [refreshMs]);
  return now;
}
