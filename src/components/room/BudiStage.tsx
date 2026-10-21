import { useCallback } from 'react';
import { Text, View } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';

import { care } from '../../content/strings';
import { useEquippedAccessory } from '../../hooks/useEquippedAccessory';
import { useNeeds } from '../../hooks/useNeeds';
import { Budi } from '../budi/Budi';
import { budiSpeak } from '../budi/voice';
import { ComaOverlay } from '../budi/ComaOverlay';
import { Pests } from '../budi/Pests';
import { useCareStage } from './care/CareStage';
import { HoverGlow } from './care/HoverGlow';
import { hud } from './hud/hudStyle';
import { usePetGesture } from './care/usePetGesture';

// Slot (P10). Budi-Grafik, Idle-Animation und Reaktionen (inkl. Herzen beim Streicheln) aus P20 und WEB-1.
/** Budi in der Mitte: Ziel der Pflege-Werkzeuge, streicheln per Wisch-Geste. */
export function BudiStage() {
  const { targetRef, hovering, reaction, react } = useCareStage();
  const { condition, canCare, care: doCare } = useNeeds();

  const onPet = useCallback(() => {
    const feedback = doCare('pet');
    if (feedback) react('pet', feedback);
    budiSpeak();
  }, [doCare, react]);
  const pet = usePetGesture(canCare, onPet);

  const showCondition = condition !== null && condition !== 'ok';

  return (
    <View className="flex-1 items-center justify-end pb-4">
      {showCondition ? (
        <View className="mb-2 rounded-full border-2 bg-white px-3 py-1" style={{ borderColor: hud.outline, borderBottomWidth: 4 }}>
          <Text className="font-body-bold text-sm text-ink">{care.conditions[condition]}</Text>
        </View>
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
          <HoverGlow hovering={hovering} />
          <Budi condition={condition} reaction={reaction} hovering={hovering} accessory={useEquippedAccessory()} />
          <Pests />
          <ComaOverlay condition={condition} />
        </Animated.View>
      </GestureDetector>
    </View>
  );
}
