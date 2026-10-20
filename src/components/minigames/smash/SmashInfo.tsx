import { Text, View } from 'react-native';

import { smashGame as t } from '../../../content/strings';
import { PEST_SMASH } from '../../../game/config';
import { colors, type ColorName } from '../../../lib/theme';

const LEGEND: { label: string; color: ColorName }[] = [
  { label: t.mite, color: 'terracotta' },
  { label: t.gnat, color: 'night' },
  { label: t.ladybug, color: 'coral' },
];

interface SmashInfoProps {
  /** Aktueller Kombo-Multiplikator, nur ab 2 sichtbar. */
  multiplier: number;
  combo: number;
  protectionEarned: boolean;
}

/** Zeile über dem Blatt: Legende der Tiere (Platzhalter-Farben), Kombo, Hinweis zum Schutz. */
export function SmashInfo({ multiplier, combo, protectionEarned }: SmashInfoProps) {
  return (
    <View className="gap-1 px-4 pb-2">
      <View className="flex-row flex-wrap gap-3">
        {LEGEND.map((l) => (
          <View key={l.label} className="flex-row items-center gap-1">
            <View className="h-3 w-3 rounded-full" style={{ backgroundColor: colors[l.color] }} />
            <Text className="font-body text-sm text-ink">{l.label}</Text>
          </View>
        ))}
      </View>
      <View className="h-6 flex-row items-center justify-between">
        <Text className="font-body text-sm text-inkMuted">
          {protectionEarned ? t.protectionEarned : t.protectionHint(PEST_SMASH.protectionMinScore)}
        </Text>
        {combo >= 2 && (
          <Text className="font-heading text-lg text-coral">
            {t.combo} {combo}
            {multiplier > 1 ? ` · x${multiplier}` : ''}
          </Text>
        )}
      </View>
    </View>
  );
}
