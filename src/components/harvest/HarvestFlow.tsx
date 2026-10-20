import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';

import { harvestScreen } from '../../content/strings';
import { Button } from '../ui/Button';
import { DryingView } from './DryingView';
import { HarvestSummary } from './HarvestSummary';
import { ReadyStep } from './ReadyStep';
import { useHarvestView } from './useHarvestView';

/** Ernte-Ablauf: Lupe und Schere, Trocknen, Abschluss. Zeigt je nach Phase den passenden Schritt. */
export function HarvestFlow() {
  const router = useRouter();
  const { step, status, seed, session, result } = useHarvestView();

  if (step === 'summary' && result) return <HarvestSummary result={result} />;
  if (step === 'ready' && status) return <ReadyStep status={status} seed={seed} />;
  if ((step === 'drying' || step === 'done') && status) return <DryingView status={status} session={session} />;

  const empty = step === 'empty';
  return (
    <View className="gap-3">
      <Text className="font-body text-base text-ink">{empty ? harvestScreen.noPlant : harvestScreen.notReady}</Text>
      <Button
        label={empty ? harvestScreen.toSeedSelect : harvestScreen.toRoom}
        onPress={() => (empty ? router.push('/seed-select') : router.replace('/'))}
      />
    </View>
  );
}
