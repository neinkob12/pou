// PotPou Theme: Farben (DESIGN_GUIDE D3), Schriften (D5), Abstände, Radien.
// Komponenten nehmen Werte nur von hier, nie als Literal. Tailwind liest dieselben Farben
// (tailwind.config.js), damit NativeWind-Klassen wie `bg-cream` zur Palette passen.

export const colors = {
  plantLight: '#7BC96F', // Frisches Grün
  plantDark: '#2F5D3A', // Waldgrün, Konturen
  cream: '#FFF4E0', // Hintergrund
  lamp: '#FFD45C', // Lampenlicht
  terracotta: '#C9734A', // Erde, Topf
  coral: '#FF7A8A', // Akzent 1: Buttons, Münzen
  lavender: '#A98BE8', // Akzent 2: Seltenheit, Blüte
  ink: '#2B2B2B', // Text
  night: '#2A3157', // Nacht
  white: '#FFFFFF',
  inkMuted: '#6B6B6B', // Nebentext, inaktive Tabs
} as const;

export type ColorName = keyof typeof colors;

/** Schriftnamen, wie sie in app/_layout.tsx mit useFonts geladen werden. */
export const fonts = {
  heading: 'Fredoka_600SemiBold',
  headingBold: 'Fredoka_700Bold',
  body: 'Nunito_400Regular',
  bodyBold: 'Nunito_700Bold',
} as const;

