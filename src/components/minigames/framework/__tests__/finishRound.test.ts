import { MINIGAME_REWARDS } from '../../../../game/config';
import { gameEvents, type GameEvents } from '../../../../game/events';
import { useGameStore } from '../../../../store/gameStore';
import { finishRound } from '../finishRound';

const initial = useGameStore.getState();

beforeEach(() => {
  useGameStore.setState(initial, true);
  gameEvents.clear();
});

describe('finishRound', () => {
  it('schreibt Münzen gut, trägt Rekord ein und meldet minigameFinished', () => {
    const events: GameEvents['minigameFinished'][] = [];
    gameEvents.on('minigameFinished', (e) => events.push(e));

    const r = finishRound('tap', 20, 1234);
    const coins = Math.floor(20 * MINIGAME_REWARDS.coinsPerPoint);
    expect(r).toEqual({ gameId: 'tap', score: 20, coins, highscore: 20, isNewHighscore: true });

    const s = useGameStore.getState();
    expect(s.coins).toBe(coins);
    expect(s.minigameHighscores).toEqual({ tap: 20 });
    expect(s.minigameRounds).toEqual({ tap: 1 });
    expect(events).toEqual([{ gameId: 'tap', score: 20, coins, atMs: 1234 }]);
  });

  it('schwächere Runde: Münzen ja, Rekord bleibt', () => {
    finishRound('tap', 20);
    const r = finishRound('tap', 4);
    expect(r.isNewHighscore).toBe(false);
    expect(r.highscore).toBe(20);
    expect(useGameStore.getState().minigameRounds.tap).toBe(2);
  });

  it('Rekorde je Spiel getrennt, 0 Punkte geben 0 Münzen', () => {
    finishRound('tap', 20);
    const r = finishRound('smash', 0);
    expect(r.coins).toBe(0);
    expect(useGameStore.getState().minigameHighscores).toEqual({ tap: 20 });
  });
});
