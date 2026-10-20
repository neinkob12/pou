import type { ImageSourcePropType } from 'react-native';

import { equippedCosmetic } from '../game/cosmetics';
import { cosmetics } from '../lib/assets';
import { useGameStore } from '../store/gameStore';

/** Bild des ausgerüsteten Accessoires für den Accessoire-Slot von Budi (P25), oder null. */
export function useEquippedAccessory(): ImageSourcePropType | null {
  const id = useGameStore((s) => equippedCosmetic(s.cosmeticsOwned, s.cosmeticEquipped));
  return id ? cosmetics[id] : null;
}
