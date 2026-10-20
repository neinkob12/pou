// P32 Balancing-Simulation: drei Spielertypen über 30 echte Tage, mit der echten Spiellogik.
// Läuft NICHT in der normalen Testsuite (kein *.test.ts, nicht in __tests__). Aufruf:
//
//   npx jest --testMatch '**/scripts/simulate.ts' --testPathIgnorePatterns /node_modules/
//
// Alle Regeln kommen aus src/game/ und den reinen Logik-Dateien der Komponenten (Ernte-Ablauf,
// Tropfen-Belohnung, Lichtplan, Laune-Bonus). Nichts wird nachgebaut, außer dem Verhalten der
// Spieler (wann sie die App öffnen und was sie tun). Werte kommen aus src/game/config.ts.
// Vorschläge rechnet das Skript als Variante, indem es config.ts nur im Speicher überschreibt
// (jest.doMock). Die Datei selbst bleibt unverändert.

/* eslint-disable @typescript-eslint/no-require-imports -- Module werden je Variante frisch geladen (jest.isolateModules). */

type Config = typeof import('../src/game/config');

interface Mods {
  config: Config;
  time: typeof import('../src/game/timeEngine');
  needs: typeof import('../src/game/needs');
  health: typeof import('../src/game/health');
  progression: typeof import('../src/game/progression');
  shop: typeof import('../src/game/shop');
  goals: typeof import('../src/game/dailyGoals');
  flow: typeof import('../src/components/harvest/harvestFlow');
  session: typeof import('../src/components/minigames/framework/session');
  drops: typeof import('../src/components/minigames/drops/dropsLogic');
  jump: typeof import('../src/components/minigames/jump/jumpReward');
  light: typeof import('../src/components/room/phase/lightCycle');
  care: typeof import('../src/components/room/care/careLogic');
}

/** Lädt die Spiellogik frisch, optional mit überschriebenen config-Werten. */
function loadMods(overrides: Partial<Record<keyof Config, unknown>> = {}): Mods {
  let mods: Mods | undefined;
  jest.isolateModules(() => {
    jest.doMock('../src/game/config', () => ({ ...jest.requireActual('../src/game/config'), ...overrides }));
    mods = {
      config: require('../src/game/config'),
      time: require('../src/game/timeEngine'),
      needs: require('../src/game/needs'),
      health: require('../src/game/health'),
      progression: require('../src/game/progression'),
      shop: require('../src/game/shop'),
      goals: require('../src/game/dailyGoals'),
      flow: require('../src/components/harvest/harvestFlow'),
      session: require('../src/components/minigames/framework/session'),
      drops: require('../src/components/minigames/drops/dropsLogic'),
      jump: require('../src/components/minigames/jump/jumpReward'),
      light: require('../src/components/room/phase/lightCycle'),
      care: require('../src/components/room/care/careLogic'),
    };
  });
  jest.dontMock('../src/game/config');
  if (!mods) throw new Error('Module nicht geladen');
  return mods;
}

// ---------------------------------------------------------------------------
// Annahmen über die Spieler (nicht Spielregeln, deshalb hier und nicht in config.ts)
// ---------------------------------------------------------------------------

const DAYS = 30;
const RUNS = 40;
const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
/** Start an einem Montag um Mitternacht Ortszeit. */
const START_MS = new Date(2026, 10, 2, 0, 0, 0).getTime();

type GameId = 'smash' | 'drops' | 'jump' | 'tap';
/** Typische Punkte je Runde: smash, drops, jump aus MINIGAME_REWARDS.typicalScores (P23), tap geschätzt. */
const TAP_TYPICAL_SCORE = 30;
/** Gesammelte Lichtpunkte in einer typischen Jump-Runde (100 Punkte, 30 % der Blätter mit Licht). */
const JUMP_TYPICAL_LIGHTS = 15;
/** ANNAHME: Licht-Balken hat in config.ts keinen Abfallwert. Gerechnet wie die Laune, 4 je Stunde. */
const ASSUMED_LIGHT_DECAY_PER_HOUR = 4;

