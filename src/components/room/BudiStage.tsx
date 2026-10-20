import { View } from 'react-native';

import { budi, room as roomAssets } from '../../lib/assets';
import { room } from '../../content/strings';
import { AssetImage } from '../ui/AssetImage';

const PLANT_SIZE = 160;
const POT_WIDTH = 170;
const POT_HEIGHT = 130;

// Slot. Später P10 (Gesten, Reaktionen) und P20 (Budi-Grafik als PNG-Ebenen).
/** Budi in der Mitte: Pflanze (Kreis) auf dem Topf. */
export function BudiStage() {
  return (
    <View className="flex-1 items-center justify-end pb-4">
      <AssetImage source={budi.b3_vegetative_small} label={room.plant} color="plantLight" size={PLANT_SIZE} round />
      <View className="-mt-4">
        <AssetImage source={roomAssets.u1_pot} label={room.pot} color="terracotta" size={POT_WIDTH} height={POT_HEIGHT} />
      </View>
    </View>
  );
}
