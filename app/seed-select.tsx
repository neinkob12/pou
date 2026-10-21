import { Text } from 'react-native';

import { StrainCard } from '../src/components/album/StrainCard';
import { Appear } from '../src/components/ui/Appear';
import { Card } from '../src/components/ui/Card';
import { Screen } from '../src/components/ui/Screen';
import { useNow } from '../src/hooks/useNow';
import { screenUi, seedSelect } from '../src/content/strings';
import { STRAINS } from '../src/game/config';
import { canPlantNewSeed, isStrainUnlocked, STRAIN_ORDER } from '../src/game/progression';
import { usePlantNewSeed } from '../src/hooks/usePlantNewSeed';
import { useProgressStats } from '../src/hooks/useProgressStats';
import { useGameStore } from '../src/store/gameStore';
import { selectDebugMultiplier } from '../src/store/slices/debug';

/** Samenauswahl nach der Ernte (P24 navigiert hierher) oder beim ersten Samen. */
export default function SeedSelectRoute() {
  const stats = useProgressStats();
  const plant = useGameStore((s) => s.plant);
  const plantNewSeed = usePlantNewSeed();
  const debugMultiplier = useGameStore(selectDebugMultiplier);
  const nowMs = useNow();
  const potFree = canPlantNewSeed(plant, nowMs, debugMultiplier);

  return (
    <Screen title={seedSelect.title} subtitle={screenUi.seedSelectSubtitle} back>
      <Card tone={potFree ? 'highlight' : 'muted'}>
        <Text className="font-body-bold text-base text-ink">{potFree ? seedSelect.intro : seedSelect.potBusy}</Text>
      </Card>
      {STRAIN_ORDER.map((id, i) => (
        <Appear key={id} index={i}>
          <StrainCard
            strain={STRAINS[id]}
            unlocked={isStrainUnlocked(STRAINS[id], stats)}
            stats={stats}
            action={{ label: seedSelect.plant, onPress: () => plantNewSeed(id), disabled: !potFree }}
          />
        </Appear>
      ))}
    </Screen>
  );
}
