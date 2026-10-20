import { Pressable, Text, View } from 'react-native';

import { minigameFramework as t } from '../../../content/strings';

interface ScoreHudProps {
  title: string;
  score: number;
  secondsLeft: number | null;
  canPause: boolean;
  onPause: () => void;
}

/** Kopfzeile: Spielname, Punkte, Restzeit, Pause-Knopf. */
export function ScoreHud({ title, score, secondsLeft, canPause, onPause }: ScoreHudProps) {
  return (
    <View className="flex-row items-center gap-3 px-4 py-2">
      <Text className="flex-1 font-heading text-xl text-ink" numberOfLines={1}>
        {title}
      </Text>
      <Text className="font-body-bold text-base text-ink">
        {t.score}: {score}
      </Text>
      {secondsLeft !== null && (
        <Text className="font-body-bold text-base text-ink">
          {t.timeLeft}: {secondsLeft}
        </Text>
      )}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t.pause}
        disabled={!canPause}
        onPress={onPause}
        className={`rounded-full bg-white px-3 py-1 active:opacity-70 ${canPause ? '' : 'opacity-40'}`}
      >
        <Text className="font-body-bold text-base text-ink">{t.pause}</Text>
      </Pressable>
    </View>
  );
}
