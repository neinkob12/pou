// Fakten-Quiz im Minigame-Gerüst mit den neuen Elementen (Auftrag 45): Bedenkzeit je Frage, die von
// Frage zu Frage knapper wird, und ein 50:50-Joker pro Runde. Fragen und Punkte kommen aus
// facts/quiz.ts. Auftrag 51: eigener Spiel-Look (lila Bühne mit Lichtkugeln, Fragekarte, 3D-Knöpfe).

import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useFrameCallback, useSharedValue } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { factQuiz as t, minigameFun } from '../../../content/strings';
import { MINIGAME_FUN } from '../../../game/config';
import { cue, useMinigameAudio } from '../../../lib/audio';
import { colors, gameRadii, outline, shadows, spacing, tones } from '../../../lib/theme';
import { useGameStore } from '../../../store/gameStore';
import { pickQuizQuestions, pointsForAnswer } from '../../facts/quiz';
import { Button } from '../../ui/Button';
import { gradientStyle } from '../../ui/game/gradient';
import { GameText } from '../../ui/GameText';
import { Drift } from '../framework/art/Drift';
import { backdrops } from '../framework/art/palette';
import { drawTapBokeh } from '../framework/example/tapArt';
import { PopupLayer } from '../framework/fx/PopupLayer';
import { useFx } from '../framework/fx/useFx';
import { digitIndex } from '../framework/input/keys';
import { useKeyDown } from '../framework/input/useKeyboard';
import type { MinigameSession } from '../framework/useMinigameSession';
import { QuestionTimer } from './QuestionTimer';
import { QuizAnswer, type AnswerState } from './QuizAnswer';
import { QuizTop } from './QuizTop';
import { jokerHides, questionSecondsLeft, questionTimedOut, questionTimeMs } from './quizFun';

/** Gewählte Antwort: Index, oder TIMED_OUT, wenn die Bedenkzeit abgelaufen ist. */
const TIMED_OUT = -1;
/** Höhe des Punkte-Popups (über den Antworten), waagerecht mittig. */
const POPUP_Y = 220;

function optionState(index: number, chosen: number | null, correctIndex: number, hidden: number): AnswerState {
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
  const [box, setBox] = useState({ width: 0, height: 0 });
  const width = box.width;
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
      fx.popup(width / 2, POPUP_Y, `+${points}`, tones.leaf.light, points > 10);
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
    <View
      style={[styles.stage, gradientStyle(`linear-gradient(180deg, ${backdrops.quiz.join(', ')})`, backdrops.quiz[1])]}
      onLayout={(e) => setBox({ width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height })}
    >
      {box.width > 0 && (
        <Drift width={box.width} height={box.height} draw={drawTapBokeh} durationMs={18000} direction="up" />
      )}
      <ScrollView contentContainerStyle={styles.content}>
        <QuizTop index={index} results={results} />
        <QuestionTimer secondsLeft={chosen === null ? qLeft : 0} totalSeconds={questionTimeMs(index) / 1000} />
        <View style={styles.card}>
          <GameText variant="heading">{question.question}</GameText>
        </View>
        <View style={styles.answers}>
          {question.options.map((option, i) => (
            <QuizAnswer
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
          <View style={styles.answers}>
            <GameText variant="bodyBold" color={tones.cream.light} shadow>
              {chosen === question.correctIndex
                ? t.correct
                : chosen === TIMED_OUT
                  ? minigameFun.quizTimeUpText(right)
                  : t.wrong(right)}
            </GameText>
            <Button label={isLast ? t.finish : t.next} onPress={next} disabled={!playing} size="lg" />
          </View>
        ) : (
          <View style={styles.jokerRow}>
            <GameText variant="bodyBold" color={tones.gold.light} shadow style={styles.flex}>
              {t.perfectHint}
            </GameText>
            <Button
              label={jokersLeft > 0 ? minigameFun.quizJoker : minigameFun.quizJokerUsed}
              onPress={playJoker}
              disabled={!playing || jokersLeft <= 0}
              variant="gold"
              size="sm"
            />
          </View>
        )}
        {Platform.OS === 'web' && (
          <GameText variant="small" color={tones.cream.light}>
            {minigameFun.quizKeysHint}
          </GameText>
        )}
      </ScrollView>
      <PopupLayer popups={fx.popups} onDone={fx.removePopup} />
    </View>
  );
}

const styles = StyleSheet.create({
  stage: { flex: 1, overflow: 'hidden' },
  content: { gap: spacing.md, padding: spacing.md },
  card: {
    borderRadius: gameRadii.card,
    borderWidth: outline.regular,
    borderColor: outline.color,
    backgroundColor: tones.cream.light,
    padding: spacing.md,
    boxShadow: shadows.card,
  },
  answers: { gap: spacing.md - 4 },
  jokerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md - 4 },
  flex: { flex: 1 },
});
