import { useEffect, useState } from 'react';
import { clock } from '../../lib/clock';

const REFRESH_MS = 1000;

/** Aktuelle Uhrzeit, jede Sekunde neu. Nur zum Neuzeichnen; der Zustand kommt aus Zeitstempeln. */
export function useNow(): number {
  const [now, setNow] = useState(() => clock.now());
  useEffect(() => {
    const id = setInterval(() => setNow(clock.now()), REFRESH_MS);
    return () => clearInterval(id);
  }, []);
  return now;
}
