import { useCallback } from 'react';
import { Text, useWindowDimensions, View } from 'react-native';
import { GestureDetector, useCompetingGestures, useTapGesture } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { care } from '../../content/strings';
import { useEquippedAccessory } from '../../hooks/useEquippedAccessory';
import { useNeeds } from '../../hooks/useNeeds';
import { useGameStore } from '../../store/gameStore';
import { Budi } from '../budi/Budi';
import { budiSpeak } from '../budi/voice';
import { ComaOverlay } from '../budi/ComaOverlay';
import { Pests } from '../budi/Pests';
import { useCareStage } from './care/CareStage';
import { HoverGlow } from './care/HoverGlow';
import { chrome, springs } from '../../lib/theme';
import { budiStageSize } from './hud/budiStageSize';
import { usePetGesture } from './care/usePetGesture';

/** Antippen: wie stark Budi staucht, und wie weich er zurückfedert. */
const POKE_SQUASH = 0.09;
const POKE_SPRING = { ...springs.release, damping: 6 };
/** Sprechblase zum Zustand: Oberkante als Anteil der Budi-Größe, knapp über dem Topfrand. */
const BUBBLE_TOP = 0.3;

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

  // Antippen: Budi federt wie Gummi und plappert (nur Spaß, keine Pflege, zählt für kein Ziel).
  // Aus, solange Schädlinge zum Wegtippen auf ihm sitzen oder er im Koma liegt.
  const hasPests = useGameStore((s) => s.health.pests.length > 0);
  const boing = useSharedValue(0);
  const poke = useTapGesture({
    enabled: condition !== null && condition !== 'coma' && !hasPests,
    onActivate: () => {
      'worklet';
      boing.value = withSequence(withTiming(1, { duration: 80 }), withSpring(0, POKE_SPRING));
      scheduleOnRN(budiSpeak);
    },
  });
  const gesture = useCompetingGestures(pet, poke);
  const boingStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: 1 + boing.value * POKE_SQUASH }, { scaleY: 1 - boing.value * POKE_SQUASH * 1.3 }],
  }));

  const showCondition = condition !== null && condition !== 'ok';
  const { height } = useWindowDimensions();
  const size = budiStageSize(height);

  return (
    <View className="items-center pb-3">
      <GestureDetector gesture={gesture}>
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
          <Animated.View style={[{ transformOrigin: 'bottom' }, boingStyle]}>
            <Budi condition={condition} reaction={reaction} hovering={hovering} accessory={useEquippedAccessory()} size={size} />
          </Animated.View>
          <Pests size={size} />
          {showCondition ? (
            // Sprechblase neben dem Topfrand, Spitze zu Budi: Budi sagt selbst, was fehlt.
            <View pointerEvents="none" style={{ position: 'absolute', top: size * BUBBLE_TOP, right: -6, maxWidth: size * 0.5 }}>
              <View
                className="rounded-2xl px-3 py-1.5"
                style={{ backgroundColor: chrome.glass, borderWidth: 1, borderColor: chrome.glassLine, boxShadow: chrome.glassShadow }}
              >
                <Text className="font-heading text-sm text-ink">{care.conditions[condition]}</Text>
              </View>
              <View
                style={{ width: 12, height: 12, marginTop: -7, marginLeft: 16, backgroundColor: chrome.glass, transform: [{ rotate: '45deg' }] }}
              />
            </View>
          ) : null}
          <ComaOverlay condition={condition} />
        </Animated.View>
      </GestureDetector>
    </View>
  );
}
