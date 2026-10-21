import { Text, View } from 'react-native';
import Animated, { FadeInLeft } from 'react-native-reanimated';

import { screenUi } from '../../content/strings';
import { colors, radii, surface } from '../../lib/theme';
import { BudiAvatar } from '../feedback/BudiAvatar';
import { BRAND_WIDTH } from './frameLayout';

const text = screenUi.frame;

/** Titel der Web-Version neben dem Rahmen am Rechner (WEB-5): Budi, Name, Satz, kurze Hinweise. */
export function FrameBrand({ compact }: { compact: boolean }) {
  if (compact) {
    return (
      <View style={{ position: 'absolute', top: 20, left: 24, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <BudiAvatar size={36} />
        <Text className="font-heading text-2xl text-cream">{text.title}</Text>
      </View>
    );
  }
  return (
    <Animated.View entering={FadeInLeft.springify().damping(16)} style={{ width: BRAND_WIDTH, gap: 18 }}>
      <BudiAvatar size={88} />
      <View style={{ gap: 6 }}>
        <Text className="font-heading text-cream" style={{ fontSize: 56, lineHeight: 60 }}>
          {text.title}
        </Text>
        <Text className="font-body text-xl text-cream/80">{text.tagline}</Text>
      </View>
      <View
        style={{
          alignSelf: 'flex-start',
          backgroundColor: colors.lamp,
          borderRadius: radii.pill,
          borderWidth: surface.line,
          borderColor: colors.ink,
          paddingHorizontal: 12,
          paddingVertical: 3,
        }}
      >
        <Text className="font-body-bold text-sm text-ink">{text.badge}</Text>
      </View>
      <View style={{ gap: 8 }}>
        {text.hints.map((hint) => (
          <View key={hint} style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-start' }}>
            <View style={{ width: 8, height: 8, marginTop: 7, borderRadius: 4, backgroundColor: colors.plantLight }} />
            <Text className="flex-1 font-body text-base text-cream/70">{hint}</Text>
          </View>
        ))}
      </View>
    </Animated.View>
  );
}
