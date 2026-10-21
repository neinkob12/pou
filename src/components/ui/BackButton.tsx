import { useRouter } from 'expo-router';
import { Pressable, Text } from 'react-native';

import { common, screenUi } from '../../content/strings';
import { colors, surface } from '../../lib/theme';

/** Zurück zum vorherigen Screen, sonst zum Zimmer. Kleine Pille mit Kontur wie die Knöpfe (WEB-5). */
export function BackButton() {
  const router = useRouter();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={common.back}
      onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
      hitSlop={8}
      className="min-h-10 flex-row items-center gap-1 self-start rounded-full bg-white px-4"
      style={({ pressed }) => ({
        borderWidth: surface.line,
        borderColor: colors.plantDark,
        borderBottomWidth: pressed ? surface.line : surface.edge - 1,
        transform: [{ translateY: pressed ? 1 : 0 }],
      })}
    >
      <Text className="font-heading text-lg text-plantDark">{screenUi.backArrow}</Text>
      <Text className="font-body-bold text-sm text-ink">{common.back}</Text>
    </Pressable>
  );
}
