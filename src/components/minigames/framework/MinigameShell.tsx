import { useRouter } from 'expo-router';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { minigameFun } from '../../../content/strings';
import { MINIGAME_FEEL } from '../../../game/config';
import { colors } from '../../../lib/theme';
import { useGameStore } from '../../../store/gameStore';
import { CountdownOverlay, GoFlash } from './CountdownOverlay';
import { ExtraLifeOverlay } from './ExtraLifeOverlay';
import { EventBanner, useBanner } from './fx/EventBanner';
import { GameOverOverlay } from './GameOverOverlay';
import { PauseOverlay } from './PauseOverlay';
import { useKeyDown } from './input/useKeyboard';
import { beatsRecord, roundGoal } from './roundGoal';
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

  // Bestwert-Jagd (Auftrag 45): Rekord zu Rundenbeginn, Banner beim ersten Überholen.
  const [record] = useState(() => useGameStore.getState().minigameHighscores[options.gameId] ?? 0);
  const recordShown = useRef(false);
  const { banner, show: showBanner, clear: clearBanner } = useBanner();
  useEffect(() => {
    if (!beatsRecord(session.score, record, recordShown.current)) return;
    recordShown.current = true;
    showBanner(minigameFun.newRecord, colors.lavender);
  }, [record, session.score, showBanner]);

  // Am Rechner: Esc oder P pausiert und setzt fort, Enter startet nach dem Ende neu. Enter erst
  // nach kurzer Zeit, damit das Enter, das die Runde beendet (Quiz), nicht gleich neu startet.
  const resultShownAt = useRef<number | null>(null);
  useEffect(() => {
    resultShownAt.current = result ? Date.now() : null;
  }, [result]);
  useKeyDown((key) => {
    if (key === 'Escape' || key === 'p' || key === 'P') {
      if (phase === 'paused') session.resume();
      else if (phase === 'playing' || phase === 'countdown') session.pause();
    } else if (
      key === 'Enter' &&
      resultShownAt.current !== null &&
      Date.now() - resultShownAt.current > MINIGAME_FEEL.restartKeyDelayMs
    ) {
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
          goal={roundGoal(options.gameId, session.score)}
          record={record}
        />
        <View className="flex-1">
          {children(session)}
          {phase === 'countdown' && <CountdownOverlay value={session.countdown} />}
          <GoFlash phase={phase} />
          {!result && <EventBanner banner={banner} onDone={clearBanner} top="32%" />}
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
