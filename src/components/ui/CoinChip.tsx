import { Text, View } from 'react-native';

import { ui } from '../../lib/assets';
import { AssetImage } from './AssetImage';

interface CoinChipProps {
  coins: number;
  accessibilityLabel?: string;
}

/** Münzanzeige als Pille: Münz-Icon (U9) und Betrag. */
export function CoinChip({ coins, accessibilityLabel }: CoinChipProps) {
  return (
    <View
      accessibilityLabel={accessibilityLabel}
      className="min-h-11 flex-row items-center gap-2 rounded-full border-2 border-plantDark bg-white px-3 py-1"
    >
      <AssetImage source={ui.u9_coin} label="U9" color="coral" size={24} round icon="coin" />
      <Text className="font-body-bold text-base text-ink">{coins}</Text>
    </View>
  );
}
