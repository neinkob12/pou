import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { radii, surface } from '../../lib/theme';

const RAY_COUNT = 8;
const TURN_MS = 14000;
const PULSE_MS = 1100;

/**
 * Langsam kreisende Lichtstrahlen mit pulsierendem Schein hinter einem Höhepunkt (WEB-5), etwa der
 * Erntekiste. Nur Transform und Deckkraft, kein Neuzeichnen.
 */
export function GlowRays({ size }: { size: number }) {
  const turn = useSharedValue(0);
  const pulse = useSharedValue(0.7);
  useEffect(() => {
    turn.value = withRepeat(withTiming(360, { duration: TURN_MS, easing: Easing.linear }), -1);
    pulse.value = withRepeat(
      withSequence(withTiming(1, { duration: PULSE_MS }), withTiming(0.7, { duration: PULSE_MS })),
      -1,
    );
  }, [turn, pulse]);
  const rays = useAnimatedStyle(() => ({ transform: [{ rotate: `${turn.value}deg` }] }));
  const glow = useAnimatedStyle(() => ({ opacity: pulse.value, transform: [{ scale: 0.9 + pulse.value * 0.1 }] }));
  const rayWidth = size * 0.12;

  return (
    <View
      pointerEvents="none"
      style={{ position: 'absolute', width: size, height: size, alignItems: 'center', justifyContent: 'center' }}
    >
      <Animated.View
        style={[
          { position: 'absolute', width: size, height: size, alignItems: 'center', justifyContent: 'center' },
          rays,
        ]}
      >
        {Array.from({ length: RAY_COUNT }, (_, i) => (
          <View
            key={i}
            style={{
              position: 'absolute',
              width: rayWidth,
              height: size,
              borderRadius: radii.pill,
              backgroundColor: surface.glow,
              opacity: 0.55,
              transform: [{ rotate: `${(180 / RAY_COUNT) * i}deg` }],
            }}
          />
        ))}
      </Animated.View>
      <Animated.View
        style={[
          { width: size * 0.62, height: size * 0.62, borderRadius: radii.pill, backgroundColor: surface.glow },
          glow,
        ]}
      />
    </View>
  );
}
