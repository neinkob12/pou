import { Text, View } from 'react-native';

import { screenUi } from '../../content/strings';
import { UPGRADE_IDS } from '../../game/config';
import { maxLevel, levelOf } from '../../game/shop';
import { useGameStore } from '../../store/gameStore';
import { Appear } from '../ui/Appear';
import { Card } from '../ui/Card';
import { UpgradeCard } from './UpgradeCard';

/** Alle Upgrades in der Reihenfolge aus config.ts. Alles gekauft: grüner Hinweis oben (WEB-5). */
export function UpgradesTab() {
  const levels = useGameStore((s) => s.upgrades);
  const allMaxed = UPGRADE_IDS.every((id) => levelOf(levels, id) >= maxLevel(id));
  return (
    <View className="gap-3">
      {allMaxed ? (
        <Card tone="success">
          <Text className="text-center font-body-bold text-base text-plantDark">{screenUi.shopMaxed}</Text>
        </Card>
      ) : (
        <Text className="px-1 font-body text-sm text-inkMuted">{screenUi.upgradesIntro}</Text>
      )}
      {UPGRADE_IDS.map((id, i) => (
        <Appear key={id} index={i}>
          <UpgradeCard id={id} />
        </Appear>
      ))}
    </View>
  );
}
