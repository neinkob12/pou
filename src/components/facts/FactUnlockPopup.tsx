import { useEffect } from 'react';
import { Text } from 'react-native';

import { factById } from '../../content/facts';
import { facts as t } from '../../content/strings';
import { useGameStore } from '../../store/gameStore';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { FactCardView } from './FactCardView';
import { useFactUnlocks } from './useFactUnlocks';

/** Freischaltung und Popup in Budis Stimme. Wird einmal im Hauptraum eingehängt. */
export function FactUnlockPopup() {
  useFactUnlocks();
  const pending = useGameStore((s) => s.pendingFactIds);
  const dismiss = useGameStore((s) => s.dismissFactPopup);
  const card = pending[0] ? factById(pending[0]) : undefined;

  const orphan = pending[0] !== undefined && card === undefined;

  useEffect(() => {
    // Karte gibt es nicht mehr (alter Spielstand): still überspringen.
    if (orphan) dismiss();
  }, [orphan, dismiss]);

  const more = pending.length - 1;
  return (
    <Modal visible={card !== undefined} title={t.popupTitle} onClose={dismiss}>
      <Text className="font-body text-base text-ink">{t.popupIntro}</Text>
      {card ? <FactCardView card={card} unlocked /> : null}
      {more > 0 ? (
        <>
          <Text className="font-body text-sm text-inkMuted">{t.popupMore(more)}</Text>
          <Button label={t.popupNext} onPress={dismiss} />
        </>
      ) : null}
    </Modal>
  );
}
