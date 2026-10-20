import { useEffect, useState } from 'react';

const REFRESH_MS = 1000;

/** Aktuelle Uhrzeit, jede Sekunde neu. Nur zum Neuzeichnen; der Zustand kommt aus Zeitstempeln. */
export function useNow(): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), REFRESH_MS);
    return () => clearInterval(id);
  }, []);
  return now;
}
