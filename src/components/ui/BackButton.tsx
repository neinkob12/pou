import { useRouter } from 'expo-router';
import { Pressable, Text } from 'react-native';

import { common } from '../../content/strings';

/** Zurück zum vorherigen Screen, sonst zum Zimmer. */
export function BackButton() {
  const router = useRouter();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
      className="self-start rounded-full bg-coral px-4 py-2 active:opacity-70"
    >
      <Text className="font-body-bold text-base text-white">{common.back}</Text>
    </Pressable>
  );
}
