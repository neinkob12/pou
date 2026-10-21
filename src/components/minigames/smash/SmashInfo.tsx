import { Text, View } from 'react-native';

import { minigameFun, smashGame as t } from '../../../content/strings';
import { PEST_SMASH } from '../../../game/config';
import { colors, funColors } from '../../../lib/theme';

const LEGEND: { label: string; color: string }[] = [
  { label: t.mite, color: colors.terracotta },
  { label: minigameFun.smashArmored, color: funColors.shell },
  { label: t.gnat, color: colors.night },
  { label: t.ladybug, color: colors.coral },
];

interface SmashInfoProps {
  protectionEarned: boolean;
}

/** Zeile über dem Blatt: Legende der Tiere, Hinweis zum Schutz. Die Kombo zeigt ComboBadge (Auftrag 40). */
export function SmashInfo({ protectionEarned }: SmashInfoProps) {
  return (
    <View className="gap-1 px-4 pb-2">
      <View className="flex-row flex-wrap gap-3">
        {LEGEND.map((l) => (
          <View key={l.label} className="flex-row items-center gap-1">
            <View className="h-3 w-3 rounded-full" style={{ backgroundColor: l.color }} />
            <Text className="font-body text-sm text-ink">{l.label}</Text>
          </View>
        ))}
      </View>
      <Text className="font-body text-sm text-inkMuted">
        {protectionEarned ? t.protectionEarned : t.protectionHint(PEST_SMASH.protectionMinScore)}
      </Text>
    </View>
  );
}