interface Profile {
  id: string;
  label: string;
  /** Uhrzeiten (Ortszeit, Stunden) der Sitzungen an Tag `day` (0-basiert). */
  sessions: (day: number, rng: () => number) => number[];
  roundsPerSession: number;
  /** Zusätzliche Runden je Sitzung, nur solange ein Minigame-Tagesziel offen ist. */
  goalExtraRounds: number;
  /** Lupen-Ergebnis vor dem Spät-Abzug (1 = alle milchigen gefunden). */
  lupe: number;
  /** Chance, nachts in der Blüte die Lampe anzutippen (je Sitzung). */
  lampTapChance: number;
  /** Rewarded Ads zum Vorspulen je Tag (P29, noch nicht gebaut; nur Empfindlichkeit). */
  adsPerDay: number;
}

const jitter = (rng: () => number, h: number) => (rng() - 0.5) * 2 * h;

const PROFILES: Profile[] = [
  {
    id: 'A',
    label: 'täglich aktiv (3 Sitzungen, je 1 Runde plus Runden fürs Tagesziel)',
    sessions: (_d, rng) => [8 + jitter(rng, 0.5), 13 + jitter(rng, 1), 20 + jitter(rng, 1)],
    roundsPerSession: 1,
    goalExtraRounds: 2,
    lupe: 1,
    lampTapChance: 0.2,
    adsPerDay: 0,
  },
  {
    id: 'B',
    label: '1x täglich kurz (18 bis 22 Uhr, 1 Runde)',
    sessions: (_d, rng) => [20 + jitter(rng, 2)],
    roundsPerSession: 1,
    goalExtraRounds: 0,
    lupe: 0.75,
    lampTapChance: 0.2,
    adsPerDay: 0,
  },
  {
    id: 'C',
    label: 'nur alle 2 Tage (18 bis 22 Uhr, 1 Runde)',
    sessions: (d, rng) => (d % 2 === 0 ? [20 + jitter(rng, 2)] : []),
    roundsPerSession: 1,
    goalExtraRounds: 0,
    lupe: 0.75,
    lampTapChance: 0.2,
    adsPerDay: 0,
  },
];

/** Empfindlichkeit: A schaut zusätzlich jeden Tag die erlaubten Werbungen zum Vorspulen. */
const PROFILE_A_ADS: Profile = { ...PROFILES[0], id: 'A+W', label: 'A mit 3 Werbungen/Tag', adsPerDay: 3 };

// ---------------------------------------------------------------------------
// Ergebnis eines Laufs
// ---------------------------------------------------------------------------

interface RunResult {
  coinsEnd: number;
  earnedHarvest: number;
  earnedMinigames: number;
  earnedChest: number;
  spentUpgrades: number;
  spentRevive: number;
  spentMold: number;
  harvests: number;
  starsSum: number;
  harvestDays: number[];
  /** Erster Tag (1-basiert), an dem die Sorte frei ist. */
  unlockDay: Partial<Record<string, number>>;
  comas: number;
  firstComaDay: number | null;
  adRevives: number;
  level: number;
  seedFragments: number;
  upgradeLevels: number;
  chestsClaimed: number;
  lampDisturbs: number;
  /** Anteil der Wachstumsstunden, in denen Budi "krank" aussieht (ein Balken kritisch) oder im Koma ist. */
  sickShare: number;
  /** Anteil der Stunden mit leerem Licht-Balken (ANNAHME, siehe oben). */
  lightEmptyShare: number;
  /** Ernten, die mit Schimmel eingesammelt wurden (Gegenmittel zu teuer). Behandelte: spentMold. */
  molds: number;
  /** Tag, an dem alle Upgrade-Stufen gekauft sind. */
  allUpgradesDay: number | null;
}

