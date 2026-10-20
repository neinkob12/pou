import { DAILY_GOAL_CHEST_COINS, DAILY_GOAL_POOL, DAILY_GOAL_TEMPLATES } from '../config';
import {
  applyGoalEvent,
  canClaimChest,
  claimChest,
  createDailyGoal,
  dayNumber,
  ensureDailyGoal,
  goalIdForDay,
  isGoalComplete,
  progressFor,
  type DailyGoalEvent,
  type DailyGoalState,
} from '../dailyGoals';

// Ortszeit, damit die Tests in jeder Zeitzone gleich laufen.
const at = (day: number, hour: number, minute = 0) => new Date(2026, 9, day, hour, minute).getTime();

const game = (gameId: string, score: number, atMs: number): DailyGoalEvent => ({
  type: 'minigameFinished',
  gameId,
  score,
  coins: 0,
  atMs,
});
const care = (action: 'water' | 'pet' | 'fertilizeGrow', atMs: number): DailyGoalEvent => ({
  type: 'careAction',
  action,
  atMs,
});

/** Ein Ziel mit fester ID für den Tag von `ms`. */
const goal = (goalId: DailyGoalState['goalId'], ms: number, progress = 0): DailyGoalState => ({
  day: dayNumber(ms),
  goalId,
  progress,
  claimed: false,
});

describe('Kalendertag', () => {
  it('wechselt um Mitternacht Ortszeit, nicht vorher', () => {
    expect(dayNumber(at(20, 0, 0))).toBe(dayNumber(at(20, 23, 59)));
    expect(dayNumber(at(21, 0, 0))).toBe(dayNumber(at(20, 23, 59)) + 1);
  });

  it('zählt über die Zeitumstellung hinweg genau einen Tag weiter', () => {
    // 25. Oktober 2026: Ende der Sommerzeit in Europa.
    expect(dayNumber(at(26, 12))).toBe(dayNumber(at(25, 12)) + 1);
    expect(dayNumber(at(25, 12))).toBe(dayNumber(at(24, 12)) + 1);
  });
});

describe('Ziel pro Tag', () => {
  it('nimmt nur Ziele aus dem Pool und wiederholt keins am Folgetag', () => {
    const start = dayNumber(at(1, 12));
    for (let d = start; d < start + 30; d++) {
      expect(DAILY_GOAL_POOL).toContain(goalIdForDay(d));
      expect(goalIdForDay(d + 1)).not.toBe(goalIdForDay(d));
    }
  });

  it('ist für denselben Tag immer dasselbe', () => {
    expect(createDailyGoal(at(20, 9)).goalId).toBe(createDailyGoal(at(20, 22)).goalId);
  });

  it('jedes Ziel im Pool hat eine Vorlage mit positivem Ziel', () => {
    for (const id of DAILY_GOAL_POOL) expect(DAILY_GOAL_TEMPLATES[id].target).toBeGreaterThan(0);
  });
});

describe('Tageswechsel aus Zeitstempel', () => {
  it('legt ohne Stand ein frisches Ziel an', () => {
    expect(ensureDailyGoal(null, at(20, 10))).toEqual(createDailyGoal(at(20, 10)));
  });

  it('behält das Ziel am selben Tag', () => {
    const state = goal('waterTwice', at(20, 8), 1);
    expect(ensureDailyGoal(state, at(20, 23))).toBe(state);
  });

  it('gibt nach Tagen Abwesenheit sofort das Ziel von heute, Fortschritt verfällt', () => {
    const state = { ...goal('waterTwice', at(17, 8), 2), claimed: true };
    expect(ensureDailyGoal(state, at(20, 10))).toEqual(createDailyGoal(at(20, 10)));
  });

  it('gibt bei zurückgestellter Uhr kein neues Ziel', () => {
    const state = goal('waterTwice', at(20, 8), 1);
    expect(ensureDailyGoal(state, at(19, 10))).toBe(state);
  });

  it('ersetzt ein unbekanntes Ziel aus einem alten Spielstand', () => {
    const broken = { ...goal('waterTwice', at(20, 8)), goalId: 'gibtsNicht' } as unknown as DailyGoalState;
    expect(ensureDailyGoal(broken, at(20, 9))).toEqual(createDailyGoal(at(20, 9)));
  });
});

describe('Fortschritt aus Ereignissen', () => {
  it('Punkte zählen nur im richtigen Spiel', () => {
    const t = DAILY_GOAL_TEMPLATES.smashMites;
    expect(progressFor(t, game('smash', 12, 0))).toBe(12);
    expect(progressFor(t, game('tap', 12, 0))).toBe(0);
    expect(progressFor(t, care('water', 0))).toBe(0);
  });

  it('Runden zählen in jedem Spiel', () => {
    expect(progressFor(DAILY_GOAL_TEMPLATES.playRounds, game('tap', 0, 0))).toBe(1);
    expect(progressFor(DAILY_GOAL_TEMPLATES.playRounds, care('water', 0))).toBe(0);
  });

  it('Pflege zählt nur passende Aktionen, Dünger in jeder Form', () => {
    expect(progressFor(DAILY_GOAL_TEMPLATES.waterTwice, care('water', 0))).toBe(1);
    expect(progressFor(DAILY_GOAL_TEMPLATES.waterTwice, care('pet', 0))).toBe(0);
    expect(progressFor(DAILY_GOAL_TEMPLATES.feedBudi, care('fertilizeGrow', 0))).toBe(1);
  });

  it('summiert bis zum Ziel und deckelt dort', () => {
    let state: DailyGoalState = goal('smashMites', at(20, 9));
    state = applyGoalEvent(state, game('smash', 30, at(20, 10)));
    expect(state.progress).toBe(30);
    expect(isGoalComplete(state)).toBe(false);
    state = applyGoalEvent(state, game('smash', 30, at(20, 11)));
    expect(state.progress).toBe(DAILY_GOAL_TEMPLATES.smashMites.target);
    expect(isGoalComplete(state)).toBe(true);
  });

  it('ein Ereignis am nächsten Tag zählt für das neue Ziel', () => {
    const state = goal('waterTwice', at(20, 9), 1);
    const next = applyGoalEvent(state, care('water', at(21, 9)));
    expect(next.day).toBe(dayNumber(at(21, 9)));
    expect(next.goalId).toBe(goalIdForDay(next.day));
  });

  it('ein Ereignis von gestern zählt nicht für heute', () => {
    const state = goal('waterTwice', at(20, 9));
    expect(applyGoalEvent(state, care('water', at(19, 23)))).toBe(state);
  });
});

describe('Belohnungskiste', () => {
  it('bleibt zu, solange das Ziel offen ist', () => {
    const state = goal('waterTwice', at(20, 9), 1);
    expect(canClaimChest(state)).toBe(false);
    expect(claimChest(state)).toEqual({ state, coins: 0 });
  });

  it('gibt Münzen genau einmal', () => {
    const state = goal('waterTwice', at(20, 9), 2);
    const first = claimChest(state);
    expect(first.coins).toBe(DAILY_GOAL_CHEST_COINS);
    expect(first.state.claimed).toBe(true);
    expect(claimChest(first.state).coins).toBe(0);
  });

  it('weiterer Fortschritt nach dem Öffnen ändert nichts', () => {
    const opened = claimChest(goal('waterTwice', at(20, 9), 2)).state;
    expect(applyGoalEvent(opened, care('water', at(20, 12)))).toBe(opened);
  });
});
