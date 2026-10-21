// Warnstufe eines Bedürfnisbalkens für die Anzeige (ART-4). Schwellen aus config.ts, ohne React.

import { NEED_THRESHOLDS } from '../../../game/config';

export type NeedLevel = 'ok' | 'low' | 'critical';

/** `value` von 0 bis 100. */
export function needLevel(value: number): NeedLevel {
  if (value <= NEED_THRESHOLDS.critical) return 'critical';
  if (value < NEED_THRESHOLDS.low) return 'low';
  return 'ok';
}
