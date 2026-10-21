// Zentrale Asset-Referenzen. Komponenten importieren Bilder und Sounds nur von hier.
// Büro-Regel: Jeder Auftrag ergänzt seinen Abschnitt, Dateinamen nach docs/ASSETS.md.
// Fehlt ein Asset, nutze <Placeholder /> aus src/components/ui/Placeholder.tsx.

import type { ImageSourcePropType } from 'react-native';

import type { CosmeticId, StrainId } from '../game/config';

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

// --- Gesundheit: Schädlinge und Schimmel auf Budi (P21) ---
// Schlüssel = ID aus docs/ASSETS.md (U17). Fehlt die Datei, zeigt Budi einen Platzhalter.
// Datei einhängen: z. B. `u17_spider_mite: require('../../assets/images/u17_spider_mite.png'),`
export type HealthAssetId = 'u17_spider_mite' | 'u17_fungus_gnat' | 'u17_mold';
export const health: Partial<Record<HealthAssetId, ImageSourcePropType>> = {};

// --- Ernte: Lupe, Schere, Trocknen, Erntekiste (P24) ---
// Schlüssel = ID aus docs/ASSETS.md. Fehlt die Datei, zeigt der Ernte-Screen einen Platzhalter.
export type HarvestAssetId = 'u7_lupe' | 'u8_scissors' | 'b7_drying' | 'b8_crate' | 'h3_drying_room';
// WEB-4: gezeichnet (Skia) und mit `node assets/render-art.cjs` als PNG gerendert.
export const harvest: Partial<Record<HarvestAssetId, ImageSourcePropType>> = {
  u7_lupe: require('../../assets/images/u7_lupe.png'),
  u8_scissors: require('../../assets/images/u8_scissors.png'),
  b7_drying: require('../../assets/images/b7_drying.png'),
  b8_crate: require('../../assets/images/b8_crate.png'),
  h3_drying_room: require('../../assets/images/h3_drying_room.png'),
};

// --- Shop-Upgrades: Bilder im Shop und im Raum (P15) ---
// Topf-Stufen U1, LED U2, Ventilator U5, Entfeuchter U6, Spezialdünger U4. Das Nützlings-Kit hat
// noch keine ID in docs/ASSETS.md und heißt hier `beneficials` (Marienkäfer).
export type UpgradeAssetId =
  | 'u1_pot_1'
  | 'u1_pot_2'
  | 'u1_pot_3'
  | 'u2_led_on'
  | 'u4_special'
  | 'u5_fan'
  | 'u6_dehumidifier'
  | 'beneficials';
// WEB-4: gezeichnet (Skia) und mit `node assets/render-art.cjs` als PNG gerendert.
export const upgrades: Partial<Record<UpgradeAssetId, ImageSourcePropType>> = {
  u1_pot_1: require('../../assets/images/u1_pot_1.png'),
  u1_pot_2: require('../../assets/images/u1_pot_2.png'),
  u1_pot_3: require('../../assets/images/u1_pot_3.png'),
  u2_led_on: require('../../assets/images/u2_led_on.png'),
  u4_special: require('../../assets/images/u4_special.png'),
  u6_dehumidifier: require('../../assets/images/u6_dehumidifier.png'),
  beneficials: require('../../assets/images/beneficials.png'),
};

// --- Kosmetik: Accessoires für den Accessoire-Slot von Budi (P25) ---
// U16 aus docs/ASSETS.md, Ebenen auf der Budi-Leinwand 1024 × 1024. Seit WEB-4 gezeichnet
// (src/components/budi/art/AccessoryArt.tsx, gerendert mit `node assets/render-art.cjs`).
export const cosmetics: Record<CosmeticId, ImageSourcePropType> = {
  u16_sunglasses: require('../../assets/budi/u16_sunglasses.png'),
  u16_hat_cap: require('../../assets/budi/u16_hat_cap.png'),
  u16_hat_straw: require('../../assets/budi/u16_hat_straw.png'),
  u16_hat_crown: require('../../assets/budi/u16_hat_crown.png'),
};

// --- Minispiele: Sprites und Hintergründe (P08, P12 bis P14, P22) ---
export const minigames: AssetMap = {};

// --- Sounds und Musik (P23, P30 erweitert) ---
// Schlüssel = ID aus docs/ASSETS.md plus Kurzname. Die Dateien in assets/sounds/ sind bis zur
// Lieferung stille Platzhalter unter den endgültigen Namen: echten Sound einfach drüberkopieren.
// Abgespielt wird nur über src/lib/audio.ts.
export type SoundId =
  | 's1_water'
  | 's2_feed'
  | 's3_tap'
  | 's4_coins'
  | 's5_smash_hit'
  | 's6_jump'
  | 's7_phase_change'
  | 's8_harvest'
  | 's9_voice_happy_1'
  | 's9_voice_happy_2'
  | 's9_voice_happy_3'
  | 's9_voice_question_1'
  | 's9_voice_question_2'
  | 's9_voice_grumpy_1'
  | 's9_voice_grumpy_2'
  | 's10_music_room'
  | 's11_music_minigames'
  | 's12_ouch';
export const sounds: Record<SoundId, number> & SoundMap = {
  s1_water: require('../../assets/sounds/s1_water.m4a'),
  s2_feed: require('../../assets/sounds/s2_feed.m4a'),
  s3_tap: require('../../assets/sounds/s3_tap.m4a'),
  s4_coins: require('../../assets/sounds/s4_coins.m4a'),
  s5_smash_hit: require('../../assets/sounds/s5_smash_hit.m4a'),
  s6_jump: require('../../assets/sounds/s6_jump.m4a'),
  s7_phase_change: require('../../assets/sounds/s7_phase_change.m4a'),
  s8_harvest: require('../../assets/sounds/s8_harvest.m4a'),
  // S9 Budi-Stimme: kurze Kauderwelsch-Laute je Stimmung (src/components/budi/voice.ts).
  s9_voice_happy_1: require('../../assets/sounds/s9_voice_happy_1.m4a'),
  s9_voice_happy_2: require('../../assets/sounds/s9_voice_happy_2.m4a'),
  s9_voice_happy_3: require('../../assets/sounds/s9_voice_happy_3.m4a'),
  s9_voice_question_1: require('../../assets/sounds/s9_voice_question_1.m4a'),
  s9_voice_question_2: require('../../assets/sounds/s9_voice_question_2.m4a'),
  s9_voice_grumpy_1: require('../../assets/sounds/s9_voice_grumpy_1.m4a'),
  s9_voice_grumpy_2: require('../../assets/sounds/s9_voice_grumpy_2.m4a'),
  s10_music_room: require('../../assets/sounds/s10_music_room.m4a'),
  s11_music_minigames: require('../../assets/sounds/s11_music_minigames.m4a'),
  s12_ouch: require('../../assets/sounds/s12_ouch.m4a'),
};

// --- App-Icon und Splash ---
export const icon = {
  app: require('../../assets/icon/icon.png'),
  splash: require('../../assets/icon/splash-icon.png'),
} satisfies AssetMap;

export const assets = { budi, room, ui, upgrades, minigames, sounds, icon };
