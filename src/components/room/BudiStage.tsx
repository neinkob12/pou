import { useCallback, useEffect } from 'react';
import { Text, View } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { budi, room as roomAssets } from '../../lib/assets';
import { care, room } from '../../content/strings';
import { useNeeds } from '../../hooks/useNeeds';
import { AssetImage } from '../ui/AssetImage';
import { useCareStage } from './care/CareStage';
import { JoyBurst } from './care/JoyBurst';
import { usePetGesture } from './care/usePetGesture';

const PLANT_SIZE = 160;
const POT_WIDTH = 170;
const POT_HEIGHT = 130;
/** Budi wird größer, wenn ein Werkzeug über ihm schwebt ("Mund auf"). */
const HOVER_SCALE = 0.08;
const BOUNCE_SCALE = 1.12;
const SHAKE_PX = 8;
const SHAKE_MS = 60;

// Slot (P10). Budi-Grafik als PNG-Ebenen kommt mit P20.
/** Budi in der Mitte: Ziel der Pflege-Werkzeuge, streicheln per Wisch-Geste. */
export function BudiStage() {
  const { targetRef, hovering, reaction, react } = useCareStage();
  const { condition, canCare, care: doCare } = useNeeds();
  const bounce = useSharedValue(1);
  const shake = useSharedValue(0);

  const onPet = useCallback(() => {
    const feedback = doCare('pet');
    if (feedback) react('pet', feedback);
  }, [doCare, react]);
  const pet = usePetGesture(canCare, onPet);

  useEffect(() => {
    if (!reaction) return;
    if (reaction.feedback === 'success') {
      bounce.value = withSequence(withTiming(BOUNCE_SCALE, { duration: 120 }), withSpring(1));
    } else {
      shake.value = withSequence(
        withTiming(SHAKE_PX, { duration: SHAKE_MS }),
        withTiming(-SHAKE_PX, { duration: SHAKE_MS }),
        withTiming(SHAKE_PX, { duration: SHAKE_MS }),
        withTiming(0, { duration: SHAKE_MS }),
      );
    }
  }, [reaction, bounce, shake]);

  const hover = useDerivedValue(() => withSpring(hovering.get()));
  const budiStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: shake.value },
      { scale: bounce.value * (1 + hover.value * HOVER_SCALE) },
    ],
  }));

  const joy = reaction?.type === 'pet' && reaction.feedback === 'success' ? reaction.id : 0;
  const showCondition = condition !== null && condition !== 'ok';

  return (
    <View className="flex-1 items-center justify-end pb-4">
      {showCondition ? (
        <Text className="mb-2 rounded-full bg-white/80 px-3 py-1 font-body-bold text-sm text-ink">
          {care.conditions[condition]}
        </Text>
      ) : null}
      <GestureDetector gesture={pet}>
        <Animated.View
          ref={targetRef}
          accessible
          accessibilityRole="button"
          accessibilityLabel={care.petLabel}
          accessibilityState={{ disabled: !canCare }}
          accessibilityActions={[{ name: 'activate' }]}
          onAccessibilityAction={() => canCare && onPet()}
          style={budiStyle}
        >
          <AssetImage source={budi.b3_vegetative_small} label={room.plant} color="plantLight" size={PLANT_SIZE} round />
          <JoyBurst trigger={joy} color="coral" />
        </Animated.View>
      </GestureDetector>
      <View className="-mt-4">
        <AssetImage source={roomAssets.u1_pot} label={room.pot} color="terracotta" size={POT_WIDTH} height={POT_HEIGHT} />
      </View>
    </View>
  );
}
