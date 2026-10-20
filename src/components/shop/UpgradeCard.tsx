import { Text, View } from 'react-native';

import type { UpgradeId } from '../../game/config';
import { canBuy, levelOf, maxLevel, nextLevel } from '../../game/shop';
import { upgrades as upgradeAssets } from '../../lib/assets';
import { clock } from '../../lib/clock';
import { shop } from '../../content/strings';
import { useGameStore } from '../../store/gameStore';
import { AssetImage } from '../ui/AssetImage';
import { Button } from '../ui/Button';
import { UPGRADE_COLORS, upgradeAssetId } from './upgradeVisuals';

const IMAGE_SIZE = 72;

/** Ein Upgrade im Shop: Bild, Name, Wirkung, Stufe und Kauf-Button. */
export function UpgradeCard({ id }: { id: UpgradeId }) {
  const levels = useGameStore((s) => s.upgrades);
  const coins = useGameStore((s) => s.coins);
  const buyUpgrade = useGameStore((s) => s.buyUpgrade);
  const spendCoins = useGameStore((s) => s.spendCoins);

  const level = levelOf(levels, id);
  const max = maxLevel(id);
  const next = nextLevel(levels, id);
  const text = shop.upgrades[id];

  let label = shop.owned;
  if (next) label = max > 1 && level > 0 ? shop.upgradeTo(level + 1, next.price) : shop.buy(next.price);
  const affordable = canBuy(levels, id, coins);

  return (
    <View className="flex-row items-center gap-3 rounded-2xl bg-white p-3">
      <AssetImage
        source={upgradeAssets[upgradeAssetId(id, level)]}
        label={text.name}
        color={UPGRADE_COLORS[id]}
        size={IMAGE_SIZE}
      />
      <View className="flex-1 gap-1">
        <Text className="font-heading text-lg text-ink">{text.name}</Text>
        <Text className="font-body text-sm text-inkMuted">{text.text}</Text>
        {max > 1 ? <Text className="font-body-bold text-sm text-ink">{shop.level(level, max)}</Text> : null}
        <View className="items-start pt-1">
          <Button
            label={label}
            variant={next ? 'primary' : 'secondary'}
            disabled={!affordable}
            onPress={() => buyUpgrade(id, spendCoins, clock.now(), level)}
          />
        </View>
        {next && !affordable ? <Text className="font-body text-xs text-inkMuted">{shop.notEnoughCoins}</Text> : null}
      </View>
    </View>
  );
}
