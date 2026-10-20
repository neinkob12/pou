import { useRouter } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MINIGAME_FEEL } from '../../../game/config';
import { CountdownOverlay, GoFlash } from './CountdownOverlay';
import { ExtraLifeOverlay } from './ExtraLifeOverlay';
import { GameOverOverlay } from './GameOverOverlay';
import { PauseOverlay } from './PauseOverlay';
import { useKeyDown } from './input/useKeyboard';
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

  // Am Rechner: Esc oder P pausiert und setzt fort, Enter startet nach dem Ende neu.
  useKeyDown((key) => {
    if (key === 'Escape' || key === 'p' || key === 'P') {
      if (phase === 'paused') session.resume();
      else if (phase === 'playing' || phase === 'countdown') session.pause();
    } else if (key === 'Enter' && result) {
      onPlayAgain();
    }
  });

  return (
    <SafeAreaView className="flex-1 bg-cream" edges={['top', 'bottom']}>
      <View className="w-full flex-1 self-center" style={{ maxWidth: MINIGAME_FEEL.playfieldMaxWidth }}>
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
          <GoFlash phase={phase} />
          {phase === 'paused' && <PauseOverlay onResume={session.resume} onQuit={session.quit} />}
          {session.extraLifeOffered && (
            <ExtraLifeOverlay onAccept={session.acceptExtraLife} onDecline={session.declineExtraLife} />
          )}
          {result && <GameOverOverlay result={result} onPlayAgain={onPlayAgain} onExit={exit} />}
        </View>
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
