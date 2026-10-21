import { View } from 'react-native';

import { screenUi } from '../../content/strings';
import { STRAINS } from '../../game/config';
import { isStrainUnlocked, STRAIN_ORDER } from '../../game/progression';
import { useProgressStats } from '../../hooks/useProgressStats';
import { Appear } from '../ui/Appear';
import { SectionTitle } from '../ui/SectionTitle';
import { LevelHeader } from './LevelHeader';
import { StrainCard } from './StrainCard';

/** Sorten-Sammlung mit Level. Gehört P16. */
export function StrainsTab() {
  const stats = useProgressStats();
  const unlocked = STRAIN_ORDER.filter((id) => isStrainUnlocked(STRAINS[id], stats)).length;
  return (
    <View className="gap-3">
      <LevelHeader stats={stats} />
      <SectionTitle title={screenUi.strainsTitle} meta={screenUi.albumCollected(unlocked, STRAIN_ORDER.length)} />
      {STRAIN_ORDER.map((id, i) => (
        <Appear key={id} index={i}>
          <StrainCard strain={STRAINS[id]} unlocked={isStrainUnlocked(STRAINS[id], stats)} stats={stats} />
        </Appear>
      ))}
    </View>
  );
}
