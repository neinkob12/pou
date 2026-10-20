import { Text } from 'react-native';

import { lightPhase } from '../../../content/strings';
import { flipLight } from '../../../game/timeEngine';
import { useGameStore } from '../../../store/gameStore';
import { Button } from '../../ui/Button';
import { Modal } from '../../ui/Modal';

interface LightFlipDialogProps {
  visible: boolean;
  debugMultiplier: number;
  onClose: () => void;
}

/** Bestätigung vor dem Wechsel auf 12/12: erklärt, dass längeres Wachstum mehr Ertrag bringt, aber dauert. */
export function LightFlipDialog({ visible, debugMultiplier, onClose }: LightFlipDialogProps) {
  const confirm = () => {
    const { plant, setPlant } = useGameStore.getState();
    // flipLight prüft canFlipLight selbst und gibt sonst die Pflanze unverändert zurück.
    if (plant) setPlant(flipLight(plant, Date.now(), debugMultiplier));
    onClose();
  };
  return (
    <Modal visible={visible} title={lightPhase.flipTitle} onClose={onClose}>
      <Text className="font-body text-base text-ink">{lightPhase.flipText}</Text>
      <Button label={lightPhase.flipConfirm} onPress={confirm} />
    </Modal>
  );
}
