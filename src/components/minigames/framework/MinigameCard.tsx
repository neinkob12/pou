import { Link } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { minigameFramework as t } from '../../../content/strings';
import { Placeholder } from '../../ui/Placeholder';
import type { MinigameInfo } from './catalog';

interface MinigameCardProps {
  game: MinigameInfo;
  highscore: number | undefined;
}

/** Karte im Auswahl-Screen: Bild (Platzhalter), Name, Beschreibung, Rekord. */
export function MinigameCard({ game, highscore }: MinigameCardProps) {
  return (
    <Link href={game.href} asChild>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${t.play}: ${game.title}`}
        className="flex-row gap-4 rounded-3xl bg-white p-4 active:opacity-70"
      >
        <Placeholder label={game.title} color={game.color} width={72} height={72} round />
        <View className="flex-1 gap-1">
          <Text className="font-heading text-xl text-ink">{game.title}</Text>
          <Text className="font-body text-sm text-inkMuted">{game.description}</Text>
          <Text className="font-body-bold text-sm text-ink">
            {highscore ? `${t.highscore}: ${highscore}` : t.noHighscore}
          </Text>
        </View>
      </Pressable>
    </Link>
  );
}
