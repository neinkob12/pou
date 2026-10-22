import { useEffect } from 'react';
import { Text } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';

import { colors, fonts } from '../../../lib/theme';

const RISE_PX = 30;
const LIFE_MS = 950;

/**
 * "+12" steigt aus der Mitte einer Bedürfnis-Kugel auf und verblasst (Redesign): zeigt, was die Pflege
 * gebracht hat. Weiße Schrift mit Kante in der Farbe des Bedürfnisses, damit sie über der Kugel steht.
 */
export function GainPop({ amount, color, onDone }: { amount: number; color: string; onDone: () => void }) {
  const t = useSharedValue(0);
  const pop = useSharedValue(0.4);

  useEffect(() => {
    t.set(withTiming(1, { duration: LIFE_MS, easing: Easing.out(Easing.cubic) }));
    pop.set(withSpring(1, { damping: 8, stiffness: 320 }));
    const id = setTimeout(onDone, LIFE_MS);
    return () => clearTimeout(id);
  }, [t, pop, onDone]);

  const style = useAnimatedStyle(() => ({
    opacity: t.value < 0.65 ? 1 : Math.max(0, (1 - t.value) / 0.35),
    transform: [{ translateY: -RISE_PX * t.value }, { scale: pop.value }],
  }));

  return (
    <Animated.View pointerEvents="none" style={[{ position: 'absolute', top: 12, alignSelf: 'center', zIndex: 30 }, style]}>
      <Text
        style={{
          fontFamily: fonts.headingBold,
          fontSize: 17,
          color: colors.white,
          textShadowColor: color,
          textShadowOffset: { width: 0, height: 2 },
          textShadowRadius: 0.1,
        }}
      >
        {`+${amount}`}
      </Text>
    </Animated.View>
  );
}
