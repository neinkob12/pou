import { useState } from 'react';
import { Text, View } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';

import { cosmetics as text } from '../../content/strings';
import { COSMETIC_IDS, type CosmeticId } from '../../game/config';
import { shownCosmetic } from '../../game/cosmetics';
import { useNeeds } from '../../hooks/useNeeds';
import { cosmetics as cosmeticAssets } from '../../lib/assets';
import { useGameStore } from '../../store/gameStore';
import { Budi } from '../budi/Budi';
import { CosmeticCard } from './CosmeticCard';

const PREVIEW_SIZE = 200;

// Kosmetik gegen Münzen (P25). Echtgeld-Items und Saisonpass ergänzt P33.
/** Tab "Kosmetik" im Shop: Vorschau von Budi oben, darunter die Accessoires. */
export function CosmeticsTab() {
  const owned = useGameStore((s) => s.cosmeticsOwned);
  const equipped = useGameStore((s) => s.cosmeticEquipped);
  const { condition } = useNeeds();
  const hovering = useSharedValue(0);
  const [tryOn, setTryOn] = useState<CosmeticId | null>(null);

  const shown = shownCosmetic(owned, equipped, tryOn);
  const toggleTryOn = (id: CosmeticId) => setTryOn((current) => (current === id ? null : id));

  return (
    <View className="gap-3">
      <View className="items-center rounded-2xl bg-white p-4" accessibilityLabel={text.previewLabel}>
        <Budi
          condition={condition}
          reaction={null}
          hovering={hovering}
          accessory={shown ? cosmeticAssets[shown] : null}
          size={PREVIEW_SIZE}
        />
        <Text className="pt-2 text-center font-body text-sm text-inkMuted">{text.intro}</Text>
      </View>
      {COSMETIC_IDS.map((id) => (
        <CosmeticCard
          key={id}
          id={id}
          tryingOn={tryOn === id}
          onTryOn={() => toggleTryOn(id)}
          onDone={() => setTryOn(null)}
        />
      ))}
    </View>
  );
}
