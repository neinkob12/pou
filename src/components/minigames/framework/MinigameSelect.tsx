import { View } from 'react-native';

import { minigameFramework as t, minigames } from '../../../content/strings';
import { useGameStore } from '../../../store/gameStore';
import { GameScreen } from '../../frame/GameScreen';
import { Appear } from '../../ui/Appear';
import { MINIGAME_CATALOG } from './catalog';
import { featuredGame } from './hubLook';
import { MinigameCard } from './MinigameCard';

/**
 * Auswahl-Screen (Redesign): oben groß das Spiel des Tagesziels, darunter alle anderen als Kacheln
 * im Raster. Spiel-Hintergrund wie die anderen Screens (ART-5).
 */
export function MinigameSelect() {
  const highscores = useGameStore((s) => s.minigameHighscores);
  const goal = useGameStore((s) => s.dailyGoal);
  const { game: top, forGoal } = featuredGame(MINIGAME_CATALOG, goal);
  const rest = MINIGAME_CATALOG.filter((g) => g.id !== top.id);
  return (
    <GameScreen backdrop="games" title={minigames.title} subtitle={t.selectSubtitle}>
      <Appear>
        <MinigameCard game={top} highscore={highscores[top.id]} featured forGoal={forGoal} />
      </Appear>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        {rest.map((game, i) => (
          <View key={game.id} style={{ width: '47%', flexGrow: 1 }}>
            <Appear index={i + 1}>
              <MinigameCard game={game} highscore={highscores[game.id]} />
            </Appear>
          </View>
        ))}
      </View>
    </GameScreen>
  );
}
