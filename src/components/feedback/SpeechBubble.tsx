import type { ReactNode } from 'react';
import { Text, View } from 'react-native';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';

import { colors, surface } from '../../lib/theme';
import { BudiAvatar } from './BudiAvatar';

/** Budis Kopf ragt zur Hälfte über die Blase. */
const AVATAR = 52;

interface SpeechBubbleProps {
  /** Wechselt der Schlüssel, springt die Blase neu herein (z. B. je Tutorial-Schritt). */
  bubbleKey: string;
  title: string;
  text: string;
  /** Kleine Zeile oben rechts, etwa "1 von 4". */
  kicker?: string;
  children?: ReactNode;
}

/** Budi spricht (WEB-3): Kopf oben links auf der Blase, springt beim Wechsel federnd herein. */
export function SpeechBubble({ bubbleKey, title, text, kicker, children }: SpeechBubbleProps) {
  return (
    <Animated.View key={bubbleKey} entering={FadeInDown.springify().damping(14)} exiting={FadeOutUp.duration(150)}>
      <View
        className="gap-2 rounded-3xl bg-white p-4"
        style={{
          marginTop: AVATAR / 2,
          paddingTop: AVATAR / 2 + 4,
          borderWidth: surface.line,
          borderBottomWidth: surface.edge,
          borderColor: colors.plantDark,
          boxShadow: '0 6px 18px rgba(43, 43, 43, 0.18)',
        }}
      >
        {kicker ? <Text className="absolute right-4 top-3 font-body text-xs text-inkMuted">{kicker}</Text> : null}
        <Text className="font-heading text-xl text-ink">{title}</Text>
        <Text className="font-body text-base text-ink">{text}</Text>
        {children}
      </View>
      <View className="absolute left-4 top-0">
        <BudiAvatar size={AVATAR} />
      </View>
    </Animated.View>
  );
}
