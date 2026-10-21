// Kopf des Quiz (Auftrag 51 im Spiel-Look): Budi im runden Rahmen, Fragezähler und Fortschritt als
// dicke Punkte mit Kontur (grün richtig, rot falsch, aktuelle Frage größer).

import { StyleSheet, View } from 'react-native';

import { factQuiz as t } from '../../../content/strings';
import { gameRadii, outline, spacing, tones } from '../../../lib/theme';
import { GameText } from '../../ui/GameText';
import { circlePath, outlined } from '../framework/art/kit';
import { StillPicture, type BackdropDraw } from '../framework/art/Stage';
import { drawBudiIcon } from '../jump/jumpArt';

const ICON = 64;

const drawIcon: BackdropDraw = (c, pen) => {
  'worklet';
  const r = ICON / 2;
  outlined(c, pen, circlePath(r, r, r - 3), pen.radial(r * 0.7, r * 0.6, r * 1.3, [tones.gold.light, tones.gold.base]), 1.5);
  c.save();
  c.translate(r - 1, r + 9);
  c.scale(15, 15);
  drawBudiIcon(c, pen);
  c.restore();
};

interface QuizTopProps {
  index: number;
  results: (boolean | null)[];
}

export function QuizTop({ index, results }: QuizTopProps) {
  return (
    <View style={styles.row}>
      <StillPicture width={ICON} height={ICON} draw={drawIcon} />
      <View style={styles.side}>
        <GameText variant="heading" color={tones.cream.light} shadow>
          {t.questionCounter(index + 1, results.length)}
        </GameText>
        <View style={styles.dots}>
          {results.map((r, i) => {
            const tone = r === null ? tones.cream : r ? tones.leaf : tones.danger;
            const size = i === index ? 22 : 16;
            return (
              <View
                key={i}
                style={[styles.dot, { width: size, height: size, borderRadius: size / 2, backgroundColor: tone.base }]}
              />
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  side: { flex: 1, gap: spacing.xs },
  dots: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  dot: { borderWidth: outline.thin, borderColor: outline.color, borderRadius: gameRadii.pill },
});
