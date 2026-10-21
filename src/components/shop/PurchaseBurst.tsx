import { View } from 'react-native';
import Animated, { FadeOut, ZoomIn } from 'react-native-reanimated';

import { GoldCoin } from '../feedback/GoldCoin';
import { Sparkles } from '../feedback/Sparkles';

const COIN_SIZE = 30;
/** Die Münze steigt auf und verschwindet. */
const RISE = 46;

/**
 * Kauf-Moment (ART-5) über dem Bild der Karte: Funken spritzen, eine Münze ploppt auf und steigt.
 * Neuer `playKey` (größer 0) spielt es erneut ab.
 */
export function PurchaseBurst({ playKey }: { playKey: number }) {
  if (playKey <= 0) return null;
  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Sparkles count={14} playKey={playKey} />
      <Animated.View
        key={playKey}
        entering={ZoomIn.springify().damping(7)}
        exiting={FadeOut}
        style={{ position: 'absolute', top: -RISE }}
      >
        <GoldCoin size={COIN_SIZE} />
      </Animated.View>
    </View>
  );
}
