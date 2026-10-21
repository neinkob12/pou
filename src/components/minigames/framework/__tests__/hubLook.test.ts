import { MINIGAME_CATALOG } from '../catalog';
import { DEFAULT_FEATURED, featuredGame, GAME_TONES } from '../hubLook';

describe('featuredGame', () => {
  it('stellt das Spiel des offenen Tagesziels nach oben', () => {
    const { game, forGoal } = featuredGame(MINIGAME_CATALOG, { day: 1, goalId: 'smashMites', progress: 3, claimed: false });
    expect(game.id).toBe('smash');
    expect(forGoal).toBe(true);
  });

  it('nimmt sonst das Standard-Spiel: ohne Ziel, bei Pflegezielen und nach dem Öffnen der Kiste', () => {
    expect(featuredGame(MINIGAME_CATALOG, null).game.id).toBe(DEFAULT_FEATURED);
    expect(featuredGame(MINIGAME_CATALOG, { day: 1, goalId: 'petBudi', progress: 0, claimed: false }).forGoal).toBe(false);
    expect(featuredGame(MINIGAME_CATALOG, { day: 1, goalId: 'playRounds', progress: 0, claimed: false }).game.id).toBe(DEFAULT_FEATURED);
    expect(featuredGame(MINIGAME_CATALOG, { day: 1, goalId: 'tapHits', progress: 40, claimed: true }).forGoal).toBe(false);
  });

  it('jedes Spiel hat eine Kachelfarbe', () => {
    for (const game of MINIGAME_CATALOG) expect(GAME_TONES[game.id]).toBeDefined();
  });
});
