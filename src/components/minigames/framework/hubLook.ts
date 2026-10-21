// Spiele-Auswahl im Redesign (ohne React, damit testbar): Farbe je Spiel und welches Spiel oben
// groß steht. Nur Darstellung, keine Spielwerte.

import { goalTemplate, type DailyGoalState } from '../../../game/dailyGoals';
import { tones, type Tone } from '../../../lib/theme';
import type { MinigameId, MinigameInfo } from './catalog';

/** Kachelfarbe je Spiel: Tropfen blau wie Wasser, Hüpfen gold wie Licht. */
export const GAME_TONES: Record<MinigameId, Tone> = {
  tap: tones.coral,
  smash: tones.leaf,
  drops: tones.sky,
  jump: tones.gold,
  quiz: tones.grape,
};

/** Ohne passendes Tagesziel steht dieses Spiel oben. */
export const DEFAULT_FEATURED: MinigameId = 'jump';

/**
 * Das Spiel, das oben groß steht: das Spiel des heutigen Tagesziels, solange es offen ist, sonst
 * DEFAULT_FEATURED. Gibt auch zurück, ob das Tagesziel der Grund ist (für das Abzeichen).
 */
export function featuredGame(
  catalog: readonly MinigameInfo[],
  goal: DailyGoalState | null,
): { game: MinigameInfo; forGoal: boolean } {
  const template = goal && !goal.claimed ? goalTemplate(goal.goalId) : null;
  const goalGame = template?.kind === 'minigameScore' ? catalog.find((g) => g.id === template.gameId) : undefined;
  if (goalGame) return { game: goalGame, forGoal: true };
  const fallback = catalog.find((g) => g.id === DEFAULT_FEATURED) ?? catalog[0];
  return { game: fallback, forGoal: false };
}
