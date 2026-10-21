import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { colors } from '../../lib/theme';
import { BudiAvatar } from '../feedback/BudiAvatar';
import { Button } from './Button';
import { Card } from './Card';
import { GameText } from './GameText';

const BOB_PX = 4;
const BOB_MS = 1200;

interface EmptyStateProps {
  title: string;
  text: string;
  action?: { label: string; onPress: () => void };
}

/** Leerer Zustand (WEB-5): Budi schaukelt leicht, darunter Titel, Hinweis und ein Knopf. */
export function EmptyState({ title, text, action }: EmptyStateProps) {
  const y = useSharedValue(0);
  useEffect(() => {
    y.set(withRepeat(
      withSequence(withTiming(-BOB_PX, { duration: BOB_MS }), withTiming(0, { duration: BOB_MS })),
      -1,
    ));
  }, [y]);
  const bob = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));

  return (
    <Card tone="muted" padding={24}>
      <View className="items-center gap-3">
        <Animated.View style={bob}>
          <BudiAvatar size={72} />
        </Animated.View>
        <GameText variant="heading" align="center">
          {title}
        </GameText>
        <GameText align="center" color={colors.inkMuted}>
          {text}
        </GameText>
        {action ? (
          <View className="w-full pt-1">
            <Button label={action.label} onPress={action.onPress} />
          </View>
        ) : null}
      </View>
    </Card>
  );
}
