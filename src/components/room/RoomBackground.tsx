import { useState } from 'react';
import { ImageBackground, StyleSheet, View, type LayoutChangeEvent } from 'react-native';

import { room as roomAssets } from '../../lib/assets';
import { ArtCanvas } from '../ui/ArtCanvas';
import { RoomArt } from './art/RoomArt';
import { usePlantStatus } from './phase/usePlantStatus';

/**
 * Raum-Hintergrund über die ganze Fläche: Tag oder Nacht nach Lichtplan der Pflanze.
 * Liegt eine Bilddatei (H1, H2) in assets.ts, gewinnt sie, sonst das gezeichnete Zimmer (WEB-1).
 */
export function RoomBackground() {
  const { light } = usePlantStatus();
  const isDay = light?.isDay ?? true;
  const [size, setSize] = useState({ width: 0, height: 0 });
  const source = isDay ? roomAssets.h1_day : roomAssets.h2_night;
  if (source) {
    return <ImageBackground source={source} style={StyleSheet.absoluteFill} resizeMode="cover" />;
  }
  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setSize((s) => (s.width === width && s.height === height ? s : { width, height }));
  };
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill} className={isDay ? 'bg-cream' : 'bg-night'} onLayout={onLayout}>
      {size.width > 0 ? (
        <ArtCanvas width={size.width} height={size.height} still>
          <RoomArt width={size.width} height={size.height} isDay={isDay} />
        </ArtCanvas>
      ) : null}
    </View>
  );
}
