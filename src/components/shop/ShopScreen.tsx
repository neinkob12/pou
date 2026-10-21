import { shop } from '../../content/strings';
import { useGameStore } from '../../store/gameStore';
import { AlbumTabs } from '../album/AlbumTabs';
import { GameScreen } from '../frame/GameScreen';
import { CoinChip } from '../ui/CoinChip';
import { CosmeticsTab } from './CosmeticsTab';
import { UpgradesTab } from './UpgradesTab';

const shopTabs = [
  { key: 'upgrades', label: shop.upgradesTab, Component: UpgradesTab },
  { key: 'cosmetics', label: shop.cosmeticsTab, Component: CosmeticsTab },
];

/** Shop: Upgrades gegen Münzen, daneben der Kosmetik-Tab. */
export function ShopScreen() {
  const coins = useGameStore((s) => s.coins);
  return (
    <GameScreen backdrop="shop" title={shop.title} right={<CoinChip coins={coins} accessibilityLabel={shop.coinsLabel(coins)} />}>
      <AlbumTabs tabs={shopTabs} />
    </GameScreen>
  );
}
