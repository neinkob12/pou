// Progression-Slice: Erfahrung, Erntezähler, Samen-Fragmente, Ereignis-Freischaltungen.
// Logik in src/game/progression.ts. Freigeschaltete Sorten werden daraus berechnet, nie gespeichert.
// Flache Felder, damit spätere Ergänzungen ohne Migration auskommen (siehe docs/progress/p02.md).

import { gameEvents } from '../../game/events';
import type { StrainId } from '../../game/config';
import { applyHarvest, unlockByEvent, type ProgressStats } from '../../game/progression';
import type { SliceCreator } from './types';

export interface ProgressionSlice {
  xp: number;
  /** Ernten für die Freischaltung. Eigener Zähler, weil Slices sich nicht gegenseitig lesen. */
  progressHarvests: number;
  seedFragments: number;
  eventUnlocks: StrainId[];
  /** Zählt eine Ernte. Läuft automatisch beim Ereignis `harvested`, nicht zusätzlich aufrufen. */
  addHarvestProgress: (stars: number) => void;
  /** Ereignis (z. B. Karneval) schaltet eine Sorte frei. */
  unlockStrainByEvent: (strainId: StrainId) => void;
}

type ProgressFields = Pick<ProgressionSlice, 'xp' | 'progressHarvests' | 'seedFragments' | 'eventUnlocks'>;

/** Liest die Zähler aus dem Store für die Funktionen in src/game/progression.ts. */
export function toProgressStats(s: ProgressFields): ProgressStats {
  return { xp: s.xp, harvests: s.progressHarvests, seedFragments: s.seedFragments, eventUnlocks: s.eventUnlocks };
}

function fromProgressStats(p: ProgressStats): ProgressFields {
  return { xp: p.xp, progressHarvests: p.harvests, seedFragments: p.seedFragments, eventUnlocks: [...p.eventUnlocks] };
}

export const createProgressionSlice: SliceCreator<ProgressionSlice> = (set, get) => {
  // Die Ernte-UI (P24) meldet nur das Ereignis; Level und Freischaltung zählen hier mit.
  gameEvents.on('harvested', ({ stars }) => get().addHarvestProgress(stars));

  return {
    xp: 0,
    progressHarvests: 0,
    seedFragments: 0,
    eventUnlocks: [],
    addHarvestProgress: (stars) => set(fromProgressStats(applyHarvest(toProgressStats(get()), stars))),
    unlockStrainByEvent: (strainId) => {
      const before = toProgressStats(get());
      const after = unlockByEvent(before, strainId);
      if (after !== before) set(fromProgressStats(after));
    },
  };
};
