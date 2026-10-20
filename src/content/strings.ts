// Alle sichtbaren Texte der App. Büro-Regel: ein Objekt je Screen oder Bereich, jeder Auftrag
// ergänzt nur sein eigenes Objekt. Keine Texte direkt in Komponenten.

export const common = {
  appName: 'PotPou',
  placeholder: 'Platzhalter',
  comingSoon: 'Kommt bald',
  back: 'Zurück',
};

export const tabs = {
  room: 'Budi',
  minigames: 'Spiele',
  shop: 'Shop',
  album: 'Album',
  settings: 'Einstellungen',
};

export const room = {
  title: 'Budis Zimmer',
  background: 'Hintergrund (H1)',
  lamp: 'Lampe (U2)',
  pot: 'Topf (U1)',
  plant: 'Budi',
  noPlant: 'Noch kein Samen gepflanzt',
  remainingHours: (hours: number) => `noch ${hours} Std.`,
  remainingLessThanHour: 'noch unter 1 Std.',
  openEnd: 'Du entscheidest',
  readyToHarvest: 'Bereit zur Ernte',
  needs: {
    water: 'Wasser',
    nutrients: 'Nährstoffe',
    light: 'Licht',
    mood: 'Laune',
  },
  actions: {
    water: 'Gießen',
    fertilize: 'Düngen',
    fertilizeGrow: 'Wachstumsdünger',
    fertilizeBloom: 'Blütendünger',
    pet: 'Streicheln',
  },
  nav: {
    minigames: 'Spiele',
    shop: 'Shop',
    album: 'Album',
    settings: 'Einstellungen',
  },
  coinsLabel: (coins: number) => `${coins} Münzen`,
};

export const modal = {
  close: 'Schließen',
};

export const minigames = {
  title: 'Minispiele',
  tap: 'Tippen',
  smash: 'Schädlinge klatschen',
  drops: 'Tropfen fangen',
  jump: 'Hüpfen',
  quiz: 'Pflanzen-Quiz',
};

export const shop = {
  title: 'Shop',
};

export const album = {
  title: 'Album',
  strainsTab: 'Sorten',
  knowledgeTab: 'Wissen',
};

export const settings = {
  title: 'Einstellungen',
  aboutTitle: 'Über',
  aboutText: 'PotPou: Pflege Budi vom Samen bis zur Ernte.',
  versionLabel: 'Version',
  devTitle: 'Entwicklung',
};

export const debug = {
  title: 'Debug-Menü',
};

export const harvestScreen = {
  title: 'Ernte',
};

export const seedSelect = {
  title: 'Samen wählen',
  intro: 'Welcher Samen kommt in den Topf?',
  plant: 'Pflanzen',
  potBusy: 'Budi ist noch nicht fertig. Erst ernten und trocknen, dann kommt ein neuer Samen.',
};

/** Sorten-Album und Level (P16). */
export const strainsAlbum = {
  level: (level: number) => `Level ${level}`,
  xp: (into: number, needed: number) => `${into} / ${needed} XP`,
  maxLevel: 'Höchstes Level erreicht',
  seedFragments: (count: number) => `${count} Samen-Fragmente`,
  harvests: (count: number) => `${count} Ernten`,
  locked: 'Gesperrt',
  unlocked: 'Freigeschaltet',
  floweringWeeks: (weeks: number) => `${weeks} Wochen Blüte`,
  autoflower: 'Autoflower',
  portrait: (name: string) => `${name} (U15)`,
  rarity: {
    common: 'Gewöhnlich',
    rare: 'Selten',
    epic: 'Episch',
    speed: 'Schnell',
    legendary: 'Legendär',
  },
  special: {
    gustav: 'Pflegeleicht und gutmütig. Perfekt für den Anfang.',
    lotte: 'Färbt sich in der Blüte lila und bringt mehr Münzen.',
    sascha: 'Wird riesig und braucht lange, dafür viel Ertrag.',
    anton: 'Blüht von selbst, ganz ohne Lichtwechsel. Kleiner, aber flott.',
    koelsch: 'Spricht Kölsch und ist besonders wertvoll.',
  },
  unlockHint: {
    start: 'Von Anfang an dabei',
    harvests: (current: number, target: number) => `Freischalten: ${current} / ${target} Ernten`,
    seedFragments: (current: number, target: number) => `Freischalten: ${current} / ${target} Samen-Fragmente`,
    level: (target: number) => `Freischalten: ab Level ${target}`,
    event: 'Freischalten: nur bei einem besonderen Ereignis',
  },
};

export const onboarding = {
  title: 'Willkommen',
};
