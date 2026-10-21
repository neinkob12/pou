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
