import { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { ui } from '../../../lib/assets';
import { radii } from '../../../lib/theme';
import { AssetImage } from '../../ui/AssetImage';
import type { NeedBarDef } from '../needBars';
import { hud, NEED_TONES } from './hudStyle';
import { needLevel } from './needLevel';

const SIZE = 46;
const ICON = 28;
const WIGGLE_DEG = 7;

interface NeedBadgeProps {
  bar: NeedBarDef;
  /** 0 bis 100. */
  value: number;
  label: string;
}

/**
 * Bedürfnis als runde Plakette (ART-4), wie in Pou: füllt sich von unten mit Farbe, federt beim
 * Auffüllen, wackelt mit Ausrufezeichen, wenn der Wert niedrig ist.
 */
export function NeedBadge({ bar, value, label }: NeedBadgeProps) {
  const clamped = Math.min(100, Math.max(0, value));
  const level = needLevel(clamped);
  const tone = NEED_TONES[bar.id];
  const fill = useSharedValue(clamped / 100);
  const pop = useSharedValue(1);
  const wiggle = useSharedValue(0);

  useEffect(() => {
    const rising = clamped / 100 > fill.value + 0.01;
    fill.value = withSpring(clamped / 100, { damping: 14, stiffness: 120 });
    if (rising) pop.value = withSequence(withTiming(1.18, { duration: 110 }), withSpring(1, { damping: 6, stiffness: 220 }));
  }, [clamped, fill, pop]);

  useEffect(() => {
    if (level === 'ok') {
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
  }, [level, wiggle]);

  const fillStyle = useAnimatedStyle(() => ({ height: `${fill.value * 100}%` }));
  const badgeStyle = useAnimatedStyle(() => ({ transform: [{ scale: pop.value }, { rotate: `${wiggle.value * WIGGLE_DEG}deg` }] }));

  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(clamped) }}
      className="flex-1 items-center gap-0.5"
    >
      <Animated.View style={badgeStyle}>
        <View
          style={{
            width: SIZE,
            height: SIZE,
            borderRadius: SIZE / 2,
            borderWidth: hud.line,
            borderColor: hud.outline,
            borderBottomWidth: hud.line + 2,
            backgroundColor: hud.track,
            overflow: 'hidden',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Animated.View style={[{ position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: tone.base }, fillStyle]}>
            <View style={{ height: 3, backgroundColor: tone.edge, opacity: 0.5 }} />
          </Animated.View>
          <View
            pointerEvents="none"
            style={{ position: 'absolute', top: 4, left: 10, width: 18, height: 7, borderRadius: radii.pill, backgroundColor: hud.gloss }}
          />
          <AssetImage source={ui[bar.icon]} label={label} color={bar.color} size={ICON} round icon={bar.art} />
        </View>
        {level === 'ok' ? null : (
          <View
            style={{
              position: 'absolute',
              top: -3,
              right: -3,
              width: 18,
              height: 18,
              borderRadius: 9,
              borderWidth: 2,
              borderColor: hud.outline,
              backgroundColor: hud.warn,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text className="font-heading text-xs text-white">!</Text>
          </View>
        )}
      </Animated.View>
      <Text numberOfLines={1} className="font-body-bold text-[11px] text-ink">
        {label}
      </Text>
    </View>
  );
}
