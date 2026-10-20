import { View } from 'react-native';

import { UPGRADE_IDS } from '../../game/config';
import { UpgradeCard } from './UpgradeCard';

/** Alle Upgrades in der Reihenfolge aus config.ts. */
export function UpgradesTab() {
  return (
    <View className="gap-3">
      {UPGRADE_IDS.map((id) => (
        <UpgradeCard key={id} id={id} />
      ))}
    </View>
  );
}
