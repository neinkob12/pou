import { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming } from 'react-native-reanimated';

import { ui } from '../../lib/assets';
import { useTweenedNumber } from '../feedback/useTweenedNumber';
import { AssetImage } from './AssetImage';

const BUMP_SCALE = 1.25;

interface CoinChipProps {
  coins: number;
  accessibilityLabel?: string;
}

/** Münzanzeige als Pille: Münz-Icon (U9) und Betrag. Ändert sich der Stand, zählt er und hüpft (WEB-3). */
export function CoinChip({ coins, accessibilityLabel }: CoinChipProps) {
  const { shown, changes } = useTweenedNumber(coins);
  const scale = useSharedValue(1);

  useEffect(() => {
    if (changes === 0) return;
    scale.value = withSequence(withTiming(BUMP_SCALE, { duration: 120 }), withSpring(1, { damping: 8 }));
  }, [changes, scale]);

  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View style={style}>
      <View accessibilityLabel={accessibilityLabel} className="flex-row items-center gap-2 rounded-full bg-white px-3 py-1">
        <AssetImage source={ui.u9_coin} label="U9" color="coral" size={22} round />
        <Text className="font-body-bold text-base text-ink">{shown}</Text>
      </View>
    </Animated.View>
  );
}
