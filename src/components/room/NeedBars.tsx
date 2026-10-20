import { Text, View } from 'react-native';

import { ui } from '../../lib/assets';
import { room } from '../../content/strings';
import { useGameStore } from '../../store/gameStore';
import { AssetImage } from '../ui/AssetImage';
import { Bar } from '../ui/Bar';
import { NEED_BARS, selectNeedBars } from './needBars';

const ICON_SIZE = 26;

// Slot. Später P10: echte Werte aus dem Bedürfnis-Slice.
/** Die vier Balken oben: Wasser, Nährstoffe, Licht, Laune. */
export function NeedBars() {
  const values = useGameStore(selectNeedBars);
  return (
    <View className="flex-1 flex-row gap-2">
      {NEED_BARS.map((bar) => (
        <View key={bar.id} className="flex-1 items-center gap-1">
          <AssetImage source={ui[bar.icon]} label={room.needs[bar.id]} color={bar.color} size={ICON_SIZE} round />
          <View className="w-full">
            <Bar value={values[bar.id] / 100} color={bar.color} accessibilityLabel={room.needs[bar.id]} />
          </View>
          <Text numberOfLines={1} className="font-body text-xs text-ink">
            {room.needs[bar.id]}
          </Text>
        </View>
      ))}
    </View>
  );
}
