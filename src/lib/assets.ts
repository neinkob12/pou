// Zentrale Asset-Referenzen. Komponenten importieren Bilder und Sounds nur von hier.
// Büro-Regel: Jeder Auftrag ergänzt seinen Abschnitt, Dateinamen nach docs/ASSETS.md.
// Fehlt ein Asset, nutze <Placeholder /> aus src/components/ui/Placeholder.tsx.

import type { ImageSourcePropType } from 'react-native';

import type { StrainId } from '../game/config';

type AssetMap = Record<string, ImageSourcePropType>;
type SoundMap = Record<string, number>;

// --- Budi: Topf, Pflanze je Phase, Gesichter, Accessoires (P20) ---
// Alle Ebenen 1024 × 1024, Topfboden unten mittig (docs/ASSETS.md). Die Dateien in assets/budi/
// sind bis P20b Platzhalter (farbige Form + Text) unter den endgültigen Namen: echte Grafik
// einfach drüberkopieren. Sorten-Varianten (B9) optional als `<pflanze>_<sorte>`, z. B.
// `b06_flowering_full_lotte: require(...)`. Fehlt die Variante, färbt Budi die Grundebene ein.
export type BudiPlantId =
  | 'b01_germination'
  | 'b02_seedling'
  | 'b03_vegetative_small'
  | 'b04_vegetative_large'
  | 'b05_flowering_early'
  | 'b06_flowering_full'
  | 'b07_drying'
  | 'b08_harvest_ready';
export type BudiFaceId =
  | 'b10_face_neutral'
  | 'b10_face_happy'
  | 'b10_face_very_happy'
  | 'b10_face_thirsty'
  | 'b10_face_hungry'
  | 'b10_face_tired'
  | 'b10_face_snoring'
  | 'b10_face_stressed'
  | 'b10_face_sick'
  | 'b10_face_offended'
  | 'b10_face_coma'
  | 'b10_face_surprised'
  | 'b12_blink';
export type BudiPotId = 'u01_pot_standard';
export type BudiVariantId = `${BudiPlantId}_${StrainId}`;
export const budi: Record<BudiPlantId | BudiFaceId | BudiPotId, ImageSourcePropType> &
  Partial<Record<BudiVariantId, ImageSourcePropType>> = {
  b01_germination: require('../../assets/budi/b01_germination.png'),
  b02_seedling: require('../../assets/budi/b02_seedling.png'),
  b03_vegetative_small: require('../../assets/budi/b03_vegetative_small.png'),
  b04_vegetative_large: require('../../assets/budi/b04_vegetative_large.png'),
  b05_flowering_early: require('../../assets/budi/b05_flowering_early.png'),
  b06_flowering_full: require('../../assets/budi/b06_flowering_full.png'),
  b07_drying: require('../../assets/budi/b07_drying.png'),
  b08_harvest_ready: require('../../assets/budi/b08_harvest_ready.png'),
  b10_face_neutral: require('../../assets/budi/b10_face_neutral.png'),
  b10_face_happy: require('../../assets/budi/b10_face_happy.png'),
  b10_face_very_happy: require('../../assets/budi/b10_face_very_happy.png'),
  b10_face_thirsty: require('../../assets/budi/b10_face_thirsty.png'),
  b10_face_hungry: require('../../assets/budi/b10_face_hungry.png'),
  b10_face_tired: require('../../assets/budi/b10_face_tired.png'),
  b10_face_snoring: require('../../assets/budi/b10_face_snoring.png'),
  b10_face_stressed: require('../../assets/budi/b10_face_stressed.png'),
  b10_face_sick: require('../../assets/budi/b10_face_sick.png'),
  b10_face_offended: require('../../assets/budi/b10_face_offended.png'),
  b10_face_coma: require('../../assets/budi/b10_face_coma.png'),
  b10_face_surprised: require('../../assets/budi/b10_face_surprised.png'),
  b12_blink: require('../../assets/budi/b12_blink.png'),
  u01_pot_standard: require('../../assets/budi/u01_pot_standard.png'),
};

// --- Raum: Hintergründe, Lampe, Möbel (P03, P11) ---
// Schlüssel = ID aus docs/ASSETS.md. Fehlt die Datei, zeigt der Slot einen Platzhalter.
// Datei einhängen: z. B. `h1_day: require('../../assets/images/h1_room_day.png'),`
export type RoomAssetId = 'h1_day' | 'h2_night' | 'u1_pot' | 'u2_lamp_on' | 'u2_lamp_off';
export const room: Partial<Record<RoomAssetId, ImageSourcePropType>> = {};

// --- UI: Icons, Münzen, Buttons (P03 und folgende) ---
export type UiAssetId =
  | 'u9_coin'
  | 'u11_water'
  | 'u11_nutrients'
  | 'u11_light'
  | 'u11_mood'
  | 'u12_minigames'
  | 'u12_shop'
  | 'u12_album'
  | 'u12_settings';
export const ui: Partial<Record<UiAssetId, ImageSourcePropType>> = {};

// --- Pflege: Gießkanne, Dünger (P10) ---
// Schlüssel = ID aus docs/ASSETS.md. Fehlt die Datei, zeigt das Werkzeug einen Platzhalter.
export type CareAssetId = 'u3_watering_can' | 'u4_fertilizer_grow' | 'u4_fertilizer_bloom';
export const care: Partial<Record<CareAssetId, ImageSourcePropType>> = {};

// --- Minispiele: Sprites und Hintergründe (P08, P12 bis P14, P22) ---
export const minigames: AssetMap = {};

// --- Sounds und Musik (P30) ---
export const sounds: SoundMap = {};

// --- App-Icon und Splash ---
export const icon = {
  app: require('../../assets/icon/icon.png'),
  splash: require('../../assets/icon/splash-icon.png'),
} satisfies AssetMap;

export const assets = { budi, room, ui, minigames, sounds, icon };
