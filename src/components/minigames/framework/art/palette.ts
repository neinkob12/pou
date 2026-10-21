// Farben der Minigame-Grafik (Auftrag 51, ART-6): satte Casual-Game-Farben mit Licht- und
// Schattenton je Fläche und einer dunklen Kontur. Eigene Datei, damit theme.ts (ART-1) frei bleibt.
// Jede Fläche hat drei Töne: `light` oben (Glanz), `base`, `dark` unten (Schatten, Kontur).

export interface Tone {
  light: string;
  base: string;
  dark: string;
}

export const ink = {
  /** Dicke Kontur um Figuren und Objekte. */
  outline: '#2A1E3A',
  /** Weicher Schlagschatten unter Figuren. */
  shadow: 'rgba(30,20,50,0.28)',
  shadowFade: 'rgba(30,20,50,0)',
  shine: 'rgba(255,255,255,0.85)',
  shineSoft: 'rgba(255,255,255,0.35)',
  eyeWhite: '#FFFFFF',
  pupil: '#1E1830',
  cheek: 'rgba(255,110,140,0.55)',
} as const;

export const tones = {
  leaf: { light: '#B6F07A', base: '#5DC24A', dark: '#2E7D32' },
  leafDeep: { light: '#7FD45E', base: '#3E9E3A', dark: '#1F5E25' },
  mint: { light: '#D8FFB0', base: '#93E36A', dark: '#4E9E3A' },
  mite: { light: '#FF9F6E', base: '#E8553A', dark: '#9C2A1E' },
  gnat: { light: '#8A86C8', base: '#4B4589', dark: '#211D4A' },
  wing: { light: '#F2FBFF', base: '#BFE6FF', dark: '#6FB4E0' },
  ladybug: { light: '#FF8A8A', base: '#F0323C', dark: '#9A0E1E' },
  shell: { light: '#E8C48A', base: '#B9864C', dark: '#6E4A22' },
  gold: { light: '#FFF4A8', base: '#FFC928', dark: '#C77A00' },
  petal: { light: '#F3D9FF', base: '#C08BFF', dark: '#7A3FD0' },
  petalPink: { light: '#FFE0EE', base: '#FF8FC0', dark: '#C2457E' },
  bloomCore: { light: '#FFF6B0', base: '#FFCF3A', dark: '#D98A00' },
  water: { light: '#D4F4FF', base: '#3FB8FF', dark: '#1A6FC4' },
  fertilizer: { light: '#E2FFB8', base: '#7FDB4A', dark: '#2F8A2A' },
  salt: { light: '#FFFFFF', base: '#DDE6F2', dark: '#7D8AA6' },
  pot: { light: '#FFB27E', base: '#E07642', dark: '#8E3B1C' },
  soil: { light: '#9A6A4A', base: '#6B4430', dark: '#3E2518' },
  wood: { light: '#E6A86A', base: '#B8743E', dark: '#6E3F1C' },
  spring: { light: '#E6D6FF', base: '#A57CFF', dark: '#5B33B8' },
  breaking: { light: '#F2C07A', base: '#C98A4A', dark: '#7A4A20' },
  budi: { light: '#C4F59A', base: '#6FD04F', dark: '#2E7D32' },
  sun: { light: '#FFFBD0', base: '#FFD23A', dark: '#E08A00' },
  coral: { light: '#FFC2CB', base: '#FF6B81', dark: '#C2324C' },
} as const satisfies Record<string, Tone>;

/** Himmel und Hintergründe je Spiel (oben, Mitte, unten). */
export const backdrops = {
  tap: ['#FFE7B8', '#FFC7A8', '#FF9FB2'],
  tapGlow: 'rgba(255,255,255,0.55)',
  smashSoil: ['#7A4E34', '#5A3624', '#3E2518'],
  dropsSky: ['#6FD0FF', '#A8E6FF', '#FFF1D6'],
  jumpDay: ['#5CC8FF', '#A6E4FF', '#E8FAFF'],
  jumpDusk: ['#7E5CD6', '#E58BB8', '#FFC79A'],
  jumpNight: ['#141B3E', '#2A2E6E', '#5B3F8E'],
  hillFar: '#8ED6A0',
  hillNear: '#5DBF6E',
  hillEdge: '#2E7D32',
  cloud: '#FFFFFF',
  cloudShade: '#D6ECFF',
  quiz: ['#B7A4FF', '#8F7BEA', '#6A55C8'],
} as const;

/** Partikel- und Effektfarben, die mehrere Spiele teilen. */
export const sparks = {
  white: '#FFFFFF',
  gold: '#FFD23A',
  pink: '#FF6B9A',
  mint: '#7CF0A8',
  sky: '#6FD0FF',
  dust: '#C9B79A',
} as const;
