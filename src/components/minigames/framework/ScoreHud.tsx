import { Pressable, Text, View } from 'react-native';

import { minigameFramework as t, minigameFun } from '../../../content/strings';
import type { RoundGoal } from './roundGoal';

interface ScoreHudProps {
  title: string;
  score: number;
  secondsLeft: number | null;
  canPause: boolean;
  onPause: () => void;
  /** Ziel der Runde und Rekord vor Rundenbeginn (Auftrag 45), zweite Zeile. */
  goal?: RoundGoal | null;
  record?: number;
}

function goalText(goal: RoundGoal): string {
  return goal.nextStars === null || goal.points === null
    ? minigameFun.goalAllStars
    : minigameFun.goalNextStar(goal.nextStars, goal.points);
}

/** Kopfzeile: Spielname, Punkte, Restzeit, Pause-Knopf; darunter Sterne-Ziel und Rekord. */
export function ScoreHud({ title, score, secondsLeft, canPause, onPause, goal, record = 0 }: ScoreHudProps) {
  return (
    <View className="px-4 py-2">
      <View className="flex-row items-center gap-3">
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
      {(goal || record > 0) && (
        <View className="flex-row justify-end gap-3">
          {goal && <Text className="font-body-bold text-sm text-lavender">{goalText(goal)}</Text>}
          {record > 0 && <Text className="font-body text-sm text-inkMuted">{minigameFun.record(record)}</Text>}
        </View>
      )}
    </View>
  );
}
