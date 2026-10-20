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
// Minigames: Schädlings-Smash (Auftrag P12)
// ---------------------------------------------------------------------------

/** Whack-a-Mole auf dem Blatt. Zeiten in Spiel-Millisekunden, Tempo steigt linear bis Rundenende. */
export const PEST_SMASH = {
  durationSeconds: 45,
  /** Löcher auf dem Blatt: Spalten mal Reihen. */
  gridCols: 3,
  gridRows: 4,
  /** Abstand zwischen zwei Tieren am Anfang und am Ende der Runde. */
  spawnIntervalStartMs: 900,
  spawnIntervalEndMs: 380,
  /** So lange bleibt ein Tier sichtbar, am Anfang und am Ende der Runde. */
  lifetimeStartMs: 1500,
  lifetimeEndMs: 700,
  /** Anteil Marienkäfer unter allen Tieren. Rest teilen sich Spinnmilbe und Trauermücke. */
  ladybugChance: 0.2,
  /** Anteil Spinnmilben unter den Schädlingen. */
  miteShareOfPests: 0.5,
  pointsPerPest: 1,
  /** Marienkäfer getroffen: so viele Punkte weg (nie unter 0) und Kombo vorbei. */
  ladybugPenalty: 3,
  /** Treffer innerhalb dieser Zeit nach dem letzten zählen zur Kombo. */
  comboWindowMs: 900,
  /** Alle so viele Treffer in Folge steigt der Multiplikator um 1. */
  comboStep: 5,
  maxComboMultiplier: 3,
  /** Getroffenes Tier bleibt so lange als "getroffen" stehen. */
  hitShowMs: 250,
  /** Tipp zählt im Umkreis von so viel Prozent der Lochbreite um die Lochmitte. */
  hitRadiusFactor: 0.45,
  /** Ab so vielen Punkten gibt es den Schädlingsschutz (PEST_PROTECTION_REAL_HOURS) dazu. */
  protectionMinScore: 10,
} as const;

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

/** Laune-Abzug, wenn die Lampe in der Dunkelphase der Blüte angetippt wird (P10b). Vorläufig, Chef bestätigt, P32 prüft. */
export const DARK_DISTURB_MOOD_PENALTY = 10;

// ---------------------------------------------------------------------------
// Minigames: Tropfen-Fang (Auftrag P13)
// ---------------------------------------------------------------------------

/** Tropfen-Fang: Topf unten fängt Wasser und Dünger, Salz kostet ein Leben. Längen in Punkten (dp). */
export const DROPS_GAME = {
  lives: 3,
  /** Höchstens so viel füllt eine Runde je Balken auf (Wasser und Nährstoffe getrennt). */
  maxBarGainPerRound: 40,
  /** So viel füllt ein gefangener Tropfen auf seinen Balken. */
  barGainPerDrop: 4,
  pointsPerDrop: 1,
  /** Fallgeschwindigkeit (dp pro Sekunde): Start, Zuwachs pro Spielsekunde, Obergrenze. */
  startFallSpeed: 160,
  fallSpeedPerSecond: 6,
  maxFallSpeed: 520,
  /** Abstand zwischen zwei neuen Tropfen (ms): Start, Abnahme pro Spielsekunde, Untergrenze. */
  startSpawnIntervalMs: 1100,
  spawnIntervalDecreasePerSecond: 12,
  minSpawnIntervalMs: 420,
  /** Anteile der Tropfenarten (Summe 1). */
  spawnWeights: { water: 0.45, fertilizer: 0.3, salt: 0.25 },
  dropRadius: 14,
  potWidth: 96,
  potHeight: 56,
  /** Abstand des Topfs vom unteren Rand. */
  potBottomMargin: 16,
} as const;

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
// Minigames: Budi Jump (Auftrag P14)
// ---------------------------------------------------------------------------

/**
 * Budi Jump: Endlos-Springer nach oben. Welt-Einheiten: die Bildschirmbreite ist immer 100,
 * damit das Spiel auf jedem Handy gleich schwer ist. y zählt nach oben.
 */
