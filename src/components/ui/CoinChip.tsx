import { useEffect } from 'react';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring } from 'react-native-reanimated';

import { ui } from '../../lib/assets';
import { springs } from '../../lib/theme';
import { useTweenedNumber } from '../feedback/useTweenedNumber';
import { AssetImage } from './AssetImage';
import { Chip } from './Chip';

const BUMP_SCALE = 1.25;

interface CoinChipProps {
  coins: number;
  accessibilityLabel?: string;
}

/** Münzanzeige als Zähler-Pille (ART-1). Ändert sich der Stand, zählt er hoch und hüpft mit Federung. */
export function CoinChip({ coins, accessibilityLabel }: CoinChipProps) {
  const { shown, changes } = useTweenedNumber(coins);
  const scale = useSharedValue(1);

  useEffect(() => {
    if (changes === 0) return;
    scale.set(withSequence(withSpring(BUMP_SCALE, springs.press), withSpring(1, springs.release)));
  }, [changes, scale]);

  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View style={[{ alignSelf: 'flex-start' }, style]}>
      <Chip
        accessibilityLabel={accessibilityLabel}
        icon={<AssetImage source={ui.u9_coin} label="U9" color="coral" size={28} round icon="coin" />}
        value={shown}
      />
    </Animated.View>
  );
}
