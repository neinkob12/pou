import { Group } from '@shopify/react-native-skia';
import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';

import { ArtCanvas } from '../../ui/ArtCanvas';
import { ForegroundCushion, ForegroundPlant, foregroundBox, RoomArt, RoomGlowArt } from './RoomArt';
import { DustMotes, GlowPulse, SwayingCurtain } from './RoomAmbience';
import { RoomCanvas } from './RoomCanvas';
import { roomLayout, type Box } from './roomLayout';
import { roomPalette } from './roomPalette';
import { CurtainArt, WindowFront } from './RoomWindow';
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
  const front: Box = { x: win.x - 8, y: win.y - 8, w: win.w + 16, h: win.h + 13 };
  const curtainH = win.h + 8;
  const curtains = [
    { box: { x: win.x - 5, y: win.y - 5, w: 10, h: curtainH }, mirror: false },
    { box: { x: win.x + win.w - 5, y: win.y - 5, w: 10, h: curtainH }, mirror: true },
  ];
  const beam: Box = { x: win.x + 6, y: win.y + win.h, w: win.w + 14, h: l.floorY - win.y - win.h + 10 };
  const glow: Box = { x: l.garland.x1 - 4, y: l.garland.y - 3, w: 100 - l.garland.x1 + 4, h: l.dresser.y - l.garland.y + 2 };
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <ArtCanvas width={width} height={height} still>
        <RoomArt l={l} p={p} isDay={isDay} weather={weather} />
      </ArtCanvas>
      {still ? null : <SkyLife glass={px(win, u)} isDay={isDay} weather={weather} />}
      <RoomCanvas u={u} box={front}>
        <WindowFront l={l} p={p} isDay={isDay} />
      </RoomCanvas>
      {curtains.map(({ box, mirror }, i) => {
        const art = (
          <RoomCanvas u={u} box={{ x: 0, y: 0, w: box.w, h: box.h }}>
            <Group transform={mirror ? [{ translateX: box.w }, { scaleX: -1 }] : []}>
              <CurtainArt h={box.h} p={p} />
            </Group>
          </RoomCanvas>
        );
        return still ? (
          <View key={box.x} style={[styles.abs, { left: box.x * u, top: box.y * u, width: box.w * u, height: box.h * u }]}>
            {art}
          </View>
        ) : (
          <SwayingCurtain key={box.x} box={px(box, u)} mirror={mirror} delay={i * 900}>
            {art}
          </SwayingCurtain>
        );
      })}
      {isDay && weather !== 'rain' && !still ? <DustMotes beam={px(beam, u)} /> : null}
      {isDay ? null : (
        <GlowPulse>
          <RoomCanvas u={u} box={glow}>
            <RoomGlowArt l={l} />
          </RoomCanvas>
        </GlowPulse>
      )}
    </View>
  );
});

/** Vordergrund vor Budi: große Zimmerpflanze links, Sitzkissen rechts. */
export const RoomForegroundScene = memo(function RoomForegroundScene({ width, height, isDay }: Omit<SceneProps, 'weather'>) {
  const l = roomLayout(width, height);
  const p = roomPalette(isDay);
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <RoomCanvas u={width / 100} box={foregroundBox(l)}>
        <ForegroundPlant l={l} p={p} />
        <ForegroundCushion l={l} p={p} />
      </RoomCanvas>
    </View>
  );
});

const styles = StyleSheet.create({
  abs: { position: 'absolute' },
});
