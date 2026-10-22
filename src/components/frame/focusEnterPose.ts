// Pose beim Auftritt (FocusEnter), ohne React, damit testbar. Nur Darstellung.

export type EnterFrom = 'top' | 'bottom' | 'center';

export interface EnterPose {
  opacity: number;
  translateY: number;
  scale: number;
}

/**
 * Pose bei Fortschritt `t` (0 = Start, 1 = Ziel, Federn schießen kurz über 1 hinaus).
 * Deckkraft ist schon nach dem ersten Drittel voll, damit nichts lange durchsichtig hängt.
 */
export function focusEnterPose(from: EnterFrom, t: number, offset: number): EnterPose {
  'worklet';
  const opacity = Math.min(1, Math.max(0, t * 3));
  const rest = 1 - t;
  if (from === 'center') return { opacity, translateY: 0, scale: 1 - rest * 0.12 };
  const dir = from === 'top' ? -1 : 1;
  return { opacity, translateY: dir * offset * rest, scale: 1 };
}
