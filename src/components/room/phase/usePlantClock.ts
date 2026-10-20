import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

/** Normal liest der Raum jede Minute die Uhr neu. Gezählt wird nichts, nur neu berechnet. */
const REFRESH_MS = 60 * 1000;
/** Im Zeitraffer (Debug-Menü) öfter, damit Tag/Nacht und Phasen sichtbar wechseln. */
const FAST_REFRESH_MS = 1000;

/** Aktuelle Zeit in ms. Neu gelesen im Takt und sofort, wenn die App in den Vordergrund kommt. */
export function usePlantClock(debugMultiplier: number): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), debugMultiplier > 1 ? FAST_REFRESH_MS : REFRESH_MS);
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') setNow(Date.now());
    });
    return () => {
      clearInterval(id);
      sub.remove();
    };
  }, [debugMultiplier]);
  return now;
}
