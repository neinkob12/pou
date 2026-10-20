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
