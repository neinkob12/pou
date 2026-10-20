import { Text, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';

import { starDelays } from './celebration';

interface StarRowProps {
  stars: number;
  max: number;
  full: string;
  empty: string;
  accessibilityLabel: string;
}

/** Sterne springen nacheinander herein, volle zuerst, leere blass dahinter (WEB-3). */
export function StarRow({ stars, max, full, empty, accessibilityLabel }: StarRowProps) {
  const delays = starDelays(max);
  return (
    <View accessibilityLabel={accessibilityLabel} className="flex-row gap-1">
      {delays.map((delay, i) => (
        <Animated.View key={i} entering={ZoomIn.delay(delay).springify().damping(9)}>
          <Text className={`font-heading text-5xl ${i < stars ? 'text-lamp' : 'text-inkMuted/40'}`}>
            {i < stars ? full : empty}
          </Text>
        </Animated.View>
      ))}
    </View>
  );
}
