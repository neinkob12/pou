import { View } from 'react-native';

import { FACT_CARDS } from '../../content/facts';
import { facts as t, screenUi } from '../../content/strings';
import { useGameStore } from '../../store/gameStore';
import { FactCardView } from '../facts/FactCardView';
import { Appear } from '../ui/Appear';
import { EmptyState } from '../ui/EmptyState';
import { SectionTitle } from '../ui/SectionTitle';

/** Album-Tab "Wissen": alle Fakten-Karten, gesperrte grau. Gehört P17. Noch keine Karte: Budi erklärt (WEB-5). */
export function KnowledgeTab() {
  const unlockedIds = useGameStore((s) => s.unlockedFactIds);
  const unlocked = new Set(unlockedIds);
  const count = FACT_CARDS.filter((card) => unlocked.has(card.id)).length;
  // Freigeschaltete zuerst, damit die Sammlung oben steht.
  const ordered = [...FACT_CARDS].sort((a, b) => Number(unlocked.has(b.id)) - Number(unlocked.has(a.id)));

  return (
    <View className="gap-3">
      {count === 0 ? <EmptyState title={screenUi.knowledgeEmpty.title} text={screenUi.knowledgeEmpty.text} /> : null}
      <SectionTitle title={screenUi.knowledgeTitle} meta={t.progress(count, FACT_CARDS.length)} />
      {ordered.map((card, i) => (
        <Appear key={card.id} index={i}>
          <FactCardView card={card} unlocked={unlocked.has(card.id)} />
        </Appear>
      ))}
    </View>
  );
}
