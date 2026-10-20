import { useRouter } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CountdownOverlay } from './CountdownOverlay';
import { ExtraLifeOverlay } from './ExtraLifeOverlay';
import { GameOverOverlay } from './GameOverOverlay';
import { PauseOverlay } from './PauseOverlay';
import { ScoreHud } from './ScoreHud';
import { useMinigameSession, type MinigameSession, type MinigameSessionOptions } from './useMinigameSession';

export interface MinigameShellProps extends MinigameSessionOptions {
  title: string;
  /** Das eigentliche Spiel. Bekommt die Runde (Uhr, Punkte, Ende) und füllt das Spielfeld. */
  children: (session: MinigameSession) => ReactNode;
}

function Round({ title, children, onPlayAgain, ...options }: MinigameShellProps & { onPlayAgain: () => void }) {
  const router = useRouter();
  const session = useMinigameSession(options);
  const { phase, result } = session;
  const exit = () => (router.canGoBack() ? router.back() : router.replace('/minigames'));

  return (
    <SafeAreaView className="flex-1 bg-cream" edges={['top', 'bottom']}>
      <ScoreHud
        title={title}
        score={session.score}
        secondsLeft={session.secondsLeft}
        canPause={phase === 'playing' || phase === 'countdown'}
        onPause={session.pause}
      />
      <View className="flex-1">
        {children(session)}
        {phase === 'countdown' && <CountdownOverlay value={session.countdown} />}
        {phase === 'paused' && <PauseOverlay onResume={session.resume} onQuit={session.quit} />}
        {session.extraLifeOffered && (
          <ExtraLifeOverlay onAccept={session.acceptExtraLife} onDecline={session.declineExtraLife} />
        )}
        {result && <GameOverOverlay result={result} onPlayAgain={onPlayAgain} onExit={exit} />}
      </View>
    </SafeAreaView>
  );
}

/**
 * Gerüst für jedes Minigame: Countdown, Kopfzeile mit Punkten und Pause, Pause-Menü,
 * Extra-Leben, Spielende mit Münzen und Rekord. "Nochmal" startet eine frische Runde.
 */
export function MinigameShell(props: MinigameShellProps) {
  const [round, setRound] = useState(0);
  return <Round key={round} {...props} onPlayAgain={() => setRound((r) => r + 1)} />;
}
