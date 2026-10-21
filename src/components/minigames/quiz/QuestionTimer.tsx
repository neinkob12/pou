// Bedenkzeit der aktuellen Quiz-Frage (Auftrag 45): Balken, der schrumpft und zum Ende koralle wird.

import { Text, View } from 'react-native';

import { minigameFun } from '../../../content/strings';

interface QuestionTimerProps {
  secondsLeft: number;
  totalSeconds: number;
}

export function QuestionTimer({ secondsLeft, totalSeconds }: QuestionTimerProps) {
  const share = totalSeconds > 0 ? Math.max(0, Math.min(1, secondsLeft / totalSeconds)) : 0;
  const low = share <= 0.34;
  return (
    <View className="flex-row items-center gap-2">
      <View className="h-3 flex-1 overflow-hidden rounded-full bg-white">
        <View
          className={`h-full rounded-full ${low ? 'bg-coral' : 'bg-lavender'}`}
          style={{ width: `${share * 100}%` }}
        />
      </View>
      <Text className={`font-body-bold text-sm ${low ? 'text-coral' : 'text-ink'}`}>
        {minigameFun.quizQuestionTime(secondsLeft)}
      </Text>
    </View>
  );
}
