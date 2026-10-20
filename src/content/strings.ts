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

// Pflege-Gesten und Balken im Raum (P10).
export const care = {
  tools: {
    water: 'Gießkanne (U3)',
    fertilizeGrow: 'Wachstumsdünger (U4)',
    fertilizeBloom: 'Blütendünger (U4)',
  },
  toolPlaceholder: {
    water: 'U3',
    fertilizeGrow: 'U4',
    fertilizeBloom: 'U4',
  },
  toolShort: {
    water: 'Wasser',
    fertilizeGrow: 'Wachstum',
    fertilizeBloom: 'Blüte',
  },
  dragHint: 'Zu Budi ziehen',
  hint: 'Zieh Gießkanne oder Dünger zu Budi. Über Budi wischen zum Streicheln.',
  hintNoPlant: 'Pflanze zuerst einen Samen.',
  hintComa: 'Budi liegt im Koma. Pflege wirkt gerade nicht.',
  hintRest: 'Budi braucht jetzt keine Pflege mehr.',
  petLabel: 'Budi streicheln',
  conditions: {
    ok: 'Budi geht es gut',
    thirsty: 'Budi hat Durst',
    hungry: 'Budi hat Hunger',
    stressed: 'Budi ist gestresst',
    sick: 'Budi ist krank',
    coma: 'Budi liegt im Koma',
  },
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
  sectionTitle: 'Debug',
  sectionHint: 'Nur im Entwicklungs-Build sichtbar.',
  open: 'Debug-Menü öffnen',
  statusTitle: 'Zustand',
  noPlant: 'Keine Pflanze gepflanzt.',
  phaseLabel: 'Phase',
  ageLabel: 'Alter',
  ageUnit: 'Pflanzentage',
  remainingLabel: 'Phase endet in',
  remainingOpen: 'hängt vom Spieler ab',
  coinsLabel: 'Münzen',
  turboLabel: 'Turbo',
  on: 'an',
  off: 'aus',
  barsLabel: 'Balken',
  needLabels: { water: 'Wasser', nutrients: 'Dünger', mood: 'Laune' },
  speedTitle: 'Zeitraffer',
  speedHint: 'Läuft über den debugMultiplier der Zeit-Engine.',
  skipTitle: 'Vorspulen',
  skipUnit: 'Tage',
  plantTitle: 'Pflanze',
  plantSeed: 'Samen pflanzen',
  flipLight: 'Licht auf 12/12',
  harvest: 'Ernten',
  coinsTitle: 'Münzen geben',
  turboOn: 'Turbo an',
  turboOff: 'Turbo aus',
  resetTitle: 'Spielstand',
  reset: 'Spielstand zurücksetzen',
  resetConfirm: 'Nochmal tippen zum Bestätigen',
  pendingTitle: 'Kommt später',
  setBars: 'Balken setzen',
  unlockStrains: 'Alle Sorten freischalten',
  pendingHint: 'Wartet auf den zuständigen Auftrag.',
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

// Benachrichtigungen (P18): Texte in Budis Stimme und der Einstellungs-Abschnitt.
export const notifications = {
  channelName: 'Budi meldet sich',
  thirsty: [
    { title: 'Budi hat Durst', body: 'Meine Erde ist trockener als dein Humor. Gießkanne, bitte!' },
    { title: 'Hallo? Wasser?', body: 'Ich bin eine Pflanze, kein Kaktus. Gieß mich mal.' },
  ],
  hungry: [
    { title: 'Budi hat Hunger', body: 'Mein Magen knurrt. Also, meine Wurzeln. Dünger wäre nett.' },
    { title: 'Nährstoff-Alarm', body: 'Ich wachse hier nicht von Luft und Liebe. Na gut, ein bisschen schon.' },
  ],
  comaWarning: [
    { title: 'Budi kippt gleich um', body: 'Mir wird schummrig. Schau bitte schnell nach mir!' },
    { title: 'Letzter Aufruf!', body: 'Noch ein paar Stunden ohne dich und ich mach den Abgang. Dramatisch, aber wahr.' },
  ],
  harvestReady: [
    { title: 'Budi ist erntebereit', body: 'Ich bin fertig! Schnapp dir die Lupe und schau mich an.' },
    { title: 'Ernte-Zeit!', body: 'Ich hab alles gegeben. Jetzt bist du dran.' },
  ],
  phaseChanged: (phaseLabel: string) => ({
    title: `Budi ist jetzt: ${phaseLabel}`,
    body: 'Ich bin gewachsen! Komm gucken, bevor ich angebe.',
  }),
  settingsTitle: 'Benachrichtigungen',
  settingsToggle: 'Budi darf sich melden',
  settingsHint: 'Höchstens 3 pro Tag, nie zwischen 22 und 9 Uhr.',
  settingsDenied: 'Dein Handy blockiert Benachrichtigungen. Erlaube sie in den Systemeinstellungen.',
  settingsOpenSystem: 'Systemeinstellungen öffnen',
};
