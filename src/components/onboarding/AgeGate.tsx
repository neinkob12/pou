import { useState } from 'react';
import { Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { onboarding } from '../../content/strings';
import { useGameStore } from '../../store/gameStore';
import { BudiAvatar } from '../feedback/BudiAvatar';
import { GlowRays } from '../feedback/GlowRays';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

const GLOW_SIZE = 220;

/**
 * Altersfrage beim Erststart. Ja: bestätigt, die Weiche (OnboardingGate) bringt den Spieler ins
 * Zimmer. Nein: freundlicher Abschied ohne Weg ins Spiel; beim nächsten Start fragt die App neu.
 */
export function AgeGate() {
  const confirmAge = useGameStore((s) => s.confirmAge);
  const [declined, setDeclined] = useState(false);

  return (
    <SafeAreaView className="flex-1 bg-cream">
      <View className="flex-1 justify-center gap-6 p-6">
        <View style={{ height: GLOW_SIZE * 0.7, alignItems: 'center', justifyContent: 'center' }}>
          <GlowRays size={GLOW_SIZE} />
          <Animated.View entering={FadeInDown.springify().damping(12)}>
            <BudiAvatar size={104} />
          </Animated.View>
        </View>
        <Animated.View entering={FadeInDown.delay(120).springify().damping(16)}>
          <Card padding={20}>
            {declined ? (
              <>
                <Text className="text-center font-heading text-3xl text-ink">{onboarding.declined.title}</Text>
                <Text className="text-center font-body text-base text-inkMuted">{onboarding.declined.text}</Text>
              </>
            ) : (
              <>
                <Text className="text-center font-heading text-3xl text-ink">{onboarding.age.title}</Text>
                <Text className="text-center font-body text-base text-inkMuted">{onboarding.age.intro}</Text>
                <Text className="pt-2 text-center font-body-bold text-lg text-ink">{onboarding.age.question}</Text>
                <View className="gap-3 pt-2">
                  <Button label={onboarding.age.yes} onPress={confirmAge} />
                  <Button label={onboarding.age.no} variant="secondary" onPress={() => setDeclined(true)} />
                </View>
              </>
            )}
          </Card>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}
