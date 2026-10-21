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
import { usePop } from '../feedback/usePop';
import { AssetImage } from '../ui/AssetImage';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { LevelPips } from './LevelPips';
import { PriceCoin } from './PriceCoin';
import { PurchaseBurst } from './PurchaseBurst';
import { UPGRADE_COLORS, upgradeAssetId } from './upgradeVisuals';

const IMAGE_SIZE = 64;

/**
 * Ein Upgrade im Shop: Bild, Name, Wirkung, Stufen-Punkte und Kauf-Button mit Rückmeldung (WEB-3).
 * Kauf (ART-5): Karte ploppt auf, Funken und eine Münze steigen aus dem Bild.
 */
export function UpgradeCard({ id }: { id: UpgradeId }) {
  const levels = useGameStore((s) => s.upgrades);
  const coins = useGameStore((s) => s.coins);
  const buyUpgrade = useGameStore((s) => s.buyUpgrade);
  const spendCoins = useGameStore((s) => s.spendCoins);
  const [boughtKey, setBoughtKey] = useState(0);
  const { style: popStyle, pop } = usePop();

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
    pop();
    setBoughtKey((k) => k + 1);
  };

  return (
    <Animated.View style={popStyle}>
      <Card tone={maxed ? 'success' : 'plain'}>
        <View className="flex-row items-center gap-3">
          <View>
            <AssetImage
              source={upgradeAssets[upgradeAssetId(id, level)]}
              label={text.name}
              color={UPGRADE_COLORS[id]}
              size={IMAGE_SIZE}
              tile
            />
            <PurchaseBurst playKey={boughtKey} />
            {boughtKey > 0 ? (
              <Animated.View
                key={boughtKey}
                entering={ZoomIn.springify().damping(8)}
                style={{ position: 'absolute', right: -8, top: -8 }}
              >
                <Badge label={shop.bought} color="plantDark" light />
              </Animated.View>
            ) : null}
          </View>
          <View className="flex-1 gap-1">
            <Text className="font-heading text-lg leading-6 text-ink">{text.name}</Text>
            <Text className="font-body text-sm text-inkMuted">{text.text}</Text>
            {max > 1 ? <LevelPips level={level} max={max} label={shop.level(level, max)} /> : null}
          </View>
        </View>
        <View className="flex-row items-center justify-between gap-2 pt-1">
          {maxed ? (
            <Badge label={max > 1 ? shop.maxed : shop.owned} color="plantLight" />
          ) : (
            <>
              <Text className="flex-1 font-body text-xs text-inkMuted">
                {next && !affordable ? shop.missingCoins(next.price - coins) : ''}
              </Text>
              <Button label={label} size="sm" disabled={!affordable} onPress={buy} leading={<PriceCoin />} />
            </>
          )}
        </View>
      </Card>
    </Animated.View>
  );
}
