import { View } from 'react-native';

import { STRAINS } from '../../game/config';
import { isStrainUnlocked, STRAIN_ORDER } from '../../game/progression';
import { useProgressStats } from '../../hooks/useProgressStats';
import { LevelHeader } from './LevelHeader';
import { StrainCard } from './StrainCard';

/** Sorten-Sammlung mit Level. Gehört P16. */
export function StrainsTab() {
  const stats = useProgressStats();
  return (
    <View className="gap-4">
      <LevelHeader stats={stats} />
      {STRAIN_ORDER.map((id) => (
        <StrainCard key={id} strain={STRAINS[id]} unlocked={isStrainUnlocked(STRAINS[id], stats)} stats={stats} />
      ))}
    </View>
  );
}
