// Fakten-Quiz im Minigame-Gerüst mit den neuen Elementen (Auftrag 45): Bedenkzeit je Frage, die von
// Frage zu Frage knapper wird, und ein 50:50-Joker pro Runde. Fragen und Punkte kommen aus
// facts/quiz.ts, Kopf und Antwort-Knöpfe aus facts/ (Auftrag 40). Ersetzt FactQuizGame in der Route.

import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { useFrameCallback, useSharedValue } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { factQuiz as t, minigameFun } from '../../../content/strings';
import { MINIGAME_FUN } from '../../../game/config';
import { cue, useMinigameAudio } from '../../../lib/audio';
import { colors } from '../../../lib/theme';
import { useGameStore } from '../../../store/gameStore';
import { pickQuizQuestions, pointsForAnswer } from '../../facts/quiz';
import { QuizHeader } from '../../facts/QuizHeader';
import { QuizOption, type OptionState } from '../../facts/QuizOption';
import { PopupLayer } from '../framework/fx/PopupLayer';
import { useFx } from '../framework/fx/useFx';
import { digitIndex } from '../framework/input/keys';
import { useKeyDown } from '../framework/input/useKeyboard';
import type { MinigameSession } from '../framework/useMinigameSession';
import { QuestionTimer } from './QuestionTimer';
import { jokerHides, questionSecondsLeft, questionTimedOut, questionTimeMs } from './quizFun';

/** Gewählte Antwort: Index, oder TIMED_OUT, wenn die Bedenkzeit abgelaufen ist. */
const TIMED_OUT = -1;
/** Höhe des Punkte-Popups (über den Antworten), waagerecht mittig. */
const POPUP_Y = 220;

function optionState(index: number, chosen: number | null, correctIndex: number, hidden: number): OptionState {
  if (chosen === null) return index === hidden ? 'dimmed' : 'open';
  if (index === correctIndex) return 'correct';
  if (index === chosen) return 'wrong';
  return 'dimmed';
}

export function QuizGame({ session }: { session: MinigameSession }) {
  const { clock } = session;
  const unlockedIds = useGameStore((s) => s.unlockedFactIds);
  const [questions] = useState(() => pickQuizQuestions(unlockedIds));
  const [index, setIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);
  const [results, setResults] = useState<(boolean | null)[]>(() => questions.map(() => null));
  const [jokersLeft, setJokersLeft] = useState<number>(MINIGAME_FUN.quiz.jokersPerRound);
  const [hidden, setHidden] = useState(-1);
  const [qLeft, setQLeft] = useState(questionSecondsLeft(0, 0, 0));
  const startedAt = useSharedValue(0);
  const qIndex = useSharedValue(0);
  const open = useSharedValue(true);
  const shownLeft = useSharedValue(-1);
  const fx = useFx();
  const [width, setWidth] = useState(0);
  useMinigameAudio(session.phase, session.result?.coins ?? null);

  const question = questions[index];
  const playing = session.phase === 'playing';
  const isLast = index === questions.length - 1;

  const settle = (choice: number) => {
    if (!question || chosen !== null) return;
    open.set(false);
    const ok = choice === question.correctIndex;
    const points = pointsForAnswer(ok, correctCount, questions.length);
    session.addScore(points);
    cue(ok ? 'hit' : 'ouch');
    if (ok) {
      setCorrectCount((c) => c + 1);
      fx.popup(width / 2, POPUP_Y, `+${points}`, colors.plantDark, points > 10);
    } else if (choice === TIMED_OUT) {
      fx.popup(width / 2, POPUP_Y, minigameFun.quizTimeUp, colors.coral, true);
    }
    setResults((r) => r.map((v, n) => (n === index ? ok : v)));
    setChosen(choice);
  };

  // Der Frame-Callback ruft immer dieselbe Funktion, die den aktuellen Stand über die Ref liest.
  const settleRef = useRef(settle);
  useEffect(() => {
    settleRef.current = settle;
  });
  const onTimeUp = useCallback(() => settleRef.current(TIMED_OUT), []);

  // Bedenkzeit läuft mit der Spielzeit (steht also in der Pause), abgelaufen zählt als falsch.
  useFrameCallback(() => {
    'worklet';
    const { phase, elapsedMs } = clock.get();
    if (phase !== 'playing' || !open.get()) return;
    const left = questionSecondsLeft(elapsedMs, startedAt.get(), qIndex.get());
    if (left !== shownLeft.get()) {
      shownLeft.set(left);
      scheduleOnRN(setQLeft, left);
    }
    if (questionTimedOut(elapsedMs, startedAt.get(), qIndex.get())) {
      open.set(false);
      scheduleOnRN(onTimeUp);
    }
  });

  const answer = (i: number) => {
    if (!playing || i === hidden) return;
    settle(i);
  };

  const playJoker = () => {
    if (!question || !playing || chosen !== null || jokersLeft <= 0) return;
    cue('collect');
    setJokersLeft((n) => n - 1);
    setHidden(jokerHides(question.options.length, question.correctIndex, Math.random()));
  };

  const next = () => {
    if (!playing || chosen === null) return;
    if (isLast) {
      session.endGame();
      return;
    }
    qIndex.set(index + 1);
    startedAt.set(clock.get().elapsedMs);
    open.set(true);
    setQLeft(Math.round(questionTimeMs(index + 1) / 1000));
    setIndex((n) => n + 1);
    setChosen(null);
    setHidden(-1);
  };

  useKeyDown((key) => {
    const n = digitIndex(key);
    if (n >= 0 && question && n < question.options.length) answer(n);
    else if (key === 'j' || key === 'J') playJoker();
    else if (key === 'Enter' || key === ' ') next();
  });

  if (!question) return null;
  const right = question.options[question.correctIndex];
  return (
    <View className="flex-1" onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      <ScrollView contentContainerClassName="gap-4 p-4">
        <QuizHeader index={index} results={results} secondsLeft={session.secondsLeft} />
        <QuestionTimer secondsLeft={chosen === null ? qLeft : 0} totalSeconds={questionTimeMs(index) / 1000} />
        <Text className="font-heading text-2xl text-ink">{question.question}</Text>
        <View className="gap-3">
          {question.options.map((option, i) => (
            <QuizOption
              key={option}
              index={i}
              label={option}
              state={optionState(i, chosen, question.correctIndex, hidden)}
              disabled={!playing || chosen !== null || i === hidden}
              onPress={() => answer(i)}
            />
          ))}
        </View>
        {chosen !== null ? (
          <View className="gap-3">
            <Text className="font-body text-base text-ink">
              {chosen === question.correctIndex
                ? t.correct
                : chosen === TIMED_OUT
                  ? minigameFun.quizTimeUpText(right)
                  : t.wrong(right)}
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
          <View className="flex-row items-center justify-between gap-3">
            <Text className="flex-1 font-body text-sm text-plantDark">{t.perfectHint}</Text>
            <Pressable
              accessibilityRole="button"
              disabled={!playing || jokersLeft <= 0}
              onPress={playJoker}
              className={`rounded-full bg-lavender px-4 py-2 active:opacity-70 ${jokersLeft > 0 ? '' : 'opacity-40'}`}
            >
              <Text className="font-body-bold text-base text-white">
                {jokersLeft > 0 ? minigameFun.quizJoker : minigameFun.quizJokerUsed}
              </Text>
            </Pressable>
          </View>
        )}
        {Platform.OS === 'web' && <Text className="font-body text-sm text-inkMuted">{minigameFun.quizKeysHint}</Text>}
      </ScrollView>
      <PopupLayer popups={fx.popups} onDone={fx.removePopup} />
    </View>
  );
}
