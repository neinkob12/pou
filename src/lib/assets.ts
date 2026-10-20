// Zentrale Asset-Referenzen. Komponenten importieren Bilder und Sounds nur von hier.
// Büro-Regel: Jeder Auftrag ergänzt seinen Abschnitt, Dateinamen nach docs/ASSETS.md.
// Fehlt ein Asset, nutze <Placeholder /> aus src/components/ui/Placeholder.tsx.

import type { ImageSourcePropType } from 'react-native';

type AssetMap = Record<string, ImageSourcePropType>;
type SoundMap = Record<string, number>;

// --- Budi: Topf, Pflanze je Phase, Gesichter, Accessoires (P20) ---
export const budi: AssetMap = {};

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

// --- Shop-Upgrades: Bilder im Shop und im Raum (P15) ---
// Topf-Stufen U1, LED U2, Ventilator U5, Entfeuchter U6, Spezialdünger U4. Das Nützlings-Kit hat
// noch keine ID in docs/ASSETS.md und bleibt Platzhalter.
export type UpgradeAssetId =
  | 'u1_pot_1'
  | 'u1_pot_2'
  | 'u1_pot_3'
  | 'u2_led_on'
  | 'u4_special'
  | 'u5_fan'
  | 'u6_dehumidifier'
  | 'beneficials';
export const upgrades: Partial<Record<UpgradeAssetId, ImageSourcePropType>> = {};

// --- Minispiele: Sprites und Hintergründe (P08, P12 bis P14, P22) ---
export const minigames: AssetMap = {};

// --- Sounds und Musik (P30) ---
export const sounds: SoundMap = {};

// --- App-Icon und Splash ---
export const icon = {
  app: require('../../assets/icon/icon.png'),
  splash: require('../../assets/icon/splash-icon.png'),
} satisfies AssetMap;

export const assets = { budi, room, ui, upgrades, minigames, sounds, icon };
