import { ScrollView, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { StrainCard } from '../src/components/album/StrainCard';
import { useNow } from '../src/components/room/useNow';
import { BackButton } from '../src/components/ui/BackButton';
import { seedSelect } from '../src/content/strings';
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
    <SafeAreaView className="flex-1 bg-cream" edges={['top']}>
      <ScrollView contentContainerClassName="gap-4 p-4">
        <BackButton />
        <Text className="font-heading text-3xl text-ink">{seedSelect.title}</Text>
        <Text className="font-body text-base text-ink">{potFree ? seedSelect.intro : seedSelect.potBusy}</Text>
        {STRAIN_ORDER.map((id) => (
          <StrainCard
            key={id}
            strain={STRAINS[id]}
            unlocked={isStrainUnlocked(STRAINS[id], stats)}
            stats={stats}
            action={{ label: seedSelect.plant, onPress: () => plantNewSeed(id), disabled: !potFree }}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
