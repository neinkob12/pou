import { Link } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { minigameFramework as t } from '../../../content/strings';
import { depth, gameRadii, outline, shadows, spacing, tones } from '../../../lib/theme';
import { GlossFill } from '../../ui/game/GlossFill';
import { usePressSpring } from '../../ui/game/usePressSpring';
import { GameText } from '../../ui/GameText';
import type { MinigameInfo } from './catalog';
import { MinigameIcon } from './MinigameIcon';

interface MinigameCardProps {
  game: MinigameInfo;
  highscore: number | undefined;
}

/**
 * Karte im Auswahl-Screen (Auftrag 51 im Spiel-Look): dicke Kontur, Kante unten wie ein 3D-Knopf,
 * sinkt beim Tippen ein und federt zurück. Bild der Spielfigur, Name, Beschreibung, Rekord-Pille.
 */
export function MinigameCard({ game, highscore }: MinigameCardProps) {
  const press = usePressSpring({ sink: depth.md });
  const inner = gameRadii.card - outline.regular;
  return (
    <Animated.View style={[styles.shadow, press.outerStyle]}>
      <Link href={game.href} asChild>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${t.play}: ${game.title}`}
          onPressIn={press.onPressIn}
          onPressOut={press.onPressOut}
          style={styles.edge}
        >
          <Animated.View style={[styles.face, press.faceStyle]}>
            <GlossFill tone={tones.cream} radius={inner} />
            <View style={styles.row}>
              <MinigameIcon game={game} />
              <View style={styles.text}>
                <GameText variant="heading">{game.title}</GameText>
                <GameText variant="body" color={tones.stone.text}>
                  {game.description}
                </GameText>
                <View style={[styles.record, { backgroundColor: highscore ? tones.gold.base : tones.stone.base }]}>
                  <GameText variant="small" color={highscore ? tones.gold.text : tones.stone.text}>
                    {highscore ? `${t.highscore}: ${highscore}` : t.noHighscore}
                  </GameText>
                </View>
              </View>
            </View>
          </Animated.View>
        </Pressable>
      </Link>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  shadow: { borderRadius: gameRadii.card, boxShadow: shadows.card },
  edge: {
    borderRadius: gameRadii.card,
    borderWidth: outline.regular,
    borderColor: outline.color,
    backgroundColor: tones.cream.edge,
    paddingBottom: depth.md,
  },
  face: { borderRadius: gameRadii.card - outline.regular },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md - 4 },
  text: { flex: 1, gap: 2 },
  record: {
    alignSelf: 'flex-start',
    marginTop: 2,
    borderRadius: gameRadii.pill,
    borderWidth: outline.thin,
    borderColor: outline.color,
    paddingHorizontal: spacing.sm,
    paddingVertical: 1,
  },
});
