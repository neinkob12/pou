// Kopf des Fakten-Quiz (Auftrag 40): Budi als kleiner Spross, Fortschritt als Punkte je Frage
// (grün richtig, koralle falsch) und ein Zeitbalken.

import { Canvas, Group } from '@shopify/react-native-skia';
import { Text, View } from 'react-native';

import { factQuiz as t } from '../../content/strings';
import { FACT_QUIZ } from '../../game/config';
import { colors } from '../../lib/theme';
import { JumpBudi } from '../minigames/jump/JumpBudi';

/** Budi-Bildchen: Kantenlänge und Maßstab (JumpBudi ist in Welt-Einheiten gezeichnet). */
const ICON = 64;
const ICON_SCALE = 4;

interface QuizHeaderProps {
  index: number;
  results: (boolean | null)[];
  secondsLeft: number | null;
}

export function QuizHeader({ index, results, secondsLeft }: QuizHeaderProps) {
  const share = secondsLeft === null ? 1 : Math.max(0, secondsLeft / FACT_QUIZ.durationSeconds);
  return (
    <View className="flex-row items-center gap-3">
      <Canvas style={{ width: ICON, height: ICON }}>
        <Group transform={[{ translateX: ICON / 2 }, { translateY: ICON * 0.6 }, { scale: ICON_SCALE }]}>
          <JumpBudi />
        </Group>
      </Canvas>
      <View className="flex-1 gap-2">
        <View className="flex-row items-center justify-between">
          <Text className="font-body text-sm text-inkMuted">{t.questionCounter(index + 1, results.length)}</Text>
          <View className="flex-row gap-1">
            {results.map((r, i) => (
              <View
                key={i}
                className="h-3 w-3 rounded-full"
                style={{
                  backgroundColor: r === null ? colors.white : r ? colors.plantLight : colors.coral,
                  borderWidth: i === index ? 2 : 0,
                  borderColor: colors.plantDark,
                }}
              />
            ))}
          </View>
        </View>
        <View className="h-2 overflow-hidden rounded-full bg-white">
          <View
            className="h-2 rounded-full"
            style={{ width: `${share * 100}%`, backgroundColor: share < 0.25 ? colors.coral : colors.plantLight }}
          />
        </View>
      </View>
    </View>
  );
}
