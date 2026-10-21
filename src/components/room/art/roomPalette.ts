// Farben des Zimmers je Tageszeit (ART-4). Gleiche Schlüssel für Tag und Nacht, damit jede
// Zeichnung nur `p.xyz` liest statt überall `isDay ? a : b`. Reine Grafik, keine Spielwerte.

import { artColors, colors } from '../../../lib/theme';

export interface RoomPalette {
  outline: string;
  wallTop: string;
  wallBottom: string;
  wallDot: string;
  wainscot: string;
  wainscotShade: string;
  wainscotLight: string;
  rail: string;
  floorBack: string;
  floorFront: string;
  plankSeam: string;
  plankLight: string;
  rug: string;
  rugBorder: string;
  rugPattern: string;
  rugFringe: string;
  skyTop: string;
  skyBottom: string;
  hillFar: string;
  hillNear: string;
  hillShade: string;
  frame: string;
  frameShade: string;
  frameLight: string;
  curtain: string;
  curtainShade: string;
  curtainLight: string;
  wood: string;
  woodShade: string;
  woodLight: string;
  paper: string;
  leaf: string;
  leafShade: string;
  leafLight: string;
  pot: string;
  potShade: string;
  bookA: string;
  bookB: string;
  bookC: string;
  /** Einfallendes Licht durchs Fenster (Sonne oder Mond). */
  beam: string;
  beamFade: string;
  /** Abdunkeln an Rändern und vorn. */
  shade: string;
  shadeFade: string;
  /** Glanz oben auf Möbeln. */
  gloss: string;
}

export const ROOM_DAY: RoomPalette = {
  outline: artColors.outline,
  wallTop: '#FFD49E',
  wallBottom: '#FFE9C6',
  wallDot: '#F6C485',
  wainscot: '#7FC7A6',
  wainscotShade: '#5FA586',
  wainscotLight: '#A6DEC3',
  rail: '#FFF4DF',
  floorBack: '#E0A065',
  floorFront: '#B8733F',
  plankSeam: '#9A5C2F',
  plankLight: '#F0BA80',
  rug: '#9C7BEA',
  rugBorder: '#7353CC',
  rugPattern: '#C4ADF7',
  rugFringe: '#FFF4E0',
  skyTop: '#4FB8FF',
  skyBottom: '#C8EEFF',
  hillFar: '#9FDC8F',
  hillNear: '#6CC35C',
  hillShade: '#4FA247',
  frame: '#F7F1E6',
  frameShade: '#D9CDBA',
  frameLight: colors.white,
  curtain: '#FF7F93',
  curtainShade: '#E25A73',
  curtainLight: '#FFB0BD',
  wood: artColors.wood,
  woodShade: artColors.woodShade,
  woodLight: '#E2AE78',
  paper: '#FFF6E2',
  leaf: '#62C05A',
  leafShade: '#3F9A43',
  leafLight: '#9BE08A',
  pot: '#F08A5D',
  potShade: '#C9653D',
  bookA: '#FF7F93',
  bookB: '#5DB7E8',
  bookC: '#F5C443',
  beam: 'rgba(255,236,170,0.42)',
  beamFade: 'rgba(255,236,170,0)',
  shade: 'rgba(80,40,20,0.22)',
  shadeFade: 'rgba(80,40,20,0)',
  gloss: 'rgba(255,255,255,0.55)',
};

export const ROOM_NIGHT: RoomPalette = {
  outline: '#141A33',
  wallTop: '#252C5A',
  wallBottom: '#343D74',
  wallDot: '#3D478A',
  wainscot: '#2E4C60',
  wainscotShade: '#223A4C',
  wainscotLight: '#3D6278',
  rail: '#5A6496',
  floorBack: '#5E4A6E',
  floorFront: '#3E2F4C',
  plankSeam: '#2F223C',
  plankLight: '#76608A',
  rug: '#5E4A9C',
  rugBorder: '#45357A',
  rugPattern: '#7763B8',
  rugFringe: '#9A93C2',
  skyTop: '#0B1030',
  skyBottom: '#2C3A7C',
  hillFar: '#26385E',
  hillNear: '#1B2A48',
  hillShade: '#131F38',
  frame: '#8E94BE',
  frameShade: '#6A709C',
  frameLight: '#B7BCE0',
  curtain: '#B35A7E',
  curtainShade: '#8A4263',
  curtainLight: '#D07A9C',
  wood: '#7A5A6A',
  woodShade: '#5A4054',
  woodLight: '#977587',
  paper: '#B9B6D6',
  leaf: '#3E7E5A',
  leafShade: '#2B5E44',
  leafLight: '#5C9C76',
  pot: '#9A5A5A',
  potShade: '#744246',
  bookA: '#A3577A',
  bookB: '#3F6E9A',
  bookC: '#A89050',
  beam: 'rgba(190,210,255,0.34)',
  beamFade: 'rgba(190,210,255,0)',
  shade: 'rgba(6,8,24,0.45)',
  shadeFade: 'rgba(6,8,24,0)',
  gloss: 'rgba(200,210,255,0.28)',
};

export const roomPalette = (isDay: boolean): RoomPalette => (isDay ? ROOM_DAY : ROOM_NIGHT);

/** Farben, die nicht von der Tageszeit abhängen: Himmelskörper, Wolken, Regen, Lichter. */
export const SKY = {
  sun: '#FFD84A',
  sunGlow: 'rgba(255,224,110,0.45)',
  sunGlowFade: 'rgba(255,224,110,0)',
  moon: '#FFF2C4',
  moonGlow: 'rgba(255,242,196,0.4)',
  moonGlowFade: 'rgba(255,242,196,0)',
  cloudDay: '#FFFFFF',
  cloudRain: '#C9D3E3',
  cloudNight: '#3B4680',
  rainSky: '#8FA6C4',
  rain: 'rgba(225,240,255,0.85)',
  star: '#FFF6D0',
  bulbs: [colors.lamp, colors.coral, colors.lavender, artColors.sweat, colors.plantLight] as const,
  nightLight: '#FFC86B',
};
