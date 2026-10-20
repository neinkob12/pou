// Alle Minigames für den Auswahl-Screen. Neue Spiele: Eintrag hier, Route unter app/minigames/.

import type { Href } from 'expo-router';

import { minigameCards, minigames, tapGame } from '../../../content/strings';
import type { ColorName } from '../../../lib/theme';

export type MinigameId = 'tap' | 'smash' | 'drops' | 'jump' | 'quiz';

export interface MinigameInfo {
  id: MinigameId;
  href: Href;
  title: string;
  description: string;
  /** Farbe der Karte (Platzhalter, bis es Kartenbilder gibt). */
  color: ColorName;
}

export const MINIGAME_CATALOG: readonly MinigameInfo[] = [
  { id: 'tap', href: '/minigames/tap', title: tapGame.title, description: minigameCards.tap, color: 'coral' },
  { id: 'smash', href: '/minigames/smash', title: minigames.smash, description: minigameCards.smash, color: 'plantLight' },
  { id: 'drops', href: '/minigames/drops', title: minigames.drops, description: minigameCards.drops, color: 'lavender' },
  { id: 'jump', href: '/minigames/jump', title: minigames.jump, description: minigameCards.jump, color: 'lamp' },
  { id: 'quiz', href: '/minigames/quiz', title: minigames.quiz, description: minigameCards.quiz, color: 'terracotta' },
];
