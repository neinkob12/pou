import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { clock } from '../../../lib/clock';

/** Normal liest der Raum jede Minute die Uhr neu. Gezählt wird nichts, nur neu berechnet. */
const REFRESH_MS = 60 * 1000;
/** Im Zeitraffer (Debug-Menü) öfter, damit Tag/Nacht und Phasen sichtbar wechseln. */
const FAST_REFRESH_MS = 1000;

/** Aktuelle Zeit in ms. Neu gelesen im Takt und sofort, wenn die App in den Vordergrund kommt. */
export function usePlantClock(debugMultiplier: number): number {
  const [now, setNow] = useState(() => clock.now());
  useEffect(() => {
    const id = setInterval(() => setNow(clock.now()), debugMultiplier > 1 ? FAST_REFRESH_MS : REFRESH_MS);
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') setNow(clock.now());
    });
    return () => {
      clearInterval(id);
      sub.remove();
    };
  }, [debugMultiplier]);
  return now;
}
