import { View } from 'react-native';

import { ENTRY_REPLACES_TOOLS, HarvestEntry } from '../harvest/HarvestEntry';
import { useHarvestView } from '../harvest/useHarvestView';
import { ActionTray } from './ActionTray';

/** Feste Höhe des Docks, damit Budi immer auf demselben Teppich steht (roomLayout.ts). */
export const DOCK_HEIGHT = 104;
/** Boden zwischen Dock und Budi: Budi steht weiter oben, näher an der Bildmitte. */
export const FLOOR_GAP = 52;

/**
 * Unterer Bereich des Zimmers in Daumenreichweite (Redesign): Werkzeuge oder, wenn es nichts zu
 * pflegen gibt, der große Knopf zum Pflanzen oder Ernten. Erntebereit schwebt "Ernten" über den
 * Werkzeugen, weil Pflege dann noch möglich ist.
 */
export function RoomDock() {
  const { step } = useHarvestView();
  const replaces = ENTRY_REPLACES_TOOLS.includes(step);
  return (
    <View style={{ height: DOCK_HEIGHT, marginTop: FLOOR_GAP, justifyContent: 'center', paddingHorizontal: 16 }}>
      {replaces ? <HarvestEntry step={step} /> : <ActionTray />}
      {step === 'ready' ? (
        <View pointerEvents="box-none" style={{ position: 'absolute', left: 0, right: 0, bottom: DOCK_HEIGHT + 6, alignItems: 'center' }}>
          <HarvestEntry step={step} />
        </View>
      ) : null}
    </View>
  );
}
