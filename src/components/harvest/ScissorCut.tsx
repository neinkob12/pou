import * as Haptics from 'expo-haptics';
import { Text, View } from 'react-native';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { harvestScreen } from '../../content/strings';
import { harvest as harvestAssets } from '../../lib/assets';
import { colors, radii } from '../../lib/theme';
import { AssetImage } from '../ui/AssetImage';

/** So weit (Punkte) muss die Schere quer über den Stiel gezogen werden. */
const CUT_DISTANCE = 140;
const AREA_HEIGHT = 220;
const SCISSORS_SIZE = 64;

/** Schnitt-Rückmeldung. Fehler (Gerät ohne Haptik) ignorieren. */
function playCutHaptic(): void {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
}

interface ScissorCutProps {
  onCut: () => void;
}

/** Schere-Geste: Schere quer über Budis Stiel wischen. */
export function ScissorCut({ onCut }: ScissorCutProps) {
  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const done = useSharedValue(false);

  const cut = () => {
    playCutHaptic();
    onCut();
  };

  const pan = usePanGesture({
    minDistance: 4,
    onActivate: () => {
      'worklet';
      done.value = false;
    },
    onUpdate: (e) => {
      'worklet';
      x.value = e.translationX;
      y.value = e.translationY;
      if (!done.value && Math.abs(e.translationX) >= CUT_DISTANCE) {
        done.value = true;
        scheduleOnRN(cut);
      }
    },
    onFinalize: () => {
      'worklet';
      x.value = withSpring(0);
      y.value = withSpring(0);
    },
  });

  const scissorsStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }, { translateY: y.value }],
  }));

  return (
    <View className="items-center gap-3">
      <Text className="font-heading text-2xl text-ink">{harvestScreen.cutTitle}</Text>
      <Text className="text-center font-body text-base text-ink">{harvestScreen.cutIntro}</Text>
      <GestureDetector gesture={pan}>
        <View style={{ width: '100%', height: AREA_HEIGHT, alignItems: 'center', justifyContent: 'center' }}>
          <View
            accessibilityLabel={harvestScreen.cutStem}
            style={{ width: 16, height: AREA_HEIGHT, borderRadius: radii.sm, backgroundColor: colors.plantLight }}
          />
          <Animated.View style={[{ position: 'absolute', left: 8 }, scissorsStyle]}>
            <AssetImage source={harvestAssets.u8_scissors} label={harvestScreen.cutScissors} size={SCISSORS_SIZE} round />
          </Animated.View>
        </View>
      </GestureDetector>
    </View>
  );
}