function simulate(m: Mods, profile: Profile, seed: number): RunResult {
  const { config: C, time: T, needs: N, health: H } = m;
  const rng = H.createRng(seed);
  const healthRng = H.createRng(seed * 7919 + 13);

  const r: RunResult = {
    coinsEnd: 0,
    earnedHarvest: 0,
    earnedMinigames: 0,
    earnedChest: 0,
    spentUpgrades: 0,
    spentRevive: 0,
    spentMold: 0,
    harvests: 0,
    starsSum: 0,
    harvestDays: [],
    unlockDay: { gustav: 1 },
    comas: 0,
    firstComaDay: null,
    adRevives: 0,
    level: 1,
    seedFragments: 0,
    upgradeLevels: 0,
    chestsClaimed: 0,
    lampDisturbs: 0,
    sickShare: 0,
    lightEmptyShare: 0,
    molds: 0,
    allUpgradesDay: null,
  };

  let coins = 0;
  let plant: import('../src/game/timeEngine').PlantRecord | null = null;
  let needs = N.createNeeds(START_MS);
  let health = H.createHealthState();
  let harvestSession: import('../src/components/harvest/harvestFlow').HarvestSession | null = null;
  let progress = m.progression.EMPTY_PROGRESS;
  let upgrades = m.shop.createUpgradeLevels();
  let goal: import('../src/game/dailyGoals').DailyGoalState | null = null;
  let light = 100;
  let lastSampleMs = START_MS;
  let growingHours = 0;
  let sickHours = 0;
  let lightEmptyHours = 0;
  let adsDay = -1;
  let adsLeft = 0;
  let rotationIndex = 0;

  const dayOf = (t: number) => Math.floor((t - START_MS) / DAY) + 1;
  const fx = () => m.shop.upgradeEffects(upgrades);
  const phaseAt = (t: number) => (plant ? T.getPlantStatus(plant, t, 1).phase : null);

  /** Stunden zwischen den Sitzungen auswerten: wie sieht Budi aus, wie voll ist das Licht. */
  const sampleUntil = (t: number) => {
    const decay = ASSUMED_LIGHT_DECAY_PER_HOUR * fx().lightDecayMultiplier;
    const hours = (t - lastSampleMs) / HOUR;
    lightEmptyHours += Math.max(0, hours - light / decay);
    light = Math.max(0, light - decay * hours);
    for (let s = lastSampleMs + HOUR; s <= t; s += HOUR) {
      const phase = phaseAt(s);
      if (!phase || !H.isGrowingPhase(phase)) continue;
      growingHours++;
      const cond = N.deriveCondition(N.computeNeeds(needs, s, fx().needModifiers, phase), phase);
      if (cond === 'sick' || cond === 'coma') sickHours++;
    }
    lastSampleMs = t;
  };

  const goalEvent = (e: import('../src/game/dailyGoals').DailyGoalEvent) => {
    goal = m.goals.applyGoalEvent(goal, e);
  };

  const careNow = (t: number, type: import('../src/game/events').CareActionId, amount?: number): boolean => {
    const phase = phaseAt(t);
    if (!phase || !H.isGrowingPhase(phase)) return false;
    const before = needs;
    needs = N.applyCare(needs, { type, phase, amount }, t, fx().needModifiers);
    if (needs === before) return false;
    health = H.noteCare(health, t);
    goalEvent({ type: 'careAction', action: type, atMs: t });
    return true;
  };

  const snapshot = (t: number) => {
    const phase = phaseAt(t) ?? 'germination';
    return N.computeNeeds(needs, t, fx().needModifiers, phase);
  };

  const plantSeed = (t: number) => {
    const unlocked = m.progression.unlockedStrainIds(progress);
    // Spieler nimmt die seltenste freie Sorte (neue Sorte ausprobieren), Kölsche Knospe gibt es nur per Ereignis.
    const preference = ['sascha', 'lotte', 'gustav', 'anton'] as const;
    const strainId = preference.find((id) => unlocked.includes(id)) ?? 'gustav';
    plant = T.createPlant(strainId, t, false);
    needs = N.createNeeds(t);
    health = H.runHealthChecks(H.createHealthState(), plant, t, healthRng, { neglect: 0 });
    harvestSession = null;
  };

  const playRound = (t: number, game: GameId) => {
    const score = game === 'tap' ? TAP_TYPICAL_SCORE : C.MINIGAME_REWARDS.typicalScores[game];
    const won = m.session.coinsForScore(score);
    coins += won;
    r.earnedMinigames += won;
    const phase = phaseAt(t);
    if (game === 'drops' && phase && H.isGrowingPhase(phase)) {
      const w = C.DROPS_GAME.spawnWeights;
      const caughtWater = Math.round((score * w.water) / (w.water + w.fertilizer));
      const snap = snapshot(t);
      const limits = { water: C.OVERWATER_LIMIT_BY_PHASE[phase] ?? C.NEED_THRESHOLDS.overwatered, nutrients: C.NEED_MAX };
      const gain = m.drops.roundReward(caughtWater, score - caughtWater, snap, limits);
      if (gain.water > 0) careNow(t, 'water', gain.water);
      if (gain.nutrients > 0) careNow(t, 'fertilize', gain.nutrients);
    }
    if (game === 'smash' && score >= C.PEST_SMASH.protectionMinScore) health = H.grantPestProtection(health, t);
    if (game === 'jump') light = Math.min(100, light + m.jump.lightBonusForRound(JUMP_TYPICAL_LIGHTS));
    const bonus = m.care.moodBonusAction(phase);
    if (bonus) careNow(t, bonus.type, bonus.amount);
    goalEvent({ type: 'minigameFinished', gameId: game, score, coins: won, atMs: t });
  };

  const runSession = (t: number) => {
    sampleUntil(t);
    goal = m.goals.ensureDailyGoal(goal, t);

    // Fertige Ernte einsammeln, dann neuen Samen.
    if (plant && T.getPlantStatus(plant, t, 1).phase === 'done') {
      if (health.moldSinceMs !== null && coins >= C.MOLD_TREATMENT_COINS) {
        coins -= C.MOLD_TREATMENT_COINS;
        r.spentMold += C.MOLD_TREATMENT_COINS;
        health = H.treatMold(health);
      }
      if (health.moldSinceMs !== null) r.molds++;
      const session = harvestSession ?? m.flow.fallbackSession(0.5, 50);
      const res = m.flow.computeHarvestResult(plant, session, H.qualityPenaltyStars(health), fx().yieldMultiplier);
      coins += res.coins;
      r.earnedHarvest += res.coins;
      r.harvests++;
      r.starsSum += res.stars;
      r.harvestDays.push(dayOf(t));
      const before = progress;
      progress = m.progression.applyHarvest(progress, res.stars);
      for (const id of m.progression.newlyUnlocked(before, progress)) r.unlockDay[id] ??= dayOf(t);
      plant = null;
    }
    if (!plant) plantSeed(t);
    const p = plant as unknown as import('../src/game/timeEngine').PlantRecord;

    const f = fx();
    health = H.runHealthChecks(health, p, t, healthRng, {
      neglect: (at) => {
        const ph = T.getPlantStatus(p, at, 1).phase;
        return H.neglectFromNeeds(N.computeNeeds(needs, at, f.needModifiers, ph));
      },
      pestChanceMultiplier: f.pestChanceMultiplier,
      hasDehumidifier: f.hasDehumidifier,
    });

    // Koma: wiederbeleben mit Münzen, sonst per Werbung (P29).
    if (H.isInComa(health, p, t, 1)) {
      r.comas++;
      r.firstComaDay ??= dayOf(t);
      if (coins >= H.reviveCost()) {
        coins -= H.reviveCost();
        r.spentRevive += H.reviveCost();
      } else {
        r.adRevives++;
      }
      health = H.revive(health, t);
      needs = N.reviveNeeds(t);
    }

    // Schädlinge wegtippen, Schimmel behandeln.
    for (const pest of health.pests) health = H.removePest(health, pest.id);
    if (health.moldSinceMs !== null && coins >= C.MOLD_TREATMENT_COINS) {
      coins -= C.MOLD_TREATMENT_COINS;
      r.spentMold += C.MOLD_TREATMENT_COINS;
      health = H.treatMold(health);
    }

    // Vorspulen per Werbung (nur Empfindlichkeit).
    if (dayOf(t) !== adsDay) {
      adsDay = dayOf(t);
      adsLeft = Math.min(profile.adsPerDay, C.REWARDED_AD.maxSpeedUpsPerDay);
    }
    let status = T.getPlantStatus(p, t, 1);
    while (adsLeft > 0 && H.isGrowingPhase(status.phase) && status.phase !== 'ready') {
      plant = T.addBonusDays(plant ?? p, C.REWARDED_AD.speedUpPlantDays);
      adsLeft--;
      status = T.getPlantStatus(plant, t, 1);
    }

    // Licht umschalten, sobald es geht (kürzester Zyklus).
    if (status.canFlipLight) {
      plant = T.flipLight(plant ?? p, t, 1);
      status = T.getPlantStatus(plant, t, 1);
    }

    // Nachts in der Blüte aus Versehen die Lampe antippen.
    const lightState = m.light.getLightState(status, m.light.isAutoflower(p.strainId));
    if (m.care.isDarkDisturbPhase(status.phase) && lightState.protectedDark && rng() < profile.lampTapChance) {
      r.lampDisturbs++;
      needs = N.applyMoodPenalty(needs, C.DARK_DISTURB_MOOD_PENALTY, status.phase, t, f.needModifiers);
    }

    // Pflege: Balken auffüllen, ohne zu überwässern; Dünger passend zur Phase.
    if (H.isGrowingPhase(status.phase)) {
      const phase = status.phase;
      const waterLimit = C.OVERWATER_LIMIT_BY_PHASE[phase] ?? C.NEED_THRESHOLDS.overwatered;
      for (let i = 0; i < 4 && snapshot(t).water + C.CARE_AMOUNTS.water <= waterLimit; i++) careNow(t, 'water');
      const fert = C.GROW_FERTILIZER_PHASES.includes(phase) ? 'fertilizeGrow' : 'fertilizeBloom';
      const fertAmount = C.CARE_AMOUNTS[fert];
      for (let i = 0; i < 3 && snapshot(t).nutrients + fertAmount / 2 <= C.NEED_MAX; i++) careNow(t, fert);
      for (let i = 0; i < 5 && snapshot(t).mood + C.CARE_AMOUNTS.pet / 2 <= C.NEED_MAX; i++) careNow(t, 'pet');
    }

    // Minigames: zuerst das Spiel, das das Tagesziel braucht.
    const rotation: GameId[] = ['smash', 'drops', 'jump'];
    for (let i = 0; i < profile.roundsPerSession + profile.goalExtraRounds; i++) {
      const g = goal as import('../src/game/dailyGoals').DailyGoalState;
      const tpl = m.goals.goalTemplate(g.goalId);
      const goalOpen = tpl.kind !== 'care' && !m.goals.isGoalComplete(g);
      if (i >= profile.roundsPerSession && !goalOpen) break;
      const game: GameId = goalOpen && tpl.kind === 'minigameScore' ? (tpl.gameId as GameId) : rotation[rotationIndex++ % 3];
      playRound(t, game);
    }

    // Pflege-Tagesziel: Streicheln und Düngen schaden nicht, Gießen nur ohne Überwässerung.
    const g = goal as import('../src/game/dailyGoals').DailyGoalState;
    const tpl = m.goals.goalTemplate(g.goalId);
    if (tpl.kind === 'care' && H.isGrowingPhase(status.phase)) {
      const action = tpl.careActions.includes('pet')
        ? 'pet'
        : tpl.careActions.includes('water')
          ? 'water'
          : C.GROW_FERTILIZER_PHASES.includes(status.phase)
            ? 'fertilizeGrow'
            : 'fertilizeBloom';
      const waterLimit = C.OVERWATER_LIMIT_BY_PHASE[status.phase] ?? C.NEED_THRESHOLDS.overwatered;
      for (let i = 0; i < tpl.target && !m.goals.isGoalComplete(goal as never); i++) {
        if (action === 'water' && snapshot(t).water + C.CARE_AMOUNTS.water > waterLimit) break;
        careNow(t, action);
      }
    }
    const chest = m.goals.claimChest(goal as never);
    goal = chest.state;
    if (chest.coins > 0) {
      coins += chest.coins;
      r.earnedChest += chest.coins;
      r.chestsClaimed++;
    }

    // Ernte: nach der Pflege schneiden (Pflege und Laune zählen beim Schnitt), dann sofort einmal wenden.
    status = T.getPlantStatus(plant ?? p, t, 1);
    if (status.phase === 'ready') {
      const snap = snapshot(t);
      harvestSession = {
        trichomeScore: m.flow.trichomeScore(profile.lupe, m.flow.daysInReady(status)),
        careScore: m.flow.careScoreFromNeglect(H.neglectFromNeeds(snap)),
        moodScore: snap.mood,
        dryingTurns: [],
      };
      plant = T.harvest(plant ?? p, t, 1);
      status = T.getPlantStatus(plant, t, 1);
    }
    if (status.phase === 'drying' && harvestSession) {
      const w = m.flow.dryingWindow(status.phaseProgress);
      harvestSession = m.flow.addDryingTurn(harvestSession, w);
    }

    // Shop: billigste nächste Stufe, solange eine Wiederbelebung bezahlbar bleibt.
    for (;;) {
      const options = m.config.UPGRADE_IDS.map((id) => ({ id, next: m.shop.nextLevel(upgrades, id) }))
        .filter((o) => o.next !== null)
        .sort((a, b) => (a.next?.price ?? 0) - (b.next?.price ?? 0));
      const cheapest = options[0];
      if (!cheapest?.next || coins - cheapest.next.price < H.reviveCost()) break;
      coins -= cheapest.next.price;
      r.spentUpgrades += cheapest.next.price;
      upgrades = m.shop.buyLevel(upgrades, cheapest.id);
    }
    if (m.config.UPGRADE_IDS.every((id) => m.shop.nextLevel(upgrades, id) === null)) r.allUpgradesDay ??= dayOf(t);
  };

  for (let d = 0; d < DAYS; d++) {
    const hours = profile.sessions(d, rng).sort((a, b) => a - b);
    for (const h of hours) runSession(START_MS + d * DAY + h * HOUR);
  }
  sampleUntil(START_MS + DAYS * DAY);

  r.coinsEnd = coins;
  r.level = m.progression.levelForXp(progress.xp);
  r.seedFragments = progress.seedFragments;
  r.upgradeLevels = m.config.UPGRADE_IDS.reduce((s, id) => s + m.shop.levelOf(upgrades, id), 0);
  r.sickShare = growingHours > 0 ? sickHours / growingHours : 0;
  r.lightEmptyShare = lightEmptyHours / (DAYS * 24);
  return r;
}

