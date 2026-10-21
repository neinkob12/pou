import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import type { Box } from './roomLayout';
import { SKY } from './roomPalette';
import type { RoomWeather } from './weather';

// Bewegung im Fenster (ART-4): ziehende Wolken, Regen, funkelnde Sterne, ab und zu eine Sternschnuppe.
// Kleine Views mit CSS-Animationen von Reanimated (im Browser im Compositor, nativ im UI-Thread,
// kein JavaScript pro Frame), abgeschnitten auf die Glasfläche. Die Leinwände bleiben still.

interface CloudSpec {
  /** Höhe im Fenster, 0 bis 1. */
  fy: number;
  /** Größe relativ zur Fensterbreite. */
  scale: number;
  /** Sekunden für einmal quer durchs Fenster. */
  seconds: number;
  /** Startlage beim Öffnen, 0 bis 1, damit nicht alle Wolken am Rand beginnen. */
  start: number;
}

const CLOUDS: Record<RoomWeather, readonly CloudSpec[]> = {
  clear: [
    { fy: 0.12, scale: 0.42, seconds: 38, start: 0.15 },
    { fy: 0.4, scale: 0.3, seconds: 52, start: 0.7 },
  ],
  cloudy: [
    { fy: 0.08, scale: 0.55, seconds: 30, start: 0.1 },
    { fy: 0.3, scale: 0.45, seconds: 42, start: 0.55 },
    { fy: 0.5, scale: 0.38, seconds: 36, start: 0.85 },
  ],
  rain: [
    { fy: 0.02, scale: 0.7, seconds: 44, start: 0.2 },
    { fy: 0.2, scale: 0.6, seconds: 34, start: 0.75 },
  ],
};

const STARS = [
  { fx: 0.15, fy: 0.14, size: 3, delay: 0 },
  { fx: 0.4, fy: 0.08, size: 2.5, delay: 500 },
  { fx: 0.32, fy: 0.36, size: 2.5, delay: 1100 },
  { fx: 0.9, fy: 0.55, size: 2, delay: 1600 },
  { fx: 0.12, fy: 0.5, size: 2, delay: 800 },
];
const TWINKLE_MS = 1300;
const SHOOTING_EVERY_MS = 9000;
const SHOOTING_MS = 700;
const RAIN_MS = 700;
const RAIN_STREAKS = 14;

const pct = (f: number) => `${Math.round(f * 1000) / 10}%`;

function Cloud({ glass, spec, color }: { glass: Box; spec: CloudSpec; color: string }) {
  const cw = glass.w * spec.scale;
  const from = -cw;
  const to = glass.w;
  const anim = useMemo(() => {
    // Beginnt bei `start`, zieht bis zum rechten Rand, springt nach links und läuft zur Startlage.
    const startX = from + (to - from) * spec.start;
    const edge = 1 - spec.start;
    return {
      animationName: {
        '0%': { transform: [{ translateX: startX }] },
        [pct(edge)]: { transform: [{ translateX: to }] },
        [pct(Math.min(1, edge + 0.001))]: { transform: [{ translateX: from }] },
        '100%': { transform: [{ translateX: startX }] },
      },
      animationDuration: `${spec.seconds}s`,
      animationTimingFunction: 'linear',
      animationIterationCount: 'infinite',
    } as const;
  }, [from, to, spec]);
  const ch = cw * 0.5;
  return (
    <Animated.View style={[styles.abs, { top: glass.h * spec.fy, width: cw, height: ch }, anim]}>
      <View style={[styles.puff, { left: 0, top: ch * 0.45, width: cw, height: ch * 0.55, backgroundColor: color }]} />
      <View style={[styles.puff, { left: cw * 0.15, top: ch * 0.15, width: cw * 0.4, height: ch * 0.7, backgroundColor: color }]} />
      <View style={[styles.puff, { left: cw * 0.42, top: 0, width: cw * 0.42, height: ch * 0.8, backgroundColor: color }]} />
    </Animated.View>
  );
}

