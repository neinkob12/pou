// PotPou: zentrale Balancing-Werte.
// Alle Zahlen, die das Spielgefühl bestimmen, stehen hier und nur hier.
//
// Büro-Regel (docs/AUFTRAEGE.md): Jeder Auftrag ergänzt Werte NUR in seinem markierten Abschnitt,
// nie am Dateiende. Die Abschnitte unten sind vorab reserviert, damit parallele Branches
// ohne Merge-Konflikt zusammenlaufen.
// Einheiten: "Pflanzentage" = Tage im Leben der Pflanze, "echte Stunden" = Uhrzeit des Spielers.

/** 1 echter Tag = TIME_SCALE Pflanzentage. Standard: ein Zyklus dauert rund 10 echte Tage. */
export const TIME_SCALE = 10;

/** Mit dem Turbo-Kauf läuft alles doppelt so schnell (rund 5 echte Tage pro Zyklus). */
export const TURBO_TIME_SCALE = 20;

/** Nur für Tests und Debug-Menü. In Produktion immer 1. */
export const DEBUG_SPEED_MULTIPLIER = 1;

export const MS_PER_REAL_DAY = 24 * 60 * 60 * 1000;

// ---------------------------------------------------------------------------
// Phasen
// ---------------------------------------------------------------------------

export type PhaseId =
  | 'germination' // Keimung
  | 'seedling' // Sämling
  | 'vegetative' // Wachstum, bis der Spieler auf 12/12 umschaltet
  | 'flowering' // Blüte
  | 'ready' // erntebereit, wartet auf Ernte
  | 'drying' // hängt zum Trocknen
  | 'done'; // fertig, kann eingesammelt werden

export const PHASE_LABELS: Record<PhaseId, string> = {
  germination: 'Keimung',
  seedling: 'Sämling',
  vegetative: 'Wachstum',
  flowering: 'Blüte',
  ready: 'Erntebereit',
  drying: 'Trocknen',
  done: 'Fertig',
};

/** Feste Phasendauern in Pflanzentagen (Quellen siehe docs/KONZEPT.md). */
export const BASE_PHASES = {
  germinationDays: 7, // real 3 bis 10 Tage
  seedlingDays: 14, // real 2 bis 3 Wochen
  vegetativeMinDays: 21, // frühester Lichtwechsel (3 Wochen)
  vegetativeMaxDays: 49, // danach kein Ertragsbonus mehr (7 Wochen)
  dryingDays: 7, // real 3 bis 10 Tage
} as const;

/** Wie lange "ready" dauern darf, bevor die Qualität sinkt (Pflanzentage). */
export const READY_GRACE_DAYS = 7;

// ---------------------------------------------------------------------------
// Sorten
// ---------------------------------------------------------------------------

export type StrainId = 'gustav' | 'lotte' | 'sascha' | 'anton' | 'koelsch';
export type Rarity = 'common' | 'rare' | 'epic' | 'speed' | 'legendary';

export interface Strain {
  id: StrainId;
  name: string;
  rarity: Rarity;
  /** Blütedauer in Pflanzentagen */
  floweringDays: number;
  /** Autoflower: blüht ohne Lichtwechsel nach festem Wachstum */
  autoflower: boolean;
  /** Nur bei Autoflower: feste Wachstumsdauer in Pflanzentagen */
  autoVegetativeDays?: number;
  /** Multiplikator auf den Grundertrag */
  yieldMultiplier: number;
  /** Multiplikator auf den Münzwert pro Ertragseinheit */
  valueMultiplier: number;
  unlock: { type: 'start' } | { type: 'harvests'; count: number } | { type: 'seedFragments'; count: number } | { type: 'level'; level: number } | { type: 'event' };
}

