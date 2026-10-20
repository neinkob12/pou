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

// Minigame-Gerüst und Auswahl-Karten (Auftrag P08)
export const minigameFramework = {
  selectSubtitle: 'Spiel eine Runde, sammle Münzen und mach Budi gute Laune.',
  highscore: 'Rekord',
  noHighscore: 'Noch kein Rekord',
  play: 'Spielen',
  score: 'Punkte',
  timeLeft: 'Zeit',
  pause: 'Pause',
  paused: 'Pause',
  resume: 'Weiter',
  quit: 'Aufhören',
  gameOver: 'Runde vorbei',
  newHighscore: 'Neuer Rekord!',
  coinsEarned: 'Münzen',
  moodBonus: 'Budi freut sich',
  playAgain: 'Nochmal',
  toSelection: 'Zur Auswahl',
  extraLifeQuestion: 'Noch ein Leben?',
  extraLifeAccept: 'Extra-Leben holen',
  extraLifeDecline: 'Nein, Runde beenden',
};

export const minigameCards = {
  tap: 'Tippe die Kreise, bevor sie verschwinden.',
  smash: 'Klatsch die Schädlinge vom Blatt, aber verschone die Marienkäfer.',
  drops: 'Fang Wasser- und Düngertropfen mit dem Topf.',
  jump: 'Hüpf mit Budi von Blatt zu Blatt nach oben.',
  quiz: 'Was weißt du über Pflanzen?',
};

export const tapGame = {
  title: 'Tipp den Kreis',
  circleLabel: 'Kreis',
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
