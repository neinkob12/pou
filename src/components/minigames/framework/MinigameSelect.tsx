import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { minigameFramework as t, minigames } from '../../../content/strings';
import { useGameStore } from '../../../store/gameStore';
import { GameText } from '../../ui/GameText';
import { MINIGAME_CATALOG } from './catalog';
import { MinigameCard } from './MinigameCard';

/** Auswahl-Screen: eine Karte je Minigame mit Rekord. */
export function MinigameSelect() {
  const highscores = useGameStore((s) => s.minigameHighscores);
  return (
    <SafeAreaView className="flex-1 bg-cream" edges={['top']}>
      <ScrollView contentContainerClassName="gap-4 p-4">
        <GameText variant="title" accessibilityRole="header">
          {minigames.title}
        </GameText>
        <GameText variant="body">{t.selectSubtitle}</GameText>
        {MINIGAME_CATALOG.map((game) => (
          <MinigameCard key={game.id} game={game} highscore={highscores[game.id]} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
