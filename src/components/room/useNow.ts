import { useEffect, useState } from 'react';

/** Wie oft der Raum die Uhrzeit neu liest. Gezählt wird nichts, nur neu berechnet. */
const REFRESH_MS = 60 * 1000;

/** Aktuelle Zeit in ms, aktualisiert jede Minute, damit Anzeigen aus Zeitstempeln neu rechnen. */
export function useNow(): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), REFRESH_MS);
    return () => clearInterval(id);
  }, []);
  return now;
}