export const fontSizes = {
  sm: 13,
  md: 16,
  lg: 20,
  xl: 26,
  xxl: 34,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const radii = {
  sm: 8,
  md: 14,
  lg: 22,
  pill: 999,
} as const;

export const theme = { colors, fonts, fontSizes, spacing, radii } as const;

// --- WEB-5: Oberfläche (Screens, Karten, Knöpfe, Rahmen) ---
// Ein gemeinsames System für alle Screens rund um die Spielwelt. Karten und Knöpfe tragen dieselbe
// dunkelgrüne Kontur und Kante unten wie Budi und die Zimmer-Leisten (WEB-1).
export const surface = {
  /** Breite der Kontur von Karten und Knöpfen. */
  line: 2,
  /** Kante unten: Karten wirken wie Sticker, Knöpfe sinken beim Drücken ein. */
  edge: 4,
  /** Innenabstand und Lücke zwischen Karten auf allen Screens. */
  screenPadding: spacing.md,
  gap: spacing.md,
  /** Hintergrund leicht abgedunkelt für gesperrte oder leere Karten. */
  cardMuted: '#FBE9CB',
  cardEdgeMuted: '#E3CFA9',
  /** Weiche Tönung hinter Highlights (Ernte, neue Sorte). */
  glow: 'rgba(255,212,92,0.45)',
  glowFade: 'rgba(255,212,92,0)',
  coralSoft: '#FFE1E5',
  lavenderSoft: '#ECE4FB',
  leafSoft: '#E3F4DE',
  lampSoft: '#FFF1BF',
  /** Rahmen der Web-Version am Rechner. */
  frameBgTop: '#24492E',
  frameBgBottom: '#16301E',
  frameDot: 'rgba(123,201,111,0.10)',
  frameShell: '#1B1B1B',
  frameShellLight: '#3A3A3A',
} as const;

// --- WEB-1: Zeichenfarben für Budi und Zimmer (Skia) ---
// Abstufungen der Palette für Schatten, Lichtkanten und Details. Nur Grafik, kein Spielwert.
export const artColors = {
  outline: colors.plantDark,
  leaf: colors.plantLight,
  leafShade: '#5DAE55',
  leafLight: '#A6E39A',
  leafVein: '#4E9A49',
  stem: '#5DAE55',
  soil: '#6B4430',
  soilLight: '#8A5A3E',
  pot: colors.terracotta,
  potShade: '#A95C3A',
  potLight: '#E39A72',
  potRim: '#D9825A',
  cheek: '#FF9DA8',
  eye: '#2B2B2B',
  iris: '#6B4A3A',
  eyeShine: colors.white,
  mouth: '#7A2F3A',
  tongue: '#FF7A8A',
  sweat: '#8FD3FF',
  sick: '#B9D98A',
  bud: '#9ED88E',
  budShade: '#6FBF63',
  pistil: '#FFFFFF',
  pistilRipe: '#F2A65A',
  frost: '#FFFFFF',
  seed: '#B98A5E',
  wood: '#C48A55',
  woodShade: '#9C6638',
  string: '#8A6A4A',
  zzz: colors.lavender,
  // Zimmer
  wallDayTop: '#FFE9C7',
  wallDayBottom: '#FFF4E0',
  wallNightTop: '#1E2444',
  wallNightBottom: '#2A3157',
  wallPattern: '#F5D9AE',
  wallPatternNight: '#343C68',
  floor: '#D9A46E',
  floorShade: '#C08955',
  floorNight: '#5A4A5E',
  floorNightShade: '#4A3D50',
  skyDayTop: '#8FD3FF',
  skyDayBottom: '#D8F1FF',
  skyNightTop: '#121735',
  skyNightBottom: '#33407A',
  sun: colors.lamp,
  moon: '#FFF2C4',
  cloud: colors.white,
  curtain: colors.coral,
  curtainShade: '#E6606F',
  rug: colors.lavender,
  rugShade: '#8F70D6',
  glow: colors.lamp,
  glowSoft: 'rgba(255,212,92,0.55)',
  glowFade: 'rgba(255,212,92,0)',
  metal: '#5B6B7A',
  metalLight: '#8B9CAB',
  mold: '#E8E6D9',
  // Gegenstände (WEB-4): Kiste, Töpfe, Shop-Upgrades, Accessoires
  gold: '#F5C443',
  goldShade: '#D99A2B',
  glaze: '#7FB8E6',
  glazeShade: '#4F8FC4',
  lens: '#CFEFFF',
  ladybug: '#E8454F',
  sack: '#E2C392',
  sackShade: '#BF9A66',
  plastic: '#F4F1EA',
  plasticShade: '#D6D0C4',
  cabinet: '#3A3350',
  cabinetShade: '#2A2440',
  ribbon: colors.coral,
  ribbonShade: '#E6606F',
  denim: '#4C6FB8',
  straw: '#E9C87A',
  strawShade: '#C9A452',
  // Zimmer-Licht (WEB-4)
  moonGlow: 'rgba(200,215,255,0.55)',
  moonGlowFade: 'rgba(200,215,255,0)',
  shadow: 'rgba(47,41,60,0.18)',
  shadowNight: 'rgba(10,12,30,0.45)',
  shadowFade: 'rgba(47,41,60,0)',
  rugNight: '#5E4A8C',
  rugNightShade: '#46376E',
} as const;

// Minigame-Farben (Auftrag 40, WEB-2): hellere und dunklere Töne der Palette für Hintergründe,
// Figuren und Effekte. Wasser bekommt ein eigenes Blau, die Palette hat keins.
export const gameColors = {
  creamDeep: '#FBE3BC',
  lampLight: '#FFF1BF',
  lavenderLight: '#DCCFF7',
  coralLight: '#FFC4CC',
  leafLight: '#A9DE9C',
  leafVein: '#5DA455',
  soil: '#7A4A30',
  water: '#5DB7E8',
  waterDark: '#2F7FB8',
  sky: '#DDF0F8',
  salt: '#F6F6F2',
} as const;

// Sonder-Elemente der Minigames (Auftrag 45, WEB-7): Gold für Bonus-Figuren, Panzer der Milbe.
export const funColors = {
  gold: '#F5B82E',
  goldDeep: '#B9800F',
  goldLight: '#FFE7A3',
  shell: '#8C6A5A',
  shellLight: '#B89786',
} as const;

// --- ART-1: Spiel-Look (Auftrag 46) ---
// Grundlage aller Bausteine in src/components/ui: satte Farben mit Verlauf (hell oben, dunkel
// unten), dicke dunkle Kontur, Kante unten für den 3D-Knopf, weicher Schlagschatten, Glanzlicht.
// Andere ART-Aufträge hängen eigene Abschnitte unten an und ändern diesen nicht.

/** Ein Farbton in vier Stufen: Glanz oben, Fläche, Verlauf unten, Kante (Unterseite des Knopfs). */
export interface Tone {
  light: string;
  base: string;
  dark: string;
  edge: string;
  /** Text auf dieser Fläche. */
  text: string;
}

export const tones = {
  coral: { light: '#FFA3AE', base: '#FF6F82', dark: '#EE4D66', edge: '#B8304A', text: colors.white },
  leaf: { light: '#A8E68D', base: '#62C64F', dark: '#45A738', edge: '#2C7526', text: colors.white },
  gold: { light: '#FFE58A', base: '#FFCB3D', dark: '#F5A91E', edge: '#C47A0C', text: '#5A3A06' },
  sky: { light: '#A6E4FF', base: '#4FB8F2', dark: '#2E98DC', edge: '#1D6AA3', text: colors.white },
  grape: { light: '#CDB8FF', base: '#A27CF0', dark: '#8458DC', edge: '#5E3BAE', text: colors.white },
  danger: { light: '#FF9A86', base: '#F4573F', dark: '#DB3A2B', edge: '#9F221A', text: colors.white },
  cream: { light: '#FFFFFF', base: '#FFF6E6', dark: '#F6E2C0', edge: '#CDB08A', text: colors.ink },
  stone: { light: '#F1EDE6', base: '#DAD3C8', dark: '#C4BBAE', edge: '#9C9285', text: '#7C7368' },
  night: { light: '#4A5590', base: '#343E72', dark: '#262E5A', edge: '#151A38', text: colors.white },
} as const satisfies Record<string, Tone>;

export type ToneName = keyof typeof tones;

/** Dicke dunkle Kontur um alles, was man anfassen kann. */
export const outline = {
  color: '#1F3A27',
  thin: 2,
  regular: 3,
  thick: 4,
} as const;

/** Tiefe der Kante unten: so weit sinkt ein Knopf beim Tippen ein. */
export const depth = {
  sm: 3,
  md: 5,
  lg: 7,
} as const;

/** Weiche Schlagschatten (CSS-boxShadow, nativ ab RN 0.76 und im Web gleich). */
export const shadows = {
  button: '0 3px 4px rgba(31,58,39,0.28)',
  card: '0 6px 14px rgba(31,58,39,0.18)',
  pop: '0 18px 40px rgba(20,24,40,0.38)',
  inset: 'inset 0 2px 3px rgba(31,58,39,0.25)',
} as const;

/** Glanzlicht oben auf Knöpfen, Leisten und Münzen. */
export const gloss = {
  color: colors.white,
  opacity: 0.55,
  /** Anteil der Höhe, den der helle obere Verlauf einnimmt. */
  topShare: 0.5,
} as const;

/** Rundungen im Spiel-Look: weicher und größer als in einer App. */
export const gameRadii = {
  chip: 12,
  button: 18,
  card: 24,
  modal: 30,
  pill: 999,
} as const;

/**
 * Zwei Schriften: Fredoka Bold für Titel und Zahlen (rund, verspielt), Nunito für Fließtext
 * (gut lesbar). Titel tragen einen dunklen Schlagschatten wie Spielschrift.
 */
export const typography = {
  display: { fontFamily: fonts.headingBold, fontSize: 40, lineHeight: 44 },
  title: { fontFamily: fonts.headingBold, fontSize: 28, lineHeight: 32 },
  heading: { fontFamily: fonts.headingBold, fontSize: 22, lineHeight: 26 },
  button: { fontFamily: fonts.headingBold, fontSize: 18, lineHeight: 22 },
  buttonSm: { fontFamily: fonts.headingBold, fontSize: 15, lineHeight: 18 },
  number: { fontFamily: fonts.headingBold, fontSize: 18, lineHeight: 22 },
  body: { fontFamily: fonts.body, fontSize: 16, lineHeight: 22 },
  bodyBold: { fontFamily: fonts.bodyBold, fontSize: 16, lineHeight: 22 },
  small: { fontFamily: fonts.bodyBold, fontSize: 12, lineHeight: 15 },
} as const;

export type TypeStyle = keyof typeof typography;

/** Dunkler Schatten unter heller Spielschrift, damit sie auf jeder Farbe steht. */
export const textShadow = {
  color: 'rgba(31,58,39,0.55)',
  offset: { width: 0, height: 2 },
  radius: 0,
} as const;

/** Federn für Reanimated: alles bewegt sich mit Überschwingen, nichts springt hart. */
export const springs = {
  /** Einsinken beim Drücken: schnell und straff. */
  press: { damping: 18, stiffness: 520, mass: 0.6 },
  /** Loslassen: federt mit Überschwingen zurück. */
  release: { damping: 9, stiffness: 320, mass: 0.7 },
  /** Aufploppen von Modals, Badges, Münzen. */
  pop: { damping: 11, stiffness: 240, mass: 0.8 },
  /** Füllen von Leisten. */
  fill: { damping: 16, stiffness: 120, mass: 1 },
} as const;

/** Wie stark ein Knopf beim Drücken staucht (Squash) und beim Loslassen überschwingt (Stretch). */
export const pressScale = {
  down: 0.95,
  up: 1.04,
} as const;

/** Kartenflächen im Spiel-Look: zarter Verlauf oben hell, Kontur und dicke Unterkante. */
export const cardTones = {
  plain: { top: '#FFFFFF', bottom: '#FFF6E6', border: outline.color },
  muted: { top: '#FBEBD0', bottom: '#F3DDB8', border: '#CDB08A' },
  success: { top: '#EEFAE6', bottom: '#D6F0C9', border: outline.color },
  rare: { top: '#F4EEFF', bottom: '#E2D6FB', border: outline.color },
  highlight: { top: '#FFF8D6', bottom: '#FFE9A3', border: outline.color },
  night: { top: '#3E4880', bottom: '#2A3157', border: '#151A38' },
} as const;

/** Innenkante oben (Licht) und Rinne der Leisten. */
export const insets = {
  highlight: 'inset 0 3px 0 rgba(255,255,255,0.75)',
  barTrack: '#E8D3B0',
  barTrackLight: '#F3E4CB',
} as const;

/** Abdunklung hinter Popups. */
export const overlay = {
  backdrop: 'rgba(20,24,40,0.55)',
} as const;
