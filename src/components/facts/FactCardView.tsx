import { Pressable, Text } from 'react-native';

import type { FactCard } from '../../content/facts';
import { facts as t, phaseLabels } from '../../content/strings';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { openSource } from './openSource';

interface FactCardViewProps {
  card: FactCard;
  unlocked: boolean;
}

/** Eine Fakten-Karte. Gesperrt: grau, ohne Text, mit Hinweis auf die Phase. Rahmen U14 fehlt noch. */
export function FactCardView({ card, unlocked }: FactCardViewProps) {
  const phase = phaseLabels[card.phase];

  if (!unlocked) {
    return (
      <Card tone="muted" accessibilityLabel={`${t.lockedTitle}. ${t.lockedHint(phase)}`}>
        <Text className="font-heading text-lg text-inkMuted">{t.lockedTitle}</Text>
        <Text className="font-body text-sm text-inkMuted">{t.lockedHint(phase)}</Text>
      </Card>
    );
  }

  return (
    <Card>
      <Badge label={t.phaseLabel(phase)} color="plantLight" />
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
    </Card>
  );
}
