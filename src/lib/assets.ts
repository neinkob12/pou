// Zentrale Asset-Referenzen. Komponenten importieren Bilder und Sounds nur von hier.
// Büro-Regel: Jeder Auftrag ergänzt seinen Abschnitt, Dateinamen nach docs/ASSETS.md.
// Fehlt ein Asset, nutze <Placeholder /> aus src/components/ui/Placeholder.tsx.

import type { ImageSourcePropType } from 'react-native';

type AssetMap = Record<string, ImageSourcePropType>;
type SoundMap = Record<string, number>;

// --- Budi: Topf, Pflanze je Phase, Gesichter, Accessoires (P20) ---
export const budi: AssetMap = {};

// --- Raum: Hintergründe, Lampe, Möbel (P03, P11) ---
export const room: AssetMap = {};

// --- UI: Icons, Münzen, Buttons (P03 und folgende) ---
export const ui: AssetMap = {};

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
