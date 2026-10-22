import { Link } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { dailyGoals, gamesHub, minigameFramework as t } from '../../../content/strings';
import { chrome, colors, depth, gameRadii, radii, spacing, tones, type Tone } from '../../../lib/theme';
import { gradientStyle } from '../../ui/game/gradient';
import { usePressSpring } from '../../ui/game/usePressSpring';
import { GameText } from '../../ui/GameText';
import type { MinigameInfo } from './catalog';
import { GAME_TONES } from './hubLook';
import { MinigameIcon } from './MinigameIcon';

interface MinigameCardProps {
  game: MinigameInfo;
  highscore: number | undefined;
  /** Große Kachel oben, quer, mit "Spielen"-Knopf. */
  featured?: boolean;
  /** Abzeichen "Tagesziel" auf der großen Kachel. */
  forGoal?: boolean;
}

/** Bühne der Kachel: Farbverlauf des Spiels mit Lichtfleck oben, darauf die Spielfigur. */
function stage(tone: Tone) {
  return gradientStyle(
    `radial-gradient(circle at 50% 30%, ${tone.light} 0%, ${tone.base} 55%, ${tone.dark} 100%)`,
    tone.base,
  );
}

function Record({ highscore }: { highscore: number | undefined }) {
  const has = Boolean(highscore);
  return (
    <View style={[styles.record, { backgroundColor: has ? tones.gold.light : tones.leaf.light }]}>
      <GameText variant="small" color={has ? tones.gold.text : tones.leaf.edge}>
        {has ? gamesHub.best(highscore ?? 0) : gamesHub.noBest}
      </GameText>
    </View>
  );
}

/**
 * Kachel in der Spiele-Auswahl (Redesign): farbige Bühne mit großer Spielfigur, darunter Name und
 * Rekord. Wenig Text, viel Bild, wie in Spiele-Hubs üblich. Die große Kachel oben zeigt das Spiel
 * des Tagesziels. Sinkt beim Tippen ein und federt zurück.
 */
export function MinigameCard({ game, highscore, featured = false, forGoal = false }: MinigameCardProps) {
  const press = usePressSpring({ sink: depth.sm });
  const tone = GAME_TONES[game.id];
  return (
    <Animated.View style={[styles.shadow, press.outerStyle]}>
      <Link href={game.href} asChild>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${t.play}: ${game.title}`}
          accessibilityHint={game.description}
          onPressIn={press.onPressIn}
          onPressOut={press.onPressOut}
          style={styles.edge}
        >
          <Animated.View style={[styles.face, featured ? styles.row : null, press.faceStyle]}>
            <View style={[featured ? styles.stageWide : styles.stage, stage(tone)]}>
              <View style={styles.floor} />
              <MinigameIcon game={game} size={featured ? 108 : 86} />
            </View>
            <View style={featured ? styles.bodyWide : styles.body}>
              {featured && forGoal ? (
                <View style={[styles.goal, { backgroundColor: tones.coral.base }]}>
                  <GameText variant="small" color={colors.white}>
                    {dailyGoals.title}
                  </GameText>
                </View>
              ) : null}
              <GameText variant={featured ? 'heading' : 'buttonSm'} numberOfLines={2}>
                {game.title}
              </GameText>
              {featured ? (
                <GameText variant="body" color={tones.stone.text} numberOfLines={2} style={{ fontSize: 13, lineHeight: 17 }}>
                  {game.description}
                </GameText>
              ) : null}
              <View style={styles.footer}>
                <Record highscore={highscore} />
                {featured ? (
                  <View style={[styles.play, gradientStyle(`linear-gradient(180deg, ${tone.light} 0%, ${tone.base} 60%)`, tone.base)]}>
                    <GameText variant="buttonSm" color={tone.text} shadow={tone.text === colors.white}>
                      {t.play}
                    </GameText>
                  </View>
                ) : null}
              </View>
            </View>
          </Animated.View>
        </Pressable>
      </Link>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  shadow: { borderRadius: gameRadii.card, boxShadow: chrome.cardShadow },
  edge: {
    borderRadius: gameRadii.card,
    borderWidth: 1,
    borderColor: chrome.cardLine,
    borderBottomWidth: depth.sm + 1,
    borderBottomColor: chrome.cardEdge,
    backgroundColor: chrome.cardEdge,
    overflow: 'hidden',
  },
  face: { borderRadius: gameRadii.card - 1, backgroundColor: colors.white, overflow: 'hidden' },
  row: { flexDirection: 'row' },
  stage: { height: 116, alignItems: 'center', justifyContent: 'center' },
  stageWide: { width: 140, minHeight: 150, alignItems: 'center', justifyContent: 'center' },
  // Weicher Schatten unter der Figur, damit sie auf der Bühne steht.
  floor: { position: 'absolute', bottom: 14, width: 70, height: 12, borderRadius: 999, backgroundColor: 'rgba(0,0,0,0.12)' },
  body: { padding: spacing.sm + 4, paddingTop: spacing.sm + 2, gap: 6 },
  bodyWide: { flex: 1, padding: spacing.md - 2, gap: 6, justifyContent: 'center' },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 6 },
  record: { alignSelf: 'flex-start', borderRadius: radii.pill, paddingHorizontal: spacing.sm, paddingVertical: 2 },
  goal: { alignSelf: 'flex-start', borderRadius: radii.pill, paddingHorizontal: spacing.sm, paddingVertical: 1 },
  play: { borderRadius: radii.pill, paddingHorizontal: spacing.md, paddingVertical: 6 },
});
