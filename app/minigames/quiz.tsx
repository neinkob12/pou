import { QuizLocked } from '../../src/components/facts/QuizLocked';
import { canStartQuiz } from '../../src/components/facts/quiz';
import { MinigameShell } from '../../src/components/minigames/framework/MinigameShell';
import { QuizGame } from '../../src/components/minigames/quiz/QuizGame';
import { minigames } from '../../src/content/strings';
import { FACT_QUIZ } from '../../src/game/config';
import { useGameStore } from '../../src/store/gameStore';

export default function QuizRoute() {
  const unlockedIds = useGameStore((s) => s.unlockedFactIds);
  if (!canStartQuiz(unlockedIds)) return <QuizLocked />;

  return (
    <MinigameShell gameId="quiz" title={minigames.quiz} durationSeconds={FACT_QUIZ.durationSeconds}>
      {(session) => <QuizGame session={session} />}
    </MinigameShell>
  );
}
