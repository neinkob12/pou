import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { common, screenUi } from '../../content/strings';
import { tones } from '../../lib/theme';
import { Button } from './Button';
import { GameText } from './GameText';

/** Zurück zum vorherigen Screen, sonst zum Zimmer. Kleiner 3D-Knopf in Creme (ART-1). */
export function BackButton() {
  const router = useRouter();
  return (
    <View style={{ alignSelf: 'flex-start' }}>
      <Button
        size="sm"
        variant="secondary"
        label={common.back}
        leading={<GameText variant="heading" color={tones.cream.text}>{screenUi.backArrow}</GameText>}
        onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
      />
    </View>
  );
}
