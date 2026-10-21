// Welche Teilchen nach einer Pflege aufsteigen. Ohne React, damit testbar.

import type { CareActionId } from '../../../game/events';
import type { CareFeedback } from '../../room/care/careLogic';

export type FxKind = 'hearts' | 'drops' | 'sparkles' | 'grumble';

/** Erfolg: Herzen (Streicheln), Tropfen (Gießen), Funkeln (Düngen). Zu viel des Guten: Grummel-Wolke. */
export function fxKindFor(reaction: { type: CareActionId; feedback: CareFeedback } | null): FxKind | null {
  if (!reaction || reaction.feedback === 'error') return null;
  if (reaction.feedback === 'warning') return 'grumble';
  if (reaction.type === 'pet') return 'hearts';
  if (reaction.type === 'water') return 'drops';
  return 'sparkles';
}
