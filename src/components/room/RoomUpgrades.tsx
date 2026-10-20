import { View } from 'react-native';

import { UPGRADE_IDS, type UpgradeId } from '../../game/config';
import { levelOf } from '../../game/shop';
import { upgrades as upgradeAssets } from '../../lib/assets';
import { shop } from '../../content/strings';
import { useGameStore } from '../../store/gameStore';
import { AssetImage } from '../ui/AssetImage';
import { UPGRADE_COLORS, upgradeAssetId } from '../shop/upgradeVisuals';

const ITEM_SIZE = 56;

const roomLabel = (id: UpgradeId, level: number) =>
  id === 'pot' ? shop.roomLabels.pot(level) : shop.roomLabels[id];

// Gehört P15. Bis Grafiken da sind (P20: Topf-Stufe in BudiStage), zeigt eine Reihe die gekauften
// Upgrades als Platzhalter im Raum. Ohne Käufe rendert sie nichts.
/** Gekaufte Shop-Upgrades sichtbar im Hauptraum. */
export function RoomUpgrades() {
  const levels = useGameStore((s) => s.upgrades);
  const owned = UPGRADE_IDS.filter((id) => levelOf(levels, id) > 0);
  if (owned.length === 0) return null;
  return (
    <View pointerEvents="none" className="flex-row flex-wrap justify-center gap-2 px-4">
      {owned.map((id) => {
        const level = levelOf(levels, id);
        return (
          <AssetImage
            key={id}
            source={upgradeAssets[upgradeAssetId(id, level)]}
            label={roomLabel(id, level)}
            color={UPGRADE_COLORS[id]}
            size={ITEM_SIZE}
          />
        );
      })}
    </View>
  );
}