export const BUDI_JUMP = {
  worldWidth: 100,
  /** Fallbeschleunigung in Einheiten pro Sekunde². */
  gravity: 260,
  /** Absprung-Geschwindigkeit bei Landung auf einem Blatt. Sprunghöhe = v² / (2 · gravity) ≈ 59. */
  jumpVelocity: 175,
  /** Höchste Seitwärts-Geschwindigkeit (Einheiten pro Sekunde). */
  maxSideSpeed: 95,
  /** Wie schnell Budi die Ziel-Geschwindigkeit erreicht (Anteil pro Sekunde, höher = direkter). */
  sideResponse: 12,
  /** Fester Physik-Schritt in ms (120 Hz), unabhängig von der Bildrate. */
  stepMs: 1000 / 120,
  budiRadius: 6,
  platformWidth: 20,
  platformHeight: 3,
  /** Abstand der Blätter: am Start und ab difficultyHeight. Max bleibt unter der Sprunghöhe. */
  gapStart: { min: 14, max: 24 },
  gapHard: { min: 28, max: 46 },
  /** Ab dieser Höhe gelten die schweren Abstände voll. */
  difficultyHeight: 3000,
  /** Budi bleibt höchstens so weit (Anteil der Sichthöhe) über dem unteren Rand, dann zieht die Kamera mit. */
  cameraFollow: 0.45,
  /** So weit über dem sichtbaren oberen Rand werden schon Blätter erzeugt. */
  spawnAhead: 40,
  /** Höhe in Einheiten pro Punkt. */
  heightPerPoint: 10,
  /** Neigung in g, ab der Budi volle Geschwindigkeit hat. */
  tiltFullAt: 0.35,
  /** Neigungen darunter zählen nicht (Zittern der Hand). */
  tiltDeadZone: 0.04,
  /** Takt des Beschleunigungssensors in ms. */
  sensorIntervalMs: 16,
  // Feinschliff (Auftrag P22): Plattform-Typen, Lichtpunkte, Lichtbonus.
  /** Absprung von einem Feder-Blatt. Sprunghöhe ≈ 2,3 × normal (≈ 136). */
  springVelocity: 266,
  /** Anteil brechender Blätter: am Start und ab difficultyHeight (dazwischen linear). */
  breakingChance: { start: 0, hard: 0.35 },
  /** Anteil Feder-Blätter: am Start und ab difficultyHeight. */
  springChance: { start: 0.1, hard: 0.05 },
  /** So schnell fällt ein gebrochenes Blatt nach unten (Einheiten pro Sekunde). */
  brokenFallSpeed: 120,
  /** Chance je Blatt, dass darüber ein Lichtpunkt schwebt. */
  lightChance: 0.3,
  /** Lichtpunkt so weit über dem Blatt (unter der Sprunghöhe, also erreichbar). */
  lightLift: { min: 12, max: 40 },
  lightRadius: 3,
  /** Lichtbonus für Budi je gesammeltem Lichtpunkt (Licht-Balken 0 bis 100). */
  lightBonusPerPoint: 2,
  /** Höchster Lichtbonus pro Runde. */
  lightBonusMaxPerRound: 30,
  /** Höchstes Licht-Guthaben, bis der Licht-Balken es abholt. */
  lightBankMax: 100,
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

/**
 * Trichom-Lupe (P24): Erkennungsspiel in der Phase "ready". Der Spieler tippt die milchigen
 * Köpfchen an. Mit jedem Pflanzentag in "ready" werden mehr Köpfchen bernsteinfarben;
 * nach READY_GRACE_DAYS sinkt der Lupen-Wert je Tag um latePenaltyPerDay.
 */
export const TRICHOME_LUPE = {
  heads: 12,
  clearHeads: 2,
  /** Bernstein-Anteil am Anfang von "ready" und Zuwachs je Pflanzentag, gedeckelt bei maxAmberShare. */
  amberShareStart: 0.1,
  amberSharePerDay: 0.04,
  maxAmberShare: 0.6,
  /** Abzug vom Lupen-Wert (0 bis 1) je falsch getipptem Köpfchen. */
  wrongTapPenalty: 0.2,
  latePenaltyPerDay: 0.1,
  /** Lupen-Wert, wenn ohne Lupe geerntet wurde (z. B. über das Debug-Menü). */
  skippedScore: 0.5,
} as const;

/**
 * Trocknen (P24): Die Trockenzeit ist in Fenster geteilt, je Fenster zählt einmal Wenden.
 * Trocknungswert = baseScore + (1 − baseScore) × gewendete Fenster / Fenster.
 */
export const DRYING_TURNS = {
  windows: 3,
  baseScore: 0.4,
} as const;

// ---------------------------------------------------------------------------
// Licht und Phasen: Lichtplan, Tag/Nacht im Raum (Auftrag P11)
// ---------------------------------------------------------------------------

/** Lichtstunden je Pflanzentag (24 Stunden). Wachstum 18/6, Blüte nach dem Umschalten 12/12. */
export const LIGHT_HOURS_ON = {
  vegetative: 18,
  flowering: 12,
} as const;

/** Tageszeit, zu der das Licht in jedem Pflanzentag angeht (Stunde 0 bis 23 im Pflanzentag). */
export const LIGHT_ON_AT_HOUR = 6;

// ---------------------------------------------------------------------------
// Shop-Upgrades: Topf, LED, Ventilator, Erde, Nützlings-Kit (Auftrag P15)
// ---------------------------------------------------------------------------

export type UpgradeId = 'pot' | 'led' | 'fanDehumidifier' | 'bioSoil' | 'beneficials';

/** Wirkung einer Upgrade-Stufe. Fehlt ein Wert, ändert die Stufe daran nichts. */
export interface UpgradeEffect {
  /** Abfall-Multiplikator je Balken (0.8 = 20 % langsamer), geht als modifiers an computeNeeds. */
  needDecay?: Partial<Record<keyof typeof NEED_DECAY_PER_REAL_HOUR, number>>;
  /** Abfall-Multiplikator für den Lichtbalken (P11). */
  lightDecay?: number;
  /** Multiplikator auf den Ertrag (P24 reicht ihn an die Ernte). */
  yieldMultiplier?: number;
  /** Multiplikator auf die Schädlingschance (HealthCheckOptions.pestChanceMultiplier). */
  pestChance?: number;
  /** Trocknen mit Entfeuchter: kein Schimmel (HealthCheckOptions.hasDehumidifier). */
  dehumidifier?: boolean;
}

export interface UpgradeLevel {
  /** Preis in Münzen. */
  price: number;
  /** Gesamtwirkung dieser Stufe (nicht zusätzlich zur Stufe davor). */
  effect: UpgradeEffect;
}

/** Reihenfolge im Shop. Mehrstufig: Topf (3 Stufen, Asset U1). */
export const UPGRADE_IDS: readonly UpgradeId[] = ['pot', 'led', 'fanDehumidifier', 'bioSoil', 'beneficials'];

export const UPGRADES: Record<UpgradeId, readonly UpgradeLevel[]> = {
  pot: [
    { price: 60, effect: { needDecay: { water: 0.85 }, yieldMultiplier: 1.1 } },
    { price: 150, effect: { needDecay: { water: 0.75 }, yieldMultiplier: 1.2 } },
    { price: 300, effect: { needDecay: { water: 0.65 }, yieldMultiplier: 1.3 } },
  ],
  led: [{ price: 120, effect: { lightDecay: 0.7 } }],
  fanDehumidifier: [{ price: 100, effect: { dehumidifier: true } }],
  bioSoil: [{ price: 80, effect: { needDecay: { nutrients: 0.75 } } }],
  beneficials: [{ price: 90, effect: { pestChance: 0.5 } }],
};

// ---------------------------------------------------------------------------
// Level und Freischaltungen (Auftrag P16)
// ---------------------------------------------------------------------------

/** Erfahrung je abgeschlossener Ernte, egal wie gut. */
export const XP_PER_HARVEST = 50;
/** Zusätzliche Erfahrung je Qualitätsstern der Ernte (5 Sterne = +100). */
export const XP_PER_STAR = 20;

/**
 * Erfahrung, ab der ein Level erreicht ist. Index 0 = Level 1. Eine 3-Sterne-Ernte bringt 110 XP,
 * Level 5 (Auto-Anton) also nach rund 6 Ernten. Über dem letzten Eintrag gibt es kein höheres Level.
 */
export const LEVEL_XP_THRESHOLDS: readonly number[] = [0, 100, 250, 450, 700, 1000, 1400, 1900, 2500, 3200];

// ---------------------------------------------------------------------------
// Tagesziele und Benachrichtigungen (Aufträge P18, P19)
// ---------------------------------------------------------------------------

// Benachrichtigungen (P18)

/** Höchstens so viele Benachrichtigungen pro Kalendertag (Ortszeit). */
export const NOTIFICATIONS_MAX_PER_DAY = 3;

/** Ruhezeit in vollen Stunden Ortszeit: ab `startHour` bis `endHour` am nächsten Morgen keine Benachrichtigung. */
export const NOTIFICATION_QUIET_HOURS = { startHour: 22, endHour: 9 } as const;

/** So viele echte Stunden im Voraus wird geplant. Danach erst wieder beim nächsten Öffnen. */
export const NOTIFICATION_HORIZON_REAL_HOURS = 72;

/** Frühestens so viele Minuten nach dem Schließen der App kommt eine Benachrichtigung. */
export const NOTIFICATION_MIN_DELAY_MINUTES = 30;

/** Warnung vor dem Koma: so viele echte Stunden, bevor COMA_AFTER_REAL_HOURS erreicht ist. */
export const NOTIFICATION_COMA_WARNING_HOURS_BEFORE = 4;

/** Muss eine Warnung wegen der Ruhezeit vorgezogen werden: so viele Minuten vor Beginn der Ruhezeit. */
export const NOTIFICATION_BEFORE_QUIET_MINUTES = 30;

/** Mindestabstand zwischen zwei Benachrichtigungen. Liegen zwei näher beieinander, fällt die unwichtigere weg. */
export const NOTIFICATION_MIN_GAP_MINUTES = 60;

/** Rangfolge, wenn mehr als NOTIFICATIONS_MAX_PER_DAY an einem Tag anstehen (kleiner = wichtiger). */
export const NOTIFICATION_PRIORITY = {
  comaWarning: 0,
  harvestReady: 1,
  thirsty: 2,
  hungry: 3,
  phaseChanged: 4,
} as const;

// Tagesziele (P19)

/**
 * Alle Tagesziele. `kind` sagt, welches Ereignis zählt: `minigameScore` summiert die Punkte eines
 * Spiels (`gameId`), `minigameRounds` zählt Runden in beliebigen Spielen, `care` zählt Pflege-
 * Aktionen aus `careActions`. Sichtbare Texte stehen in strings.ts unter `dailyGoals.goals`.
 */
export const DAILY_GOAL_TEMPLATES = {
  tapHits: { kind: 'minigameScore', gameId: 'tap', target: 40 },
  smashMites: { kind: 'minigameScore', gameId: 'smash', target: 50 },
  dropsCatch: { kind: 'minigameScore', gameId: 'drops', target: 30 },
  jumpHeight: { kind: 'minigameScore', gameId: 'jump', target: 25 },
  playRounds: { kind: 'minigameRounds', target: 3 },
  waterTwice: { kind: 'care', careActions: ['water'], target: 2 },
  petBudi: { kind: 'care', careActions: ['pet'], target: 5 },
  feedBudi: { kind: 'care', careActions: ['fertilize', 'fertilizeGrow', 'fertilizeBloom'], target: 2 },
} as const;

export type DailyGoalId = keyof typeof DAILY_GOAL_TEMPLATES;

/**
 * Ziele, die gerade ausgelost werden, in dieser Reihenfolge reihum (ein Ziel pro Kalendertag).
 * Spiel- und Pflegeziele wechseln sich ab.
 */
export const DAILY_GOAL_POOL: readonly DailyGoalId[] = [
  'smashMites',
  'waterTwice',
  'dropsCatch',
  'petBudi',
  'jumpHeight',
  'feedBudi',
  'playRounds',
  'tapHits',
];

/** Inhalt der Belohnungskiste: Münzen, gleich für jedes Ziel. Feinschliff in P32. */
export const DAILY_GOAL_CHEST_COINS = 60;

// ---------------------------------------------------------------------------
// Kosmetik und Saisonpass (Aufträge P25, P33)
// ---------------------------------------------------------------------------

// Werte hier einfügen, z. B. COSMETIC_ITEMS mit Münzpreis oder Produkt-ID.

// ---------------------------------------------------------------------------
// Audio (Auftrag P30)
// ---------------------------------------------------------------------------

/** Raum-Musik, Pflege-Effekte und Budi-Stimme (src/lib/audio.ts, src/components/budi/voice.ts). */
export const AUDIO = {
  /** Raum-Musik (S10), 0 bis 1. Leiser als die Minigame-Musik, sie läuft im Hintergrund lange mit. */
  roomMusicVolume: 0.25,
  /** Mehrere Phasenwechsel auf einmal (App war lange zu): die Fanfare nur einmal in diesem Abstand. */
  phaseCueGapMs: 3000,
  voice: {
    /** Abspielrate = Tonhöhe. Schlechte Laune tief, gute Laune hoch, dazwischen linear. */
    pitchMin: 0.85,
    pitchMax: 1.25,
    /** Zufällige Abweichung je Laut (±), damit Budi nicht wie ein Automat klingt. */
    pitchJitter: 0.05,
    /** Laune (0 bis 100) ab der Budi fröhlich plappert. */
    happyFromMood: 70,
    /** Laune unter der Budi grummelt. Dazwischen klingt er fragend. */
    grumpyBelowMood: 30,
  },
} as const;

// ---------------------------------------------------------------------------
// Minigames
// ---------------------------------------------------------------------------

/**
 * Münzen aus Minigames (Balancing P23, Rechnung in docs/progress/p23.md): Ziel sind 3 Runden am Tag
 * für ungefähr ein Shop-Upgrade pro Zyklus. Zyklus ≈ 10 echte Tage (TIME_SCALE), also 30 Runden;
 * ein Upgrade kostet im Schnitt 129 Münzen (UPGRADES, 900 Münzen für 7 Stufen). Typische Runden
 * (Smash 30, Tropfen 28, Jump 100+ Punkte) bringen 4, 3 und 8 Münzen, zusammen rund 150 pro Zyklus.
 * Die Obergrenze bremst Jump (Punkte = Höhe / 10, viel höhere Zahlen). Sie muss mindestens die
 * volle Quiz-Runde tragen (60 Punkte = 8 Münzen = 2 × 4, FACT_QUIZ.perfectMultiplier).
 */
export const MINIGAME_REWARDS = {
  coinsPerPoint: 0.14,
  maxCoinsPerRound: 8,
  moodPerRound: 15,
  /** Annahmen für die Rechnung oben, nur für den Balancing-Test (P32 ersetzt sie durch Messwerte). */
  plannedRoundsPerDay: 3,
  typicalScores: { smash: 30, drops: 28, jump: 100 },
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

/** Fakten-Quiz (Auftrag P17). Punkte × coinsPerPoint ergibt die Münzen (P08). */
export const FACT_QUIZ = {
  questionsPerRound: 3,
  pointsPerCorrect: 10,
  /** Bei voller Punktzahl werden die Punkte und damit die Münzen mit diesem Faktor multipliziert. */
  perfectMultiplier: 2,
  durationSeconds: 45,
} as const;
