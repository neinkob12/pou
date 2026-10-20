import { Pressable, Text, View } from 'react-native';

import type { FactCard } from '../../content/facts';
import { facts as t } from '../../content/strings';
import { PHASE_LABELS } from '../../game/config';
import { openSource } from './openSource';

interface FactCardViewProps {
  card: FactCard;
  unlocked: boolean;
}

/** Eine Fakten-Karte. Gesperrt: grau, ohne Text, mit Hinweis auf die Phase. Rahmen U14 fehlt noch. */
export function FactCardView({ card, unlocked }: FactCardViewProps) {
  const phase = PHASE_LABELS[card.phase];

  if (!unlocked) {
    return (
      <View
        accessibilityLabel={`${t.lockedTitle}. ${t.lockedHint(phase)}`}
        className="gap-1 rounded-2xl border-2 border-dashed border-inkMuted bg-inkMuted/20 p-4"
      >
        <Text className="font-heading text-lg text-inkMuted">{t.lockedTitle}</Text>
        <Text className="font-body text-sm text-inkMuted">{t.lockedHint(phase)}</Text>
      </View>
    );
  }

  return (
    <View className="gap-2 rounded-2xl border-2 border-plantDark bg-white p-4">
      <Text className="font-body text-xs text-inkMuted">{t.phaseLabel(phase)}</Text>
      <Text className="font-heading text-lg text-ink">{card.title}</Text>
      <Text className="font-body text-base text-ink">{card.text}</Text>
      <Pressable
        accessibilityRole="link"
        accessibilityHint={t.openSource}
        onPress={() => openSource(card.url)}
        className="self-start active:opacity-60"
      >
        <Text className="font-body-bold text-sm text-plantDark underline">{t.sourceLabel(card.source)}</Text>
      </Pressable>
    </View>
  );
}
