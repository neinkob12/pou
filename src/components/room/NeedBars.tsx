import { Text, View } from 'react-native';

import { ui } from '../../lib/assets';
import { room } from '../../content/strings';
import { useNeeds } from '../../hooks/useNeeds';
import { AssetImage } from '../ui/AssetImage';
import { AnimatedBar } from './care/AnimatedBar';
import { needBarValues } from './care/careLogic';
import { NEED_BARS } from './needBars';

const ICON_SIZE = 28;

/** Die vier Balken oben: Wasser, Nährstoffe, Licht, Laune. Werte aus dem Bedürfnis-Slice (P04). */
export function NeedBars() {
  const { snapshot } = useNeeds();
  const values = needBarValues(snapshot);
  return (
    <View className="flex-1 flex-row gap-2 rounded-2xl bg-white/85 px-2 py-1.5">
      {NEED_BARS.map((bar) => (
        <View key={bar.id} className="flex-1 items-center gap-1">
          <AssetImage source={ui[bar.icon]} label={room.needs[bar.id]} color={bar.color} size={ICON_SIZE} round icon={bar.art} />
          <View className="w-full">
            <AnimatedBar value={values[bar.id] / 100} color={bar.color} accessibilityLabel={room.needs[bar.id]} />
          </View>
          <Text numberOfLines={1} className="font-body-bold text-xs text-ink">
            {room.needs[bar.id]}
          </Text>
        </View>
      ))}
    </View>
  );
}