const TWINKLE = {
  animationName: {
    from: { opacity: 0.3, transform: [{ scale: 0.6 }, { rotate: '45deg' }] },
    to: { opacity: 1, transform: [{ scale: 1.2 }, { rotate: '45deg' }] },
  },
  animationDuration: `${TWINKLE_MS}ms`,
  animationTimingFunction: 'ease-in-out',
  animationIterationCount: 'infinite',
  animationDirection: 'alternate',
} as const;

function Star({ glass, star }: { glass: Box; star: (typeof STARS)[number] }) {
  return (
    <Animated.View
      style={[
        styles.abs,
        { left: glass.w * star.fx, top: glass.h * star.fy, width: star.size, height: star.size, backgroundColor: SKY.star },
        TWINKLE,
        { animationDelay: `${star.delay}ms` },
      ]}
    />
  );
}

function ShootingStar({ glass }: { glass: Box }) {
  const anim = useMemo(() => {
    const total = SHOOTING_EVERY_MS + SHOOTING_MS;
    const rest = pct(SHOOTING_EVERY_MS / total);
    const at = (t: number) => [{ translateX: -t * glass.w * 0.6 }, { translateY: t * glass.h * 0.35 }, { rotate: '-30deg' }];
    return {
      animationName: {
        '0%': { opacity: 0, transform: at(0) },
        [rest]: { opacity: 0, transform: at(0) },
        [pct((SHOOTING_EVERY_MS + SHOOTING_MS * 0.4) / total)]: { opacity: 1, transform: at(0.4) },
        '100%': { opacity: 0, transform: at(1) },
      },
      animationDuration: `${total}ms`,
      animationTimingFunction: 'linear',
      animationIterationCount: 'infinite',
    } as const;
  }, [glass.w, glass.h]);
  return <Animated.View style={[styles.abs, styles.shooting, { left: glass.w * 0.75, top: glass.h * 0.1 }, anim]} />;
}

function Rain({ glass }: { glass: Box }) {
  const anim = useMemo(
    () =>
      ({
        animationName: { from: { transform: [{ translateY: -glass.h }] }, to: { transform: [{ translateY: 0 }] } },
        animationDuration: `${RAIN_MS}ms`,
        animationTimingFunction: 'linear',
        animationIterationCount: 'infinite',
      }) as const,
    [glass.h],
  );
  const streaks = Array.from({ length: RAIN_STREAKS }, (_, i) => ({
    left: ((i * 37) % 100) / 100,
    top: ((i * 53) % 100) / 100,
  }));
  return (
    <Animated.View style={[styles.abs, { left: 0, top: 0, width: glass.w, height: glass.h * 2 }, anim]}>
      {[0, 1].map((copy) =>
        streaks.map((s) => (
          <View
            key={`${copy}-${s.left}`}
            style={[styles.abs, styles.streak, { left: s.left * glass.w, top: (s.top + copy) * glass.h }]}
          />
        )),
      )}
    </Animated.View>
  );
}

/** Alles, was sich hinter der Scheibe bewegt. `glass` in Punkten relativ zum Zimmer. */
export function SkyLife({ glass, isDay, weather }: { glass: Box; isDay: boolean; weather: RoomWeather }) {
  const cloudColor = !isDay ? SKY.cloudNight : weather === 'rain' ? SKY.cloudRain : SKY.cloudDay;
  const showClouds = isDay || weather !== 'clear';
  return (
    <View pointerEvents="none" style={[styles.abs, styles.clip, { left: glass.x, top: glass.y, width: glass.w, height: glass.h }]}>
      {!isDay && weather !== 'rain' ? STARS.map((s) => <Star key={s.fx} glass={glass} star={s} />) : null}
      {!isDay && weather === 'clear' ? <ShootingStar glass={glass} /> : null}
      {showClouds ? CLOUDS[weather].map((c) => <Cloud key={c.fy} glass={glass} spec={c} color={cloudColor} />) : null}
      {weather === 'rain' ? <Rain glass={glass} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  abs: { position: 'absolute' },
  clip: { overflow: 'hidden' },
  puff: { position: 'absolute', borderRadius: 999 },
  shooting: { width: 16, height: 2, borderRadius: 2, backgroundColor: SKY.star },
  streak: { width: 1.5, height: 9, borderRadius: 1, backgroundColor: SKY.rain, transform: [{ rotate: '12deg' }] },
});
