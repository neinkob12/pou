// Reine Textlogik für PhaseHeader (ohne React, damit testbar).

import { PHASE_LABELS } from '../../game/config';
import type { PlantStatus } from '../../game/timeEngine';
import { room } from '../../content/strings';

const MS_PER_HOUR = 60 * 60 * 1000;

export interface PhaseText {
  phaseLabel: string;
  remaining: string;
  progress: number;
}

/** Restzeit als "noch X Std.", aufgerundet auf volle Stunden. null = offenes Ende. */
export function formatRemaining(status: PlantStatus): string {
  if (status.realMsUntilPhaseEnd === null) {
    return status.phase === 'ready' ? room.readyToHarvest : room.openEnd;
  }
  if (status.realMsUntilPhaseEnd < MS_PER_HOUR) return room.remainingLessThanHour;
  return room.remainingHours(Math.ceil(status.realMsUntilPhaseEnd / MS_PER_HOUR));
}

export function phaseText(status: PlantStatus | null): PhaseText {
  if (!status) return { phaseLabel: room.noPlant, remaining: '', progress: 0 };
  return {
    phaseLabel: PHASE_LABELS[status.phase],
    remaining: formatRemaining(status),
    progress: status.phaseProgress,
  };
}
