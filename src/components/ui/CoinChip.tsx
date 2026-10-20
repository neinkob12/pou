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
      className="flex-row items-center gap-2 rounded-full bg-white px-3 py-1"
    >
      <AssetImage source={ui.u9_coin} label="U9" color="coral" size={22} round />
      <Text className="font-body-bold text-base text-ink">{coins}</Text>
    </View>
  );
}
