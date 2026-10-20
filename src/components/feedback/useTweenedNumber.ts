import { useEffect, useRef, useState } from 'react';

import { COIN_TWEEN_MS, tweenValue } from './celebration';

/**
 * Zeigt eine Zahl, die bei Änderungen sanft zum neuen Wert läuft (WEB-3), etwa den Münzstand.
 * Gibt den angezeigten Wert und einen Zähler zurück, der bei jeder Änderung steigt (für ein Hüpfen).
 */
export function useTweenedNumber(value: number, durationMs = COIN_TWEEN_MS): { shown: number; changes: number } {
  const [shown, setShown] = useState(value);
  const [changes, setChanges] = useState(0);
  const shownRef = useRef(value);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const from = shownRef.current;
    if (from === value) return;
    setChanges((c) => c + 1);
    let frame = 0;
    let start: number | null = null;
    const tick = (time: number) => {
      start ??= time;
      const next = tweenValue(from, value, time - start, durationMs);
      shownRef.current = next;
      setShown(next);
      if (time - start < durationMs) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, durationMs]);

  return { shown, changes };
}
