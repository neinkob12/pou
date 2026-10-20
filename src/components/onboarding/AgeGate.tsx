import { useState } from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { onboarding } from '../../content/strings';
import { useGameStore } from '../../store/gameStore';
import { Button } from '../ui/Button';

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
        {declined ? (
          <>
            <Text className="font-heading text-3xl text-ink">{onboarding.declined.title}</Text>
            <Text className="font-body text-base text-ink">{onboarding.declined.text}</Text>
          </>
        ) : (
          <>
            <Text className="font-heading text-3xl text-ink">{onboarding.age.title}</Text>
            <Text className="font-body text-base text-ink">{onboarding.age.intro}</Text>
            <Text className="font-body-bold text-lg text-ink">{onboarding.age.question}</Text>
            <View className="gap-3">
              <Button label={onboarding.age.yes} onPress={confirmAge} />
              <Button label={onboarding.age.no} variant="secondary" onPress={() => setDeclined(true)} />
            </View>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}
