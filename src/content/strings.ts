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

// Licht-Schalter, Tag/Nacht und Phasenwechsel (Auftrag P11).
export const lightPhase = {
  schedule: {
    '18/6': 'Licht 18/6',
    '12/12': 'Licht 12/12',
    off: 'Licht aus',
  },
  autoflower: 'Autoflower: blüht von selbst',
  switchLabel: 'Auf 12/12 umschalten',
  switchLockedFrom: (day: number, now: number) => `Umschalten ab Tag ${day} (jetzt Tag ${now})`,
  flipTitle: 'Blüte starten?',
  flipText:
    'Mit 12 Stunden Licht und 12 Stunden Dunkelheit beginnt Budi zu blühen. Wartest du länger, wächst Budi größer und bringt mehr Ertrag, braucht aber mehr Zeit.',
  flipConfirm: 'Jetzt umschalten',
  lampOn: 'Lampe an',
  lampOff: 'Lampe aus',
  night: 'Nacht',
  disturbed: 'Pssst! Budi braucht in der Blüte ungestörte Dunkelheit.',
  phaseChangedTitle: 'Neue Phase!',
  phaseChanged: {
    germination: 'Budi keimt!',
    seedling: 'Budi ist jetzt ein Sämling!',
    vegetative: 'Budi wächst jetzt richtig los!',
    flowering: 'Budi blüht jetzt!',
    ready: 'Budi ist bereit zur Ernte!',
    drying: 'Budi hängt jetzt zum Trocknen.',
    done: 'Budi ist fertig getrocknet!',
  },
  puff: 'Puff (Effekt)',
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
};

export const onboarding = {
  title: 'Willkommen',
};
