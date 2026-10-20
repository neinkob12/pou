import { useCallback } from 'react';
import { Text, View } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';

import { care } from '../../content/strings';
import { useNeeds } from '../../hooks/useNeeds';
import { Budi } from '../budi/Budi';
import { useCareStage } from './care/CareStage';
import { JoyBurst } from './care/JoyBurst';
import { usePetGesture } from './care/usePetGesture';

// Slot (P10). Budi-Grafik, Idle-Animation und Reaktionen (Squash-and-Stretch) aus P20.
/** Budi in der Mitte: Ziel der Pflege-Werkzeuge, streicheln per Wisch-Geste. */
export function BudiStage() {
  const { targetRef, hovering, reaction, react } = useCareStage();
  const { condition, canCare, care: doCare } = useNeeds();

  const onPet = useCallback(() => {
    const feedback = doCare('pet');
    if (feedback) react('pet', feedback);
  }, [doCare, react]);
  const pet = usePetGesture(canCare, onPet);

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
        >
          <Budi condition={condition} reaction={reaction} hovering={hovering} />
          <JoyBurst trigger={joy} color="coral" />
        </Animated.View>
      </GestureDetector>
    </View>
  );
}