export const STRAINS: Record<StrainId, Strain> = {
  gustav: {
    id: 'gustav',
    name: 'Gurken-Gustav',
    rarity: 'common',
    floweringDays: 56, // 8 Wochen
    autoflower: false,
    yieldMultiplier: 1,
    valueMultiplier: 1,
    unlock: { type: 'start' },
  },
  lotte: {
    id: 'lotte',
    name: 'Lila Lotte',
    rarity: 'rare',
    floweringDays: 63, // 9 Wochen
    autoflower: false,
    yieldMultiplier: 1,
    valueMultiplier: 1.4,
    unlock: { type: 'harvests', count: 3 },
  },
  sascha: {
    id: 'sascha',
    name: 'Sativa Sascha',
    rarity: 'epic',
    floweringDays: 77, // 11 Wochen
    autoflower: false,
    yieldMultiplier: 1.6,
    valueMultiplier: 1.2,
    unlock: { type: 'seedFragments', count: 10 },
  },
  anton: {
    id: 'anton',
    name: 'Auto-Anton',
    rarity: 'speed',
    floweringDays: 42, // 6 Wochen
    autoflower: true,
    autoVegetativeDays: 14,
    yieldMultiplier: 0.6,
    valueMultiplier: 1,
    unlock: { type: 'level', level: 5 },
  },
  koelsch: {
    id: 'koelsch',
    name: 'Kölsche Knospe',
    rarity: 'legendary',
    floweringDays: 70, // 10 Wochen
    autoflower: false,
    yieldMultiplier: 1.3,
    valueMultiplier: 2,
    unlock: { type: 'event' },
  },
};

// ---------------------------------------------------------------------------
// Bedürfnisse (Balken 0 bis 100)
// ---------------------------------------------------------------------------

/** Abfall pro ECHTER Stunde (nicht Pflanzentag), damit sich die Pflege fair anfühlt. */
export const NEED_DECAY_PER_REAL_HOUR = {
  water: 5, // leer nach ca. 20 h
  nutrients: 3, // leer nach ca. 33 h
  mood: 4, // leer nach ca. 25 h
} as const;

export const NEED_THRESHOLDS = {
  low: 30, // Budi zeigt Unbehagen
  critical: 10, // Budi wird krank, Ertrag sinkt
  overwatered: 100, // Gießen über volles Wasser hinaus = Überwässerung
} as const;

/** Nach so vielen echten Stunden ohne Pflege geht Budi ins Koma. */
export const COMA_AFTER_REAL_HOURS = 24;

/** Laune über diesem Wert gibt einen kleinen Wachstumsbonus auf den Ertrag. */
export const MOOD_BONUS_THRESHOLD = 70;
export const MOOD_YIELD_BONUS = 0.05;

/** Obergrenze jedes Balkens. */
export const NEED_MAX = 100;

/** Füllstand nach dem Pflanzen eines Samens. */
export const NEED_START = { water: 80, nutrients: 80, mood: 80 } as const;

/**
 * Phasen-Faktor auf den Abfall (Auftrag P04). Fehlt ein Eintrag, gilt 1.
 * Sämling braucht wenig Wasser; im Trocknen und danach gibt es keine Bedürfnisse mehr.
 */
export const NEED_PHASE_DECAY_FACTOR: Partial<
  Record<PhaseId, Partial<Record<keyof typeof NEED_DECAY_PER_REAL_HOUR, number>>>
> = {
  germination: { water: 0.5 },
  seedling: { water: 0.5 },
  drying: { water: 0, nutrients: 0, mood: 0 },
  done: { water: 0, nutrients: 0, mood: 0 },
};

/** Wie viel eine Pflege-Aktion auffüllt (Punkte auf dem Balken). */
export const CARE_AMOUNTS = {
  water: 35,
  fertilize: 25, // Universaldünger, passt immer
  fertilizeGrow: 40, // Stickstoff-betont, richtig im Wachstum
  fertilizeBloom: 40, // Phosphor/Kalium-betont, richtig in der Blüte
  pet: 20,
} as const;

/** Ab diesem Wasserstand nach dem Gießen gilt es als Überwässerung. Fehlt die Phase: NEED_THRESHOLDS.overwatered. */
export const OVERWATER_LIMIT_BY_PHASE: Partial<Record<PhaseId, number>> = {
  germination: 70, // Keimling und Sämling sind empfindlich gegen zu viel Wasser
  seedling: 70,
};

