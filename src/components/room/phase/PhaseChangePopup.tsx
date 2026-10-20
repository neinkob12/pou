import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { gameEvents } from '../../../game/events';
import { usePhaseWatcher } from '../../../hooks/usePhaseWatcher';
import { Puff } from './Puff';
import { usePlantStatus } from './usePlantStatus';

/**
 * Beobachtet die Phase (usePhaseWatcher) und zeigt bei jedem Wechsel "Puff". Die Feier mit Text
 * zeigt seit WEB-3 die Feier-Ebene (feedback/CelebrationLayer.tsx).
 */
export function PhaseChangePopup() {
  const { plant, status } = usePlantStatus();
  usePhaseWatcher(plant?.plantedAtMs ?? null, status?.phase ?? null);

  const [puffKey, setPuffKey] = useState(0);

  useEffect(() => gameEvents.on('phaseChanged', () => setPuffKey((k) => k + 1)), []);

  if (puffKey === 0) return null;
  return (
    <View pointerEvents="none" className="absolute inset-0">
      <Puff playKey={puffKey} />
    </View>
  );
}
