import { ImageBackground, StyleSheet, View } from 'react-native';

import { room as roomAssets } from '../../lib/assets';
import { room } from '../../content/strings';
import { Placeholder } from '../ui/Placeholder';

// Slot. Später P11: Tag/Nacht-Wechsel (H1, H2).
/** Raum-Hintergrund über die ganze Fläche, hinter allen anderen Slots. */
export function RoomBackground() {
  const source = roomAssets.h1_day;
  if (source) {
    return <ImageBackground source={source} style={StyleSheet.absoluteFill} resizeMode="cover" />;
  }
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill} className="bg-cream p-2">
      <Placeholder label={room.background} color="cream" height="100%" />
    </View>
  );
}