/** So lange (echte Stunden) bleibt Budi nach Überwässerung gestresst. */
export const OVERWATER_STRESS_REAL_HOURS = 6;

/** Falscher Dünger wirkt nur zu diesem Anteil und stresst Budi so lange (echte Stunden). */
export const WRONG_FERTILIZER_FACTOR = 0.25;
export const WRONG_FERTILIZER_STRESS_REAL_HOURS = 4;

/** Stickstoff-Dünger passt in diesen Phasen, Phosphor/Kalium-Dünger in den anderen lebenden Phasen. */
export const GROW_FERTILIZER_PHASES: readonly PhaseId[] = ['germination', 'seedling', 'vegetative'];
export const BLOOM_FERTILIZER_PHASES: readonly PhaseId[] = ['flowering', 'ready'];

/** Füllstand aller Balken nach dem Wiederbeleben aus dem Koma (Kosten regelt P05). */
export const COMA_REVIVE_NEED_LEVEL = 50;

// ---------------------------------------------------------------------------
// Ertrag und Wirtschaft
// ---------------------------------------------------------------------------

export const BASE_YIELD_UNITS = 10;
/** Jeder Pflanzentag Wachstum über dem Minimum gibt so viel Prozent mehr Ertrag. */
export const YIELD_BONUS_PER_EXTRA_VEG_DAY = 0.02;
export const COINS_PER_YIELD_UNIT = 5;

export const REWARDED_AD = {
  maxSpeedUpsPerDay: 3,
  speedUpPlantDays: 3, // eine Werbung spult 3 Pflanzentage vor
  harvestCoinMultiplier: 2,
} as const;

export const PRICES_EUR = {
  turbo: 9.99,
  cosmeticPackSmall: 0.99,
  cosmeticPackLarge: 2.99,
  seasonPass: 2.99,
} as const;

// ---------------------------------------------------------------------------
// Gesundheit: Schädlinge, Schimmel, Koma (Auftrag P05, UI P21)
// ---------------------------------------------------------------------------

/** Gesundheit wird in festen Fenstern echter Zeit ausgewürfelt, je Fenster ein Wurf pro Krankheit. */
export const HEALTH_CHECK_INTERVAL_REAL_HOURS = 1;

export type PestKind = 'spiderMite' | 'fungusGnat';
export const PEST_KINDS: readonly PestKind[] = ['spiderMite', 'fungusGnat'];

/** Chance auf einen neuen Schädling je Fenster bei bester Pflege (ca. einer alle 2 echten Tage). */
export const PEST_BASE_CHANCE_PER_CHECK = 0.02;
/** Bei voller Vernachlässigung (neglect = 1) ist die Chance (1 + dieser Wert) mal so hoch. */
export const PEST_NEGLECT_MULTIPLIER = 4;
/** Mehr Schädlinge sitzen nie gleichzeitig auf Budi. */
export const PEST_MAX_ON_BUDI = 5;
/** Schutz nach einer Runde Schädlings-Smash (P12): ein Spieltag = ein echter Tag. */
export const PEST_PROTECTION_REAL_HOURS = 24;

/** Luftfeuchte beim Trocknen in Prozent, ohne und mit Entfeuchter-Upgrade (P15). */
export const DRYING_HUMIDITY_PERCENT = 65;
export const DRYING_HUMIDITY_WITH_DEHUMIDIFIER_PERCENT = 55;
/** Ab dieser Feuchte kann Schimmel entstehen. */
export const MOLD_HUMIDITY_THRESHOLD = 62;
/** Schimmelchance je Fenster und Prozentpunkt über der Schwelle (65 % ergibt 3 % je Stunde). */
export const MOLD_CHANCE_PER_PERCENT_OVER = 0.01;
/** Gegenmittel gegen Schimmel kostet so viele Münzen. */
export const MOLD_TREATMENT_COINS = 20;

/** Qualitätsmalus in Sternen (P06 zieht ihn vor dem Runden ab). */
export const QUALITY_PENALTY_STARS = {
  perPest: 0.25,
  mold: 1.5,
  max: 3,
} as const;

