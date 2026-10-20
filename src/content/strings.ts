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

// Krankheiten im Raum: Schädlinge, Schimmel, Koma (P21).
export const health = {
  pests: {
    spiderMite: 'Spinnmilbe',
    fungusGnat: 'Trauermücke',
  },
  pestPlaceholder: {
    spiderMite: 'U17',
    fungusGnat: 'U17',
  },
  pestLabel: (name: string) => `${name} wegtippen`,
  mold: 'Schimmel',
  moldPlaceholder: 'U17',
  moldLabel: (coins: number) => `Schimmel behandeln, ${coins} Münzen`,
  moldTooPoor: 'Zu wenig Münzen gegen den Schimmel',
  comaTitle: 'Budi liegt im Koma',
  comaText: 'Zu lange ohne Pflege. Hol Budi zurück!',
  revive: (coins: number) => `Wiederbeleben · ${coins} Münzen`,
  reviveTooPoor: 'Zu wenig Münzen',
  reviveAd: 'Mit Video wiederbeleben (bald)',
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

// Tropfen fangen (Auftrag P13)
export const dropsGame = {
  lives: 'Leben',
  water: 'Wasser',
  nutrients: 'Nährstoffe',
  hint: 'Wisch den Topf hin und her. Fang Wasser und Dünger, meide Salz!',
  rewardTitle: 'Budis Balken',
  noReward: 'Ohne Pflanze, im Trocknen oder im Koma füllen sich keine Balken.',
  waterLabel: 'Wassertropfen',
  fertilizerLabel: 'Dünger',
  saltLabel: 'Salz',
  potLabel: 'Topf',
};

// Budi Jump (Auftrag P14)
export const jumpGame = {
  hintTilt: 'Neig das Handy, damit Budi zur Seite hüpft.',
  hintTap: 'Halt links oder rechts gedrückt, damit Budi zur Seite hüpft.',
  tiltUnavailable: 'Kein Bewegungssensor gefunden. Budi hört aufs Tippen.',
  controlsTitle: 'Steuerung bei Budi Jump',
  controlTilt: 'Neigen',
  controlTap: 'Tippen',
  controlsHint: 'Neigen: Handy kippen. Tippen: linke oder rechte Bildschirmhälfte halten.',
  lights: 'Licht',
  recordMark: 'Rekord',
};

export const smashGame = {
  title: 'Schädlings-Smash',
  mite: 'Spinnmilbe',
  gnat: 'Trauermücke',
  ladybug: 'Marienkäfer: verschonen!',
  combo: 'Kombo',
  protectionHint: (minScore: number) => `Ab ${minScore} Punkten: Schädlingsschutz für Budi`,
  protectionEarned: 'Budi ist jetzt einen Tag vor Schädlingen geschützt!',
  leafLabel: 'Blatt',
};

export const shop = {
  title: 'Shop',
  upgradesTab: 'Upgrades',
  cosmeticsTab: 'Kosmetik',
  cosmeticsEmpty: 'Hüte, Brillen und Topf-Skins für Budi kommen bald.',
  coinsLabel: (coins: number) => `${coins} Münzen`,
  buy: (price: number) => `Kaufen: ${price}`,
  upgradeTo: (level: number, price: number) => `Stufe ${level}: ${price}`,
  owned: 'Gekauft',
  level: (level: number, max: number) => `Stufe ${level} von ${max}`,
  notEnoughCoins: 'Zu wenig Münzen',
  upgrades: {
    pot: {
      name: 'Größerer Topf',
      text: 'Mehr Platz für die Wurzeln: Wasser sinkt langsamer, mehr Ertrag.',
    },
    led: {
      name: 'LED-Lampe',
      text: 'Spart Strom: der Lichtbalken sinkt langsamer.',
    },
    fanDehumidifier: {
      name: 'Ventilator und Entfeuchter',
      text: 'Trockene Luft beim Trocknen: kein Schimmel.',
    },
    bioSoil: {
      name: 'Bio-Erde und Spezialdünger',
      text: 'Lockere Erde hält Nährstoffe länger.',
    },
    beneficials: {
      name: 'Nützlings-Kit',
      text: 'Raubmilben fressen Schädlinge: weniger Plagegeister.',
    },
  },
  /** Kurzlabel im Raum, solange Grafiken fehlen. */
  roomLabels: {
    pot: (level: number) => `Topf ${level}`,
    led: 'LED',
    fanDehumidifier: 'Lüfter',
    bioSoil: 'Bio-Erde',
    beneficials: 'Nützlinge',
  },
};

export const album = {
  title: 'Album',
  strainsTab: 'Sorten',
  knowledgeTab: 'Wissen',
};

export const facts = {
  progress: (unlocked: number, total: number) => `${unlocked} von ${total} Karten gesammelt`,
  lockedTitle: 'Noch gesperrt',
  lockedHint: (phase: string) => `Budi verrät sie in der Phase ${phase}.`,
  phaseLabel: (phase: string) => `Phase: ${phase}`,
  sourceLabel: (source: string) => `Quelle: ${source}`,
  openSource: 'Quelle öffnen',
  popupTitle: 'Psst, Budi weiß was!',
  popupIntro: 'Ich hab gerade was Neues über mich gelernt:',
  popupMore: (count: number) => `Noch ${count} weitere Karte${count === 1 ? '' : 'n'} warten.`,
  popupNext: 'Nächste Karte',
};

export const factQuiz = {
  questionCounter: (n: number, total: number) => `Frage ${n} von ${total}`,
  correct: 'Richtig! Budi ist stolz auf dich.',
  wrong: (answer: string) => `Knapp daneben. Richtig wäre: ${answer}`,
  next: 'Nächste Frage',
  finish: 'Auswerten',
  perfectHint: 'Alles richtig: doppelte Münzen!',
  notEnoughTitle: 'Noch zu wenig Wissen',
  notEnoughText: (needed: number) =>
    `Budi braucht mindestens ${needed} Karten fürs Quiz. Pflege ihn weiter, bei jedem Phasenwechsel verrät er dir etwas Neues.`,
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
  setBars: 'Balken setzen',
  strainsTitle: 'Sorten',
  unlockStrains: 'Alle Sorten freischalten',
  unlockEventStrain: 'Kölsche Knospe freischalten',
};

/** Ernte-Ablauf (P24): Lupe, Schere, Trocknen, Abschluss. */
export const harvestScreen = {
  title: 'Ernte',
  noPlant: 'Der Topf ist leer.',
  toSeedSelect: 'Samen wählen',
  notReady: 'Budi ist noch nicht erntereif. Schau wieder vorbei, wenn er "Erntebereit" ist.',
  toRoom: 'Zurück zu Budi',
  lupeTitle: 'Trichom-Lupe',
  lupeIntro: 'Unter der Lupe glitzern kleine Köpfchen. Tippe alle milchigen an, dann weißt du, ob Budi reif ist.',
  lupeLegendClear: 'klar: noch zu früh',
  lupeLegendMilky: 'milchig: genau richtig',
  lupeLegendAmber: 'bernstein: schon spät',
  lupeLabel: 'Lupe (U7)',
  lupeHeadLabel: (n: number) => `Köpfchen ${n}`,
  lupeDone: 'Fertig geschaut',
  lupeSkip: 'Ohne Lupe weiter',
  lupeResult: (percent: number) => `Lupen-Ergebnis: ${percent} %`,
  lupeLate: 'Budi wartet schon lange. Viele Köpfchen sind bernsteinfarben.',
  cutTitle: 'Schere ansetzen',
  cutIntro: 'Wisch mit der Schere quer über den Stiel.',
  cutScissors: 'Schere (U8)',
  cutStem: 'Budis Stiel',
  dryingTitle: 'Trocknen',
  dryingIntro: 'Budis Zweige hängen kopfüber im Trockenraum. Wende sie ab und zu, dann trocknen sie gleichmäßig.',
  dryingRoom: 'Trockenraum (H3)',
  dryingBranches: 'Zweige an der Leine (B7)',
  dryingTurn: 'Zweige wenden',
  dryingTurned: 'In diesem Abschnitt schon gewendet',
  dryingTurns: (done: number, total: number) => `Gewendet: ${done} von ${total}`,
  dryingDone: 'Fertig getrocknet!',
  collect: 'Einsammeln',
  summaryTitle: 'Ernte fertig!',
  summaryCrate: 'Erntekiste (B8)',
  summaryStars: (stars: number) => `${stars} von 5 Sternen`,
  starFull: '★',
  starEmpty: '☆',
  summaryYield: (units: number) => `${units} Ertragseinheiten`,
  summaryMarket: 'Der Kräutermarkt zahlt',
  summaryCoins: (coins: number) => `${coins} Münzen`,
  summaryFragments: (n: number) => (n === 1 ? '1 Samen-Fragment' : `${n} Samen-Fragmente`),
  summaryNoFragments: 'Keine Samen-Fragmente, beim nächsten Mal mehr Sterne holen.',
  summaryNewStrain: (name: string) => `Neue Sorte freigeschaltet: ${name}`,
  summaryCoinsDoubled: 'Münzen verdoppelt!',
  summaryNext: 'Neuen Samen wählen',
  entryReady: 'Ernten',
  entryDrying: 'Zum Trockenraum',
  entryDone: 'Einsammeln',
  entrySummary: 'Ernte ansehen',
  entryEmpty: 'Samen pflanzen',
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

// Erststart (P26): Altersfrage und Tutorial. Vorschlag des Auftrags, Chef kann umformulieren.
export const onboarding = {
  title: 'Willkommen',
  age: {
    title: 'Willkommen bei PotPou',
    intro: 'PotPou ist ein Pflanzenspiel für Erwachsene. Du pflegst Budi vom Samen bis zur Ernte.',
    question: 'Bist du mindestens 18 Jahre alt?',
    yes: 'Ja, ich bin 18 oder älter',
    no: 'Nein',
  },
  declined: {
    title: 'Bis bald!',
    text: 'PotPou gibt es erst ab 18. Budi wünscht dir bis dahin alles Gute und viel Sonne.',
  },
  tutorial: {
    stepCounter: (step: number, total: number) => `${step} von ${total}`,
    next: 'Weiter',
    skip: 'Überspringen',
    done: "Los geht's",
    steps: {
      plant: {
        title: 'Dein erster Samen',
        text: 'Pflanz einen Samen in den Topf. Daraus wächst Budi, in Echtzeit.',
        action: 'Samen pflanzen',
      },
      water: {
        title: 'Gießen',
        text: 'Zieh die Gießkanne unten zu Budi und lass es regnen. Probier es gleich aus.',
      },
      bars: {
        title: 'Die Balken',
        text: 'Oben siehst du Wasser, Nährstoffe, Licht und Laune. Sinkt ein Balken, braucht Budi dich. Budi wächst auch weiter, wenn die App zu ist.',
      },
      minigames: {
        title: 'Minigames',
        text: 'Unter "Spiele" sammelst du Münzen und machst Budi gute Laune.',
        action: 'Zeig mal',
      },
    },
  },
};

// Rechtliche Links in den Einstellungen (P26).
export const legal = {
  title: 'Rechtliches',
  imprint: 'Impressum',
  privacy: 'Datenschutz',
};

/** Platzhalter, bis der Chef die echten Adressen liefert (P26, siehe docs/progress/p26.md). */
export const legalUrls = {
  imprint: 'https://example.com/potpou/impressum',
  privacy: 'https://example.com/potpou/datenschutz',
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
