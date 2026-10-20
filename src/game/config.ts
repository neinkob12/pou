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

// Werte hier einfügen, z. B. PEST_BASE_CHANCE_PER_PLANT_DAY, MOLD_HUMIDITY_THRESHOLD, COMA_REVIVE_COINS.

// ---------------------------------------------------------------------------
// Ernte-Qualität: Sterne, Trichom-Lupe, Trocknung (Auftrag P06, UI P24)
// ---------------------------------------------------------------------------

// Werte hier einfügen, z. B. QUALITY_PENALTY_PER_DISEASE, SEED_FRAGMENTS_PER_HARVEST.

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
