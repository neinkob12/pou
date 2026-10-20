import { useRouter } from 'expo-router';

import { harvestScreen } from '../../content/strings';
import { Button } from '../ui/Button';
import type { HarvestStep } from './harvestFlow';
import { useHarvestView } from './useHarvestView';

const LABEL: Partial<Record<HarvestStep, string>> = {
  ready: harvestScreen.entryReady,
  drying: harvestScreen.entryDrying,
  done: harvestScreen.entryDone,
  summary: harvestScreen.entrySummary,
  empty: harvestScreen.entryEmpty,
};

/** Knopf im Raum: führt zur Ernte (ab "ready") oder bei leerem Topf zur Samenauswahl. */
export function HarvestEntry() {
  const router = useRouter();
  const { step } = useHarvestView();
  const label = LABEL[step];
  if (!label) return null;
  return <Button label={label} onPress={() => router.push(step === 'empty' ? '/seed-select' : '/harvest')} />;
}
