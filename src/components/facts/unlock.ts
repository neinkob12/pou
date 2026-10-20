// Freischaltung der Fakten-Karten (P17), reine Logik ohne React.
// KONZEPT.md: Pro Phase schaltet Budi zwei bis drei Karten frei. Beim Wechsel in eine Phase werden
// alle Karten dieser Phase und aller früheren Phasen freigeschaltet. So holt ein Spieler, der
// mehrere Phasen im Hintergrund übersprungen hat, die verpassten Karten nach.

import type { PhaseId } from '../../game/config';
import { FACT_CARDS, type FactCard } from '../../content/facts';

/** Reihenfolge der Phasen im Zyklus. Record, damit eine neue PhaseId hier auffällt. */
const PHASE_RANK: Record<PhaseId, number> = {
  germination: 0,
  seedling: 1,
  vegetative: 2,
  flowering: 3,
  ready: 4,
  drying: 5,
  done: 6,
};

/** Alle Karten, die bis einschließlich dieser Phase freigeschaltet sein sollen. */
export function cardsReachedBy(phase: PhaseId, cards: readonly FactCard[] = FACT_CARDS): FactCard[] {
  return cards.filter((card) => PHASE_RANK[card.phase] <= PHASE_RANK[phase]);
}

/** IDs der Karten, die beim Erreichen dieser Phase neu dazukommen, in Album-Reihenfolge. */
export function newlyUnlockedIds(
  unlockedIds: readonly string[],
  phase: PhaseId,
  cards: readonly FactCard[] = FACT_CARDS,
): string[] {
  const known = new Set(unlockedIds);
  return cardsReachedBy(phase, cards)
    .map((card) => card.id)
    .filter((id) => !known.has(id));
}
