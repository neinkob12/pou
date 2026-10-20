import { ImageBackground, StyleSheet, View } from 'react-native';

import { lightPhase, room } from '../../content/strings';
import { room as roomAssets } from '../../lib/assets';
import { Placeholder } from '../ui/Placeholder';
import { usePlantStatus } from './phase/usePlantStatus';

/** Raum-Hintergrund über die ganze Fläche: Tag (H1) oder Nacht (H2) nach Lichtplan der Pflanze. */
export function RoomBackground() {
  const { light } = usePlantStatus();
  const isDay = light?.isDay ?? true;
  const source = isDay ? roomAssets.h1_day : roomAssets.h2_night;
  if (source) {
    return <ImageBackground source={source} style={StyleSheet.absoluteFill} resizeMode="cover" />;
  }
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill} className={`p-2 ${isDay ? 'bg-cream' : 'bg-night'}`}>
      <Placeholder
        label={isDay ? room.background : `${room.background}, ${lightPhase.night} (H2)`}
        color={isDay ? 'cream' : 'night'}
        height="100%"
      />
    </View>
  );
}
