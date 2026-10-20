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
};

export const onboarding = {
  title: 'Willkommen',
};