/** Wiederbeleben aus dem Koma (Schwelle: COMA_AFTER_REAL_HOURS im Abschnitt Bedürfnisse). */
export const COMA_REVIVE_COINS = 30;

// ---------------------------------------------------------------------------
// Ernte-Qualität: Sterne, Trichom-Lupe, Trocknung (Auftrag P06, UI P24)
// ---------------------------------------------------------------------------

/** Pflegequalität 0 bis 1 skaliert den Ertrag von diesem Faktor (Pflege 0) bis 1 (Pflege perfekt). */
export const YIELD_CARE_MIN_FACTOR = 0.5;

/** Jede Ernte bringt mindestens so viele Ertragseinheiten. */
export const MIN_YIELD_UNITS = 1;

/** Sterne = Basis + Trichom-Lupe (0 bis 1) × Max + Trocknung (0 bis 1) × Max − Krankheitsmalus, gerundet. */
export const QUALITY_STARS = {
  min: 1,
  max: 5,
  base: 1,
  trichomeMax: 2,
  dryingMax: 2,
} as const;

/** Ernte-Wert = Ertrag × Qualität: Münz-Multiplikator je Sternzahl. */
export const STAR_COIN_MULTIPLIER: Record<1 | 2 | 3 | 4 | 5, number> = {
  1: 0.5,
  2: 0.75,
  3: 1,
  4: 1.25,
  5: 1.5,
};

/** Samen-Fragmente je Ernte nach Sternzahl (Sativa Sascha braucht 10). */
export const SEED_FRAGMENTS_BY_STARS: Record<1 | 2 | 3 | 4 | 5, number> = {
  1: 0,
  2: 1,
  3: 1,
  4: 2,
  5: 3,
};

// ---------------------------------------------------------------------------
// Shop-Upgrades: Topf, LED, Ventilator, Erde, Nützlings-Kit (Auftrag P15)
// ---------------------------------------------------------------------------

// Werte hier einfügen, z. B. UPGRADES mit Preis und Effekt-Multiplikatoren.

// ---------------------------------------------------------------------------
// Level und Freischaltungen (Auftrag P16)
// ---------------------------------------------------------------------------

// Werte hier einfügen, z. B. XP_PER_HARVEST, XP_PER_STAR, LEVEL_THRESHOLDS.

// ---------------------------------------------------------------------------
// Tagesziele und Benachrichtigungen (Aufträge P18, P19)
// ---------------------------------------------------------------------------

// Werte hier einfügen, z. B. NOTIFICATIONS_MAX_PER_DAY, QUIET_HOURS, DAILY_GOAL_POOL.

// ---------------------------------------------------------------------------
// Kosmetik und Saisonpass (Aufträge P25, P33)
// ---------------------------------------------------------------------------

// Werte hier einfügen, z. B. COSMETIC_ITEMS mit Münzpreis oder Produkt-ID.

// ---------------------------------------------------------------------------
// Minigames
// ---------------------------------------------------------------------------

export const MINIGAME_REWARDS = {
  coinsPerPoint: 0.5,
  maxCoinsPerRound: 50,
  moodPerRound: 15,
} as const;

/** Gerüst aller Minigames (Auftrag P08). */
export const MINIGAME_FRAMEWORK = {
  countdownSeconds: 3,
  /** Längster Frame-Schritt, der zählt. Schützt vor Zeitsprüngen nach Ruckeln oder Hintergrund. */
  maxFrameStepMs: 100,
} as const;

/** Beispielspiel "Tipp den Kreis" (Auftrag P08). */
export const TAP_CIRCLE = {
  durationSeconds: 30,
  pointsPerHit: 1,
  startRadius: 48,
  minRadius: 22,
  /** Radius schrumpft pro Treffer um so viele Pixel, bis minRadius. */
  shrinkPerHit: 1,
  /** So lange bleibt ein Kreis stehen, bevor er woanders auftaucht. */
  lifetimeMs: 1400,
  /** Treffer zählen auch etwas außerhalb des Kreises (Finger sind dicker als Pixel). */
  hitSlop: 10,
} as const;
