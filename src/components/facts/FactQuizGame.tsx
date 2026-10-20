import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { factQuiz as t } from '../../content/strings';
import { useGameStore } from '../../store/gameStore';
import type { MinigameSession } from '../minigames/framework/useMinigameSession';
import { pickQuizQuestions, pointsForAnswer } from './quiz';

function optionStyle(index: number, chosen: number | null, correctIndex: number): string {
  if (chosen === null) return 'bg-white border-plantDark';
  if (index === correctIndex) return 'bg-plantLight border-plantDark';
  if (index === chosen) return 'bg-coral border-coral';
  return 'bg-white border-inkMuted opacity-60';
}

/** Fakten-Quiz als einfache UI im Minigame-Gerüst: drei Fragen, Auswertung über finishRound. */
export function FactQuizGame({ session }: { session: MinigameSession }) {
  const unlockedIds = useGameStore((s) => s.unlockedFactIds);
  // Fragen einmal je Runde ziehen; "Nochmal" baut die Runde neu auf.
  const [questions] = useState(() => pickQuizQuestions(unlockedIds));
  const [index, setIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);

  const question = questions[index];
  if (!question) return null;
  const playing = session.phase === 'playing';
  const isLast = index === questions.length - 1;

  const answer = (i: number) => {
    if (!playing || chosen !== null) return;
    const ok = i === question.correctIndex;
    session.addScore(pointsForAnswer(ok, correctCount, questions.length));
    if (ok) setCorrectCount((c) => c + 1);
    setChosen(i);
  };

  const next = () => {
    if (isLast) {
      session.endGame();
      return;
    }
    setIndex((n) => n + 1);
    setChosen(null);
  };

  return (
    <ScrollView contentContainerClassName="gap-4 p-4">
      <Text className="font-body text-sm text-inkMuted">{t.questionCounter(index + 1, questions.length)}</Text>
      <Text className="font-heading text-2xl text-ink">{question.question}</Text>
      <View className="gap-3">
        {question.options.map((option, i) => (
          <Pressable
            key={option}
            accessibilityRole="button"
            accessibilityState={{ disabled: !playing || chosen !== null, selected: chosen === i }}
            onPress={() => answer(i)}
            className={`rounded-2xl border-2 p-4 active:opacity-70 ${optionStyle(i, chosen, question.correctIndex)}`}
          >
            <Text className="font-body-bold text-base text-ink">{option}</Text>
          </Pressable>
        ))}
      </View>
      {chosen !== null ? (
        <View className="gap-3">
          <Text className="font-body text-base text-ink">
            {chosen === question.correctIndex ? t.correct : t.wrong(question.options[question.correctIndex])}
          </Text>
          <Pressable
            accessibilityRole="button"
            disabled={!playing}
            onPress={next}
            className="items-center rounded-full bg-coral px-5 py-3 active:opacity-70"
          >
            <Text className="font-body-bold text-base text-white">{isLast ? t.finish : t.next}</Text>
          </Pressable>
        </View>
      ) : (
        <Text className="font-body text-sm text-plantDark">{t.perfectHint}</Text>
      )}
    </ScrollView>
  );
}
