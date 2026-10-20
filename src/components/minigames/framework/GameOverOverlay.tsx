import { useState } from 'react';
import { Text, View } from 'react-native';

import { minigameFeel, minigameFramework as t } from '../../../content/strings';
import { GameButton } from './GameButton';
import type { RoundResult } from './finishRound';
import { Overlay } from './Overlay';
import { ResultStars } from './ResultStars';
import { pointsToNextStar, starsFor } from './stars';

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

/** Ein Tipp je Runde, zufällig aus den Tipps des Spiels (Auftrag 40). */
function useTip(gameId: string): string | null {
  const [tip] = useState(() => {
    const list = minigameFeel.tips[gameId];
    return list && list.length > 0 ? list[Math.floor(Math.random() * list.length)] : null;
  });
  return tip;
}

/** Spielende: Sterne, Punkte, Münzen, Rekord, Laune-Hinweis, ein Tipp fürs Nochmal. */
export function GameOverOverlay({ result, onPlayAgain, onExit }: GameOverOverlayProps) {
  const stars = starsFor(result.gameId, result.score);
  const toNext = pointsToNextStar(result.gameId, result.score);
  const tip = useTip(result.gameId);
  return (
    <Overlay>
      <Text className="text-center font-heading text-3xl text-ink">{t.gameOver}</Text>
      <ResultStars stars={stars} />
      <Text className="text-center font-body text-sm text-inkMuted">
        {toNext === null ? minigameFeel.allStars : minigameFeel.nextStar(toNext)}
      </Text>
      {result.isNewHighscore && <Text className="text-center font-heading text-xl text-coral">{t.newHighscore}</Text>}
      <Row label={t.score} value={result.score} />
      <Row label={t.coinsEarned} value={`+${result.coins}`} />
      <Row label={t.highscore} value={result.highscore} />
      <Text className="text-center font-body text-base text-plantDark">{t.moodBonus}</Text>
      {tip && (
        <View className="rounded-2xl bg-white px-4 py-2">
          <Text className="font-body-bold text-sm text-ink">{minigameFeel.tipTitle}</Text>
          <Text className="font-body text-sm text-ink">{tip}</Text>
        </View>
      )}
      <GameButton label={t.playAgain} onPress={onPlayAgain} />
      <GameButton label={t.toSelection} onPress={onExit} variant="secondary" />
    </Overlay>
  );
}
