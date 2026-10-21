import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';

import { ArtCanvas } from '../../ui/ArtCanvas';
import { cushionBox, ForegroundCushion, ForegroundPlant, plantBox, RoomArt } from './RoomArt';
import { DustMotes } from './RoomAmbience';
import { RoomCanvas } from './RoomCanvas';
import { roomLayout, type Box } from './roomLayout';
import { roomPalette } from './roomPalette';
import { SkyArt } from './RoomWindow';
import { SkyLife } from './SkyLife';
import type { RoomWeather } from './weather';

interface SceneProps {
  width: number;
  height: number;
  isDay: boolean;
  weather: RoomWeather;
}

const px = (b: Box, u: number): Box => ({ x: b.x * u, y: b.y * u, w: b.w * u, h: b.h * u });

/**
 * Das ganze Zimmer hinter Budi zu einer Tageszeit (ART-4). memo: zeichnet nur neu, wenn sich
 * Größe, Tageszeit oder Wetter ändern, nicht bei jedem Uhr-Tick (WEB-6).
 */
export const RoomScene = memo(function RoomScene({ width, height, isDay, weather }: SceneProps) {
  const still = useReducedMotion();
  const l = roomLayout(width, height);
  const p = roomPalette(isDay);
  const u = width / 100;
  const win = l.window;
  const beam: Box = { x: win.x + 6, y: win.y + win.h, w: win.w + 14, h: l.floorY - win.y - win.h + 10 };
  // Drei Ebenen: Himmel (klein), Wolken und Sterne (Views), das Zimmer mit ausgestanztem Fenster.
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <RoomCanvas u={u} box={win}>
        <SkyArt l={l} p={p} isDay={isDay} weather={weather} />
      </RoomCanvas>
      {still ? null : <SkyLife glass={px(win, u)} isDay={isDay} weather={weather} />}
      <ArtCanvas width={width} height={height} still>
        <RoomArt l={l} p={p} isDay={isDay} weather={weather} />
      </ArtCanvas>
      {isDay && weather !== 'rain' && !still ? <DustMotes beam={px(beam, u)} /> : null}
    </View>
  );
});

/** Vordergrund vor Budi: große Zimmerpflanze links, Sitzkissen rechts. */
export const RoomForegroundScene = memo(function RoomForegroundScene({ width, height, isDay }: Omit<SceneProps, 'weather'>) {
  const l = roomLayout(width, height);
  const p = roomPalette(isDay);
  return (
    <>
      <RoomCanvas u={width / 100} box={plantBox(l)}>
        <ForegroundPlant l={l} p={p} />
      </RoomCanvas>
      <RoomCanvas u={width / 100} box={cushionBox(l)}>
        <ForegroundCushion l={l} p={p} />
      </RoomCanvas>
    </>
  );
});

