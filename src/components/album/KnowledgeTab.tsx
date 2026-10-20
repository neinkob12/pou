import { Text, View } from 'react-native';

import { FACT_CARDS } from '../../content/facts';
import { facts as t } from '../../content/strings';
import { useGameStore } from '../../store/gameStore';
import { FactCardView } from '../facts/FactCardView';

/** Album-Tab "Wissen": alle Fakten-Karten, gesperrte grau. Gehört P17. */
export function KnowledgeTab() {
  const unlockedIds = useGameStore((s) => s.unlockedFactIds);
  const unlocked = new Set(unlockedIds);
  const count = FACT_CARDS.filter((card) => unlocked.has(card.id)).length;

  return (
    <View className="gap-3">
      <Text className="font-body-bold text-base text-inkMuted">{t.progress(count, FACT_CARDS.length)}</Text>
      {FACT_CARDS.map((card) => (
        <FactCardView key={card.id} card={card} unlocked={unlocked.has(card.id)} />
      ))}
    </View>
  );
}
