import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  FadeOut,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
  ZoomIn,
} from 'react-native-reanimated';

import { roomHud } from '../../../content/strings';
import { ui } from '../../../lib/assets';
import { chrome, radii } from '../../../lib/theme';
import { AssetImage } from '../../ui/AssetImage';
import type { NeedBarDef } from '../needBars';
import { GainPop } from './GainPop';
import { hud, NEED_TONES } from './hudStyle';
import { needLevel } from './needLevel';

const SIZE = 44;
const ICON = 26;
const WIGGLE_DEG = 7;
/** Wellenkamm auf der Füllung: Abstand der Bögen und Dauer eines Durchlaufs. */
const WAVE_STEP = 14;
const WAVE_MS = 1600;
const TIP_MS = 1600;

/** Welle als CSS-Animation: läuft im Compositor bzw. UI-Thread, kein JavaScript pro Frame. */
const WAVE = {
  animationName: { from: { transform: [{ translateX: 0 }] }, to: { transform: [{ translateX: -WAVE_STEP }] } },
  animationDuration: `${WAVE_MS}ms`,
  animationTimingFunction: 'linear',
  animationIterationCount: 'infinite',
} as const;

interface NeedBadgeProps {
  bar: NeedBarDef;
  /** 0 bis 100. */
  value: number;
  label: string;
  /** Ohne Pflanze: leere Kugel ohne Alarm. */
  idle?: boolean;
}

/**
 * Bedürfnis als Kugel (Redesign): Flüssigkeit steigt mit dem Wert, oben läuft eine kleine Welle.
 * Federt beim Auffüllen, wackelt mit Ausrufezeichen, wenn es knapp wird. Antippen zeigt Name und
 * Prozent, damit die Leiste ohne Beschriftung auskommt.
 */
export function NeedBadge({ bar, value, label, idle = false }: NeedBadgeProps) {
  const clamped = Math.min(100, Math.max(0, value));
  const level = idle ? 'ok' : needLevel(clamped);
  const tone = NEED_TONES[bar.id];
  const reduced = useReducedMotion();
  const fill = useSharedValue(clamped / 100);
  const pop = useSharedValue(1);
  const wiggle = useSharedValue(0);
  const [tip, setTip] = useState(false);
  const tipTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [gain, setGain] = useState<{ amount: number; key: number } | null>(null);
  const lastValue = useRef(clamped);
  const clearGain = useCallback(() => setGain(null), []);

  // Gestiegen (Pflege, Minispiel-Bonus): "+N" steigt auf. Sinken durch die Zeit zeigt nichts.
  useEffect(() => {
    const diff = Math.round(clamped - lastValue.current);
    lastValue.current = clamped;
    if (diff >= 1 && !idle) setGain((g) => ({ amount: diff, key: (g?.key ?? 0) + 1 }));
  }, [clamped, idle]);

  useEffect(() => {
    const rising = clamped / 100 > fill.value + 0.01;
    fill.value = withSpring(clamped / 100, { damping: 14, stiffness: 120 });
    if (rising) pop.value = withSequence(withTiming(1.22, { duration: 110 }), withSpring(1, { damping: 6, stiffness: 220 }));
  }, [clamped, fill, pop]);

  useEffect(() => {
    if (level === 'ok' || reduced) {
      cancelAnimation(wiggle);
      wiggle.value = withTiming(0, { duration: 150 });
      return;
    }
    const beat = level === 'critical' ? 90 : 140;
    wiggle.value = withRepeat(
      withSequence(
        withTiming(-1, { duration: beat }),
        withTiming(1, { duration: beat * 2 }),
        withTiming(0, { duration: beat }),
        withTiming(0, { duration: level === 'critical' ? 500 : 1400, easing: Easing.linear }),
      ),
      -1,
    );
    return () => cancelAnimation(wiggle);
  }, [level, wiggle, reduced]);

  useEffect(() => () => {
    if (tipTimer.current) clearTimeout(tipTimer.current);
  }, []);

  const showTip = () => {
    if (tipTimer.current) clearTimeout(tipTimer.current);
    setTip(true);
    tipTimer.current = setTimeout(() => setTip(false), TIP_MS);
  };

  const fillStyle = useAnimatedStyle(() => ({ height: `${fill.value * 100}%` }));
  const badgeStyle = useAnimatedStyle(() => ({ transform: [{ scale: pop.value }, { rotate: `${wiggle.value * WIGGLE_DEG}deg` }] }));
  const low = level !== 'ok';
  const rounded = Math.round(clamped);

  return (
    <Pressable
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={{ min: 0, max: 100, now: rounded }}
      onPress={showTip}
      hitSlop={4}
      style={{ alignItems: 'center' }}
    >
      <Animated.View style={badgeStyle}>
        <View
          style={{
            width: SIZE,
            height: SIZE,
            borderRadius: SIZE / 2,
            borderWidth: hud.line - 1,
            borderColor: low ? hud.warn : hud.outline,
            backgroundColor: hud.track,
            overflow: 'hidden',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: low ? `0 0 0 3px ${tone.light}` : undefined,
          }}
        >
          <Animated.View style={[{ position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: tone.base }, fillStyle]}>
            {/* Wellenkamm: Reihe aus Bögen, die seitlich läuft. */}
            {rounded > 2 ? (
              <View style={{ position: 'absolute', top: -5, left: 0, height: 10, width: SIZE + WAVE_STEP * 2 }}>
                <Animated.View style={[{ flexDirection: 'row' }, reduced ? null : WAVE]}>
                  {Array.from({ length: Math.ceil(SIZE / WAVE_STEP) + 3 }, (_, i) => (
                    <View key={i} style={{ width: WAVE_STEP, height: 10, borderRadius: 5, backgroundColor: tone.base }} />
                  ))}
                </Animated.View>
              </View>
            ) : null}
            <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '40%', backgroundColor: tone.dark, opacity: 0.35 }} />
          </Animated.View>
          <View
            pointerEvents="none"
            style={{ position: 'absolute', top: 5, left: 9, width: 16, height: 6, borderRadius: radii.pill, backgroundColor: hud.gloss }}
          />
          <AssetImage source={ui[bar.icon]} label={label} color={bar.color} size={ICON} round icon={bar.art} />
        </View>
        {low ? (
          <View
            style={{
              position: 'absolute',
              top: -4,
              right: -4,
              width: 18,
              height: 18,
              borderRadius: 9,
              borderWidth: 2,
              borderColor: chrome.glass,
              backgroundColor: hud.warn,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text className="font-heading text-xs text-white">!</Text>
          </View>
        ) : null}
      </Animated.View>
      {gain ? <GainPop key={gain.key} amount={gain.amount} color={tone.edge} onDone={clearGain} /> : null}
      {tip ? (
        <Animated.View
          entering={ZoomIn.springify().damping(12)}
          exiting={FadeOut.duration(150)}
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: SIZE + 8,
            zIndex: 20,
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: radii.pill,
            backgroundColor: hud.hintBg,
            alignItems: 'center',
          }}
        >
          <Text numberOfLines={1} className="font-heading text-xs text-white">
            {roomHud.needValue(label, rounded)}
          </Text>
          {low ? <Text className="font-body-bold text-[10px] text-white">{roomHud.needLow}</Text> : null}
        </Animated.View>
      ) : null}
    </Pressable>
  );
}
