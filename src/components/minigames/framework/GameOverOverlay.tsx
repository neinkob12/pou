import { Text, View } from 'react-native';

import { minigameFramework as t } from '../../../content/strings';
import { GameButton } from './GameButton';
import type { RoundResult } from './finishRound';
import { Overlay } from './Overlay';

interface GameOverOverlayProps {
  result: RoundResult;
  onPlayAgain: () => void;
  onExit: () => void;
}

function Row({ label, value }: { label: string; value: string | number }) {
  return (
    <View className="flex-row justify-between">
      <Text className="font-body text-lg text-ink">{label}</Text>
      <Text className="font-body-bold text-lg text-ink">{value}</Text>
    </View>
  );
}

/** Spielende: Punkte, Münzen, Rekord, Laune-Hinweis. */
export function GameOverOverlay({ result, onPlayAgain, onExit }: GameOverOverlayProps) {
  return (
    <Overlay>
      <Text className="text-center font-heading text-3xl text-ink">{t.gameOver}</Text>
      {result.isNewHighscore && (
        <Text className="text-center font-heading text-xl text-coral">{t.newHighscore}</Text>
      )}
      <Row label={t.score} value={result.score} />
      <Row label={t.coinsEarned} value={`+${result.coins}`} />
      <Row label={t.highscore} value={result.highscore} />
      <Text className="text-center font-body text-base text-plantDark">{t.moodBonus}</Text>
      <GameButton label={t.playAgain} onPress={onPlayAgain} />
      <GameButton label={t.toSelection} onPress={onExit} variant="secondary" />
    </Overlay>
  );
}
