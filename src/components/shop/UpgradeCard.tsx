import { useState } from 'react';
import { Text, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';

import type { UpgradeId } from '../../game/config';
import { canBuy, levelOf, maxLevel, nextLevel } from '../../game/shop';
import { cue } from '../../lib/audio';
import { upgrades as upgradeAssets } from '../../lib/assets';
import { clock } from '../../lib/clock';
import { shop } from '../../content/strings';
import { useGameStore } from '../../store/gameStore';
import { AssetImage } from '../ui/AssetImage';
import { Button } from '../ui/Button';
import { LevelPips } from './LevelPips';
import { UPGRADE_COLORS, upgradeAssetId } from './upgradeVisuals';

const IMAGE_SIZE = 72;

/** Ein Upgrade im Shop: Bild, Name, Wirkung, Stufen-Punkte und Kauf-Button mit Rückmeldung (WEB-3). */
export function UpgradeCard({ id }: { id: UpgradeId }) {
  const levels = useGameStore((s) => s.upgrades);
  const coins = useGameStore((s) => s.coins);
  const buyUpgrade = useGameStore((s) => s.buyUpgrade);
  const spendCoins = useGameStore((s) => s.spendCoins);
  const [boughtKey, setBoughtKey] = useState(0);

  const level = levelOf(levels, id);
  const max = maxLevel(id);
  const next = nextLevel(levels, id);
  const text = shop.upgrades[id];
  const maxed = next === null;

  let label = shop.owned;
  if (next) label = max > 1 && level > 0 ? shop.upgradeTo(level + 1, next.price) : shop.buy(next.price);
  const affordable = canBuy(levels, id, coins);

  const buy = () => {
    if (!buyUpgrade(id, spendCoins, clock.now(), level)) return;
    cue('coins');
    setBoughtKey((k) => k + 1);
  };

  return (
    <View className={`flex-row items-center gap-3 rounded-2xl p-3 ${maxed ? 'bg-plantLight/25' : 'bg-white'}`}>
      <View>
        <AssetImage
          source={upgradeAssets[upgradeAssetId(id, level)]}
          label={text.name}
          color={UPGRADE_COLORS[id]}
          size={IMAGE_SIZE}
          tile
        />
        {boughtKey > 0 ? (
          <Animated.View
            key={boughtKey}
            entering={ZoomIn.springify().damping(8)}
            style={{ position: 'absolute', right: -6, top: -6 }}
          >
            <View className="rounded-full bg-plantDark px-2 py-0.5">
              <Text className="font-body-bold text-xs text-white">{shop.bought}</Text>
            </View>
          </Animated.View>
        ) : null}
      </View>
      <View className="flex-1 gap-1">
        <Text className="font-heading text-lg text-ink">{text.name}</Text>
        <Text className="font-body text-sm text-inkMuted">{text.text}</Text>
        {max > 1 ? <LevelPips level={level} max={max} label={shop.level(level, max)} /> : null}
        <View className="items-start pt-1">
          {maxed ? (
            <Text className="font-body-bold text-sm text-plantDark">{max > 1 ? shop.maxed : shop.owned}</Text>
          ) : (
            <Button label={label} disabled={!affordable} onPress={buy} />
          )}
        </View>
        {next && !affordable ? (
          <Text className="font-body text-xs text-inkMuted">{shop.missingCoins(next.price - coins)}</Text>
        ) : null}
      </View>
    </View>
  );
}
