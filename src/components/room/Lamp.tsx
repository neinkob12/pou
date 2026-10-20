import { View } from 'react-native';

import { room as roomAssets } from '../../lib/assets';
import { room } from '../../content/strings';
import { AssetImage } from '../ui/AssetImage';

const LAMP_WIDTH = 140;
const LAMP_HEIGHT = 60;

// Slot. Später P11: an/aus, 18/6 und 12/12, LED-Skin (U2).
/** Lampe oben im Bild, an einem Kabel über Budi. */
export function Lamp() {
  return (
    <View pointerEvents="none" className="items-center">
      <View className="h-6 w-1 bg-ink" />
      <AssetImage source={roomAssets.u2_lamp_on} label={room.lamp} color="lamp" size={LAMP_WIDTH} height={LAMP_HEIGHT} />
    </View>
  );
}
