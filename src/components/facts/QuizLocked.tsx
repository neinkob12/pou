import { ScrollView, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { factQuiz as t } from '../../content/strings';
import { FACT_QUIZ } from '../../game/config';
import { BackButton } from '../ui/BackButton';

/** Hinweis, wenn noch zu wenige Karten fürs Quiz freigeschaltet sind. */
export function QuizLocked() {
  return (
    <SafeAreaView className="flex-1 bg-cream" edges={['top']}>
      <ScrollView contentContainerClassName="gap-4 p-4">
        <Text className="font-heading text-3xl text-ink">{t.notEnoughTitle}</Text>
        <Text className="font-body text-base text-ink">{t.notEnoughText(FACT_QUIZ.questionsPerRound)}</Text>
        <BackButton />
      </ScrollView>
    </SafeAreaView>
  );
}