// ---------------------------------------------------------------------------
// Auswertung
// ---------------------------------------------------------------------------

const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / Math.max(1, xs.length);
const median = (xs: number[]) => {
  const s = [...xs].sort((a, b) => a - b);
  return s.length ? s[Math.floor(s.length / 2)] : NaN;
};
const fmt = (x: number, digits = 0) => (Number.isFinite(x) ? x.toFixed(digits).replace('.', ',') : '–');
const pct = (x: number) => `${fmt(x * 100)} %`;

function dayStat(results: RunResult[], pick: (r: RunResult) => number | null | undefined): string {
  const days = results.map(pick).filter((d): d is number => typeof d === 'number');
  if (days.length === 0) return 'nie';
  const share = days.length / results.length;
  return share < 1 ? `Tag ${median(days)} (${pct(share)} der Läufe)` : `Tag ${median(days)}`;
}

function summarize(m: Mods, profiles: Profile[]): string {
  const rows: string[][] = [];
  for (const profile of profiles) {
    const res = Array.from({ length: RUNS }, (_, i) => simulate(m, profile, i + 1));
    const earned = res.map((x) => x.earnedHarvest + x.earnedMinigames + x.earnedChest);
    rows.push([
      profile.id,
      fmt(mean(res.map((x) => x.harvests)), 1),
      dayStat(res, (x) => x.harvestDays[0]),
      fmt(mean(res.map((x) => (x.harvests ? x.starsSum / x.harvests : NaN)).filter(Number.isFinite)), 1),
      fmt(mean(earned)),
      `${fmt(mean(res.map((x) => x.earnedHarvest)))} / ${fmt(mean(res.map((x) => x.earnedMinigames)))} / ${fmt(mean(res.map((x) => x.earnedChest)))}`,
      fmt(mean(res.map((x) => x.upgradeLevels)), 1),
      fmt(mean(res.map((x) => x.coinsEnd))),
      dayStat(res, (x) => x.unlockDay.lotte),
      dayStat(res, (x) => x.unlockDay.anton),
      dayStat(res, (x) => x.unlockDay.sascha),
      fmt(mean(res.map((x) => x.level)), 1),
      `${fmt(mean(res.map((x) => x.comas)), 1)} (${fmt(mean(res.map((x) => x.adRevives)), 1)} per Werbung)`,
      dayStat(res, (x) => x.firstComaDay),
      pct(mean(res.map((x) => x.sickShare))),
      pct(mean(res.map((x) => x.lightEmptyShare))),
      fmt(mean(res.map((x) => x.lampDisturbs)), 1),
      `${fmt(mean(res.map((x) => x.spentMold / m.config.MOLD_TREATMENT_COINS)), 1)} / ${fmt(mean(res.map((x) => x.molds)), 1)}`,
    ]);
  }
  const head = [
    'Typ',
    'Ernten',
    '1. Ernte',
    'Ø Sterne',
    'Münzen verdient',
    'davon Ernte / Spiele / Kiste',
    'Upgrade-Stufen (von 7)',
    'Münzen Tag 30',
    'Lila Lotte (selten)',
    'Auto-Anton',
    'Sativa Sascha',
    'Level',
    'Koma',
    '1. Koma',
    'Budi krank/Koma',
    'Licht leer (Annahme)',
    'Lampe nachts',
    'Schimmel behandelt / mit Schimmel geerntet',
  ];
  const line = (cells: string[]) => `| ${cells.join(' | ')} |`;
  return [line(head), line(head.map(() => '---')), ...rows.map(line)].join('\n');
}

