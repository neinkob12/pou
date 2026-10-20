import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

import { lightPhase } from '../../../content/strings';
import type { PhaseId } from '../../../game/config';
import { gameEvents } from '../../../game/events';
import { usePhaseWatcher } from '../../../hooks/usePhaseWatcher';
import { Modal } from '../../ui/Modal';
import { Puff, PUFF_MS } from './Puff';
import { usePlantStatus } from './usePlantStatus';

/** Beobachtet die Phase (usePhaseWatcher) und zeigt bei jedem Wechsel "Puff" und ein Popup. */
export function PhaseChangePopup() {
  const { plant, status } = usePlantStatus();
  usePhaseWatcher(plant?.plantedAtMs ?? null, status?.phase ?? null);

  const [phase, setPhase] = useState<PhaseId | null>(null);
  const [puffKey, setPuffKey] = useState(0);
  const [showModal, setShowModal] = useState(false);

  useEffect(
    () =>
      gameEvents.on('phaseChanged', ({ to }) => {
        // Mehrere Wechsel auf einmal (App war lange zu): das Popup zeigt den letzten.
        setPhase(to);
        setShowModal(false);
        setPuffKey((k) => k + 1);
      }),
    [],
  );

  useEffect(() => {
    if (puffKey === 0) return;
    const id = setTimeout(() => setShowModal(true), PUFF_MS);
    return () => clearTimeout(id);
  }, [puffKey]);

  if (phase === null) return null;
  return (
    <View pointerEvents="box-none" className="absolute inset-0">
      {showModal ? null : <Puff playKey={puffKey} />}
      <Modal visible={showModal} title={lightPhase.phaseChangedTitle} onClose={() => setPhase(null)}>
        <Text className="font-body-bold text-lg text-ink">{lightPhase.phaseChanged[phase]}</Text>
      </Modal>
    </View>
  );
}
