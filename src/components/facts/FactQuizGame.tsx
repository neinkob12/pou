import { useState } from 'react';
import { Platform, Pressable, ScrollView, Text, View } from 'react-native';

import { factQuiz as t, minigameFeel } from '../../content/strings';
import { cue, useMinigameAudio } from '../../lib/audio';
import { colors } from '../../lib/theme';
import { useGameStore } from '../../store/gameStore';
import { PopupLayer } from '../minigames/framework/fx/PopupLayer';
import { useFx } from '../minigames/framework/fx/useFx';
import { digitIndex } from '../minigames/framework/input/keys';
import { useKeyDown } from '../minigames/framework/input/useKeyboard';
import type { MinigameSession } from '../minigames/framework/useMinigameSession';
import { QuizHeader } from './QuizHeader';
import { QuizOption, type OptionState } from './QuizOption';
import { pickQuizQuestions, pointsForAnswer } from './quiz';

function optionState(index: number, chosen: number | null, correctIndex: number): OptionState {
  if (chosen === null) return 'open';
  if (index === correctIndex) return 'correct';
  if (index === chosen) return 'wrong';
  return 'dimmed';
}

/** Höhe des Punkte-Popups (über den Antworten), waagerecht mittig. */
const POPUP_Y = 220;

/**
 * Fakten-Quiz im Minigame-Gerüst: drei Fragen, Auswertung über finishRound. Feedback (Auftrag 40):
 * Fortschrittspunkte, Zeitbalken, Antworten federn oder wackeln, Punkte-Popup, Ton, Tasten 1 bis 3.
 */
export function FactQuizGame({ session }: { session: MinigameSession }) {
  const unlockedIds = useGameStore((s) => s.unlockedFactIds);
  // Fragen einmal je Runde ziehen; "Nochmal" baut die Runde neu auf.
  const [questions] = useState(() => pickQuizQuestions(unlockedIds));
  const [index, setIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);
  const [results, setResults] = useState<(boolean | null)[]>(() => questions.map(() => null));
  const fx = useFx();
  const [width, setWidth] = useState(0);
  useMinigameAudio(session.phase, session.result?.coins ?? null);

  const question = questions[index];
  const playing = session.phase === 'playing';
  const isLast = index === questions.length - 1;

  const answer = (i: number) => {
    if (!question || !playing || chosen !== null) return;
    const ok = i === question.correctIndex;
    const points = pointsForAnswer(ok, correctCount, questions.length);
    session.addScore(points);
    cue(ok ? 'hit' : 'ouch');
    if (ok) {
      setCorrectCount((c) => c + 1);
      fx.popup(width / 2, POPUP_Y, `+${points}`, colors.plantDark, points > 10);
    }
    setResults((r) => r.map((v, n) => (n === index ? ok : v)));
    setChosen(i);
  };

  const next = () => {
    if (!playing || chosen === null) return;
    if (isLast) {
      session.endGame();
      return;
    }
    setIndex((n) => n + 1);
    setChosen(null);
  };

  useKeyDown((key) => {
    const n = digitIndex(key);
    if (n >= 0 && question && n < question.options.length) answer(n);
    else if (key === 'Enter' || key === ' ') next();
  });

  if (!question) return null;
  return (
    <View className="flex-1" onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      <ScrollView contentContainerClassName="gap-4 p-4">
        <QuizHeader index={index} results={results} secondsLeft={session.secondsLeft} />
        <Text className="font-heading text-2xl text-ink">{question.question}</Text>
        <View className="gap-3">
          {question.options.map((option, i) => (
            <QuizOption
              key={option}
              index={i}
              label={option}
              state={optionState(i, chosen, question.correctIndex)}
              disabled={!playing || chosen !== null}
              onPress={() => answer(i)}
            />
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
        {Platform.OS === 'web' && <Text className="font-body text-sm text-inkMuted">{minigameFeel.quizKeysHint}</Text>}
      </ScrollView>
      <PopupLayer popups={fx.popups} onDone={fx.removePopup} />
    </View>
  );
}