type Overrides = Partial<Record<keyof Config, unknown>>;

/** Vorschläge für P32b, einzeln, nur im Speicher. Begründung in docs/progress/p32.md. */
function proposals(): { label: string; overrides: Overrides }[] {
  const C = jest.requireActual('../src/game/config') as Config;
  return [
    { label: 'COMA_AFTER_REAL_HOURS 24 → 36', overrides: { COMA_AFTER_REAL_HOURS: 36 } },
    {
      label: 'Wasser-Abfall 5 → 3, Laune 4 → 3',
      overrides: { NEED_DECAY_PER_REAL_HOUR: { ...C.NEED_DECAY_PER_REAL_HOUR, water: 3, mood: 3 } },
    },
    {
      label: 'Lila Lotte ab 1 Ernte statt 3',
      overrides: { STRAINS: { ...C.STRAINS, lotte: { ...C.STRAINS.lotte, unlock: { type: 'harvests', count: 1 } } } },
    },
    { label: 'DAILY_GOAL_CHEST_COINS 60 → 25', overrides: { DAILY_GOAL_CHEST_COINS: 25 } },
    { label: 'COINS_PER_YIELD_UNIT 5 → 10', overrides: { COINS_PER_YIELD_UNIT: 10 } },
  ];
}

/** Gerechnet, aber nicht empfohlen (Vergleich in docs/progress/p32.md). */
const ALTERNATIVES: { label: string; overrides: Overrides }[] = [
  { label: '(Alternative) COMA_AFTER_REAL_HOURS 24 → 48', overrides: { COMA_AFTER_REAL_HOURS: 48 } },
  { label: '(Alternative) COMA_AFTER_REAL_HOURS 24 → 30', overrides: { COMA_AFTER_REAL_HOURS: 30 } },
];

