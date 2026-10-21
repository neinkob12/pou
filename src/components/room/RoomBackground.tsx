import { useState } from 'react';
import { ImageBackground, StyleSheet, View, type LayoutChangeEvent } from 'react-native';

import { room as roomAssets } from '../../lib/assets';
import { clock } from '../../lib/clock';
import { DayNightFade } from './art/DayNightFade';
import { RoomForegroundScene, RoomScene } from './art/RoomScene';
import { weatherForDay } from './art/weather';
import { usePlantStatus } from './phase/usePlantStatus';

function useRoomSize() {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setSize((s) => (s.width === width && s.height === height ? s : { width, height }));
  };
  return { size, onLayout };
}

/**
 * Raum-Hintergrund über die ganze Fläche: Tag oder Nacht nach Lichtplan der Pflanze, mit
 * Überblendung (ART-4). Liegt eine Bilddatei (H1, H2) in assets.ts, gewinnt sie, sonst das
 * gezeichnete Zimmer.
 */
export function RoomBackground() {
  const { light } = usePlantStatus();
  const isDay = light?.isDay ?? true;
  const { size, onLayout } = useRoomSize();
  // Wetter wechselt einmal am Tag; der Wert bleibt sonst gleich, die memo-Szene zeichnet nicht neu.
  const weather = weatherForDay(clock.now());
  const source = isDay ? roomAssets.h1_day : roomAssets.h2_night;
  if (source) {
    return <ImageBackground source={source} style={StyleSheet.absoluteFill} resizeMode="cover" />;
  }
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill} className={isDay ? 'bg-cream' : 'bg-night'} onLayout={onLayout}>
      {size.width > 0 ? (
        <DayNightFade
          isDay={isDay}
          render={(d) => <RoomScene width={size.width} height={size.height} isDay={d} weather={weather} />}
        />
      ) : null}
    </View>
  );
}

/** Vordergrund-Ebene über Budi (Pflanze, Kissen). Eigene Zeile in RoomScreen, nach BudiStage. */
export function RoomForeground() {
  const { light } = usePlantStatus();
  const isDay = light?.isDay ?? true;
  const { size, onLayout } = useRoomSize();
  if (roomAssets.h1_day) return null;
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill} onLayout={onLayout}>
      {/* Ohne Überblendung: eine bildschirmgroße, durchsichtige Ebene über Budi kostet jeden Frame. */}
      {size.width > 0 ? <RoomForegroundScene width={size.width} height={size.height} isDay={isDay} /> : null}
    </View>
  );
}
