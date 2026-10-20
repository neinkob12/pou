import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { shop } from '../../content/strings';
import { useGameStore } from '../../store/gameStore';
import { AlbumTabs } from '../album/AlbumTabs';
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
    <SafeAreaView className="flex-1 bg-cream" edges={['top']}>
      <ScrollView contentContainerClassName="gap-4 p-4">
        <View className="flex-row items-center justify-between">
          <Text className="font-heading text-3xl text-ink">{shop.title}</Text>
          <CoinChip coins={coins} accessibilityLabel={shop.coinsLabel(coins)} />
        </View>
        <AlbumTabs tabs={shopTabs} />
      </ScrollView>
    </SafeAreaView>
  );
}
