import { DAILY_GOAL_CHEST_COINS, DAILY_GOAL_TEMPLATES } from '../../game/config';
import { dayNumber } from '../../game/dailyGoals';
import { gameEvents } from '../../game/events';
import { storage } from '../../lib/storage';
import { useGameStore } from '../gameStore';

const initial = useGameStore.getState();
const at = (day: number, hour: number) => new Date(2026, 9, day, hour).getTime();

describe('Tagesziele-Slice', () => {
  beforeEach(() => {
    storage.clearAll();
    useGameStore.setState(initial, true);
  });

  it('legt das Ziel des Tages an und wechselt es am nächsten Tag', () => {
    useGameStore.getState().refreshDailyGoal(at(20, 10));
    const today = useGameStore.getState().dailyGoal;
    expect(today?.day).toBe(dayNumber(at(20, 10)));
    useGameStore.getState().refreshDailyGoal(at(20, 20));
    expect(useGameStore.getState().dailyGoal).toBe(today);
    useGameStore.getState().refreshDailyGoal(at(21, 8));
    expect(useGameStore.getState().dailyGoal?.day).toBe(dayNumber(at(21, 8)));
  });

  it('zählt careAction und minigameFinished und zahlt die Kiste einmal aus', () => {
    useGameStore.setState({ dailyGoal: { day: dayNumber(at(20, 9)), goalId: 'waterTwice', progress: 0, claimed: false } });
    gameEvents.emit('careAction', { action: 'water', atMs: at(20, 10) });
    gameEvents.emit('minigameFinished', { gameId: 'tap', score: 10, coins: 5, atMs: at(20, 11) });
    expect(useGameStore.getState().dailyGoal?.progress).toBe(1);
    gameEvents.emit('careAction', { action: 'water', atMs: at(20, 12) });
    expect(useGameStore.getState().dailyGoal?.progress).toBe(DAILY_GOAL_TEMPLATES.waterTwice.target);

    const s = useGameStore.getState();
    const before = s.coins;
    expect(s.claimDailyGoalChest(at(20, 13), s.addCoins)).toBe(DAILY_GOAL_CHEST_COINS);
    expect(useGameStore.getState().coins).toBe(before + DAILY_GOAL_CHEST_COINS);
    expect(s.claimDailyGoalChest(at(20, 14), s.addCoins)).toBe(0);
    expect(useGameStore.getState().coins).toBe(before + DAILY_GOAL_CHEST_COINS);
  });

  it('eine Kiste von gestern lässt sich heute nicht mehr öffnen', () => {
    useGameStore.setState({ dailyGoal: { day: dayNumber(at(19, 9)), goalId: 'waterTwice', progress: 2, claimed: false } });
    const s = useGameStore.getState();
    expect(s.claimDailyGoalChest(at(20, 9), s.addCoins)).toBe(0);
    expect(useGameStore.getState().dailyGoal?.day).toBe(dayNumber(at(20, 9)));
  });
});