const allProposals = (): Overrides => Object.assign({}, ...proposals().map((p) => p.overrides));

/** Wirkung jedes Vorschlags allein, gegen den Ist-Stand. */
function singleEffects(): string {
  const variants = [
    { label: 'Ist-Stand', overrides: {} },
    ...proposals(),
    ...ALTERNATIVES,
    { label: 'alle Vorschläge zusammen', overrides: allProposals() },
  ];
  const head = [
    'Variante',
    'B Koma',
    'B krank/Koma',
    'B Lila Lotte',
    'B Münzen',
    'B alle Upgrades',
    'A Münzen',
    'A alle Upgrades',
    'C Koma',
    'C krank/Koma',
  ];
  const line = (cells: string[]) => `| ${cells.join(' | ')} |`;
  const rows = variants.map((v) => {
    const m = loadMods(v.overrides);
    const run = (p: Profile) => Array.from({ length: RUNS }, (_, i) => simulate(m, p, i + 1));
    const [a, b, c] = PROFILES.map(run);
    const earned = (xs: RunResult[]) => fmt(mean(xs.map((x) => x.earnedHarvest + x.earnedMinigames + x.earnedChest)));
    return [
      v.label,
      fmt(mean(b.map((x) => x.comas)), 1),
      pct(mean(b.map((x) => x.sickShare))),
      dayStat(b, (x) => x.unlockDay.lotte),
      earned(b),
      dayStat(b, (x) => x.allUpgradesDay),
      earned(a),
      dayStat(a, (x) => x.allUpgradesDay),
      fmt(mean(c.map((x) => x.comas)), 1),
      pct(mean(c.map((x) => x.sickShare))),
    ];
  });
  return [line(head), line(head.map(() => '---')), ...rows.map(line)].join('\n');
}

test('Balancing-Simulation P32', () => {
  const profiles = [...PROFILES, PROFILE_A_ADS];
  const out = [
    `# P32 Simulation: ${DAYS} Tage, ${RUNS} Läufe je Typ (Mittelwerte, Tage als Median)`,
    '',
    'Typen: ' + profiles.map((p) => `${p.id} = ${p.label}`).join('; '),
    '',
    '## Ist-Stand (config.ts unverändert)',
    '',
    summarize(loadMods(), profiles),
    '',
    '## Einzelwirkung der Vorschläge (nur im Speicher)',
    '',
    singleEffects(),
    '',
    '## Mit allen Vorschlägen (nur im Speicher)',
    '',
    summarize(loadMods(allProposals()), profiles),
    '',
  ].join('\n');
  process.stdout.write(out + '\n');
  expect(out).toContain('| A |');
});
