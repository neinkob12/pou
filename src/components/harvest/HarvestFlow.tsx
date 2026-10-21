import { useRouter } from 'expo-router';

import { harvestScreen, screenUi } from '../../content/strings';
import { EmptyState } from '../ui/EmptyState';
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

  // Leerer Topf oder noch nicht reif: Budi erklärt, ein Knopf führt weiter (WEB-5).
  if (step === 'empty') {
    return (
      <EmptyState
        title={screenUi.emptyPot.title}
        text={screenUi.emptyPot.text}
        action={{ label: harvestScreen.toSeedSelect, onPress: () => router.push('/seed-select') }}
      />
    );
  }
  return (
    <EmptyState
      title={screenUi.notReady.title}
      text={screenUi.notReady.text}
      action={{ label: harvestScreen.toRoom, onPress: () => router.replace('/') }}
    />
  );
}
