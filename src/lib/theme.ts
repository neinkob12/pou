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
