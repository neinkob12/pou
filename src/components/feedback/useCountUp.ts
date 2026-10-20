import { useEffect, useState } from 'react';

import { COUNT_UP_MS, countUpValue } from './celebration';

/**
 * Zählt eine Zahl nach `delayMs` von 0 auf `target` hoch (WEB-3). `onDone` kommt einmal am Ende.
 * Läuft über requestAnimationFrame und nur für die Darstellung, nie für Spielzeit.
 */
export function useCountUp(target: number, delayMs = 0, onDone?: () => void, durationMs = COUNT_UP_MS): number {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let frame = 0;
    let start: number | null = null;
    let finished = false;
    const tick = (time: number) => {
      start ??= time;
      const next = countUpValue(target, time - start - delayMs, durationMs);
      setValue(next);
      if (time - start - delayMs >= durationMs) {
        if (!finished) onDone?.();
        finished = true;
        return;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
    // onDone bewusst nicht in den Abhängigkeiten: ein neuer Callback soll nicht neu zählen.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, delayMs, durationMs]);

  return value;
}
