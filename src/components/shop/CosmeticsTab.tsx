import { useState } from 'react';
import { Text, View } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';

import { cosmetics as text, screenUi } from '../../content/strings';
import { COSMETIC_IDS, type CosmeticId } from '../../game/config';
import { shownCosmetic } from '../../game/cosmetics';
import { useNeeds } from '../../hooks/useNeeds';
import { cosmetics as cosmeticAssets } from '../../lib/assets';
import { surface } from '../../lib/theme';
import { useGameStore } from '../../store/gameStore';
import { Budi } from '../budi/Budi';
import { Appear } from '../ui/Appear';
import { Card } from '../ui/Card';
import { SectionTitle } from '../ui/SectionTitle';
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
      <Card tone="highlight" accessibilityLabel={text.previewLabel}>
        <View className="items-center">
          <View
            style={{
              position: 'absolute',
              top: PREVIEW_SIZE * 0.1,
              width: PREVIEW_SIZE * 0.9,
              height: PREVIEW_SIZE * 0.9,
              borderRadius: PREVIEW_SIZE,
              backgroundColor: surface.glow,
            }}
          />
          <Budi
            condition={condition}
            reaction={null}
            hovering={hovering}
            accessory={shown ? cosmeticAssets[shown] : null}
            size={PREVIEW_SIZE}
          />
          <Text className="pt-2 text-center font-body text-sm text-inkMuted">{text.intro}</Text>
        </View>
      </Card>
      <SectionTitle title={screenUi.cosmeticsTitle} meta={`${owned.length}/${COSMETIC_IDS.length}`} />
      {COSMETIC_IDS.map((id, i) => (
        <Appear key={id} index={i}>
          <CosmeticCard id={id} tryingOn={tryOn === id} onTryOn={() => toggleTryOn(id)} onDone={() => setTryOn(null)} />
        </Appear>
      ))}
    </View>
  );
}
