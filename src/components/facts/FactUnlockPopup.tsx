import { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';

import { factById } from '../../content/facts';
import { facts as t, modal } from '../../content/strings';
import { useGameStore } from '../../store/gameStore';
import { Button } from '../ui/Button';
import { FactCardView } from './FactCardView';
import { useFactUnlocks } from './useFactUnlocks';

/**
 * Freischaltung und Popup in Budis Stimme. Wird einmal im Hauptraum eingehängt.
 * Bewusst kein RN-Modal: Beim Phasenwechsel zeigt P11 schon eins, und zwei Modals gleichzeitig
 * sind auf iOS unzuverlässig. Als Overlay liegt die Karte unter dem Phasen-Popup und ist zu
 * sehen, sobald es geschlossen ist.
 */
export function FactUnlockPopup() {
  useFactUnlocks();
  const pending = useGameStore((s) => s.pendingFactIds);
  const dismiss = useGameStore((s) => s.dismissFactPopup);
  // Erst nach dem Tutorial (WEB-3): Sonst liegen Karte und Budis Sprechblase übereinander.
  const tutorialDone = useGameStore((s) => s.tutorialDone);
  const card = pending[0] ? factById(pending[0]) : undefined;
  const orphan = pending[0] !== undefined && card === undefined;

  useEffect(() => {
    // Karte gibt es nicht mehr (alter Spielstand): still überspringen.
    if (orphan) dismiss();
  }, [orphan, dismiss]);

  if (!card || !tutorialDone) return null;
  const more = pending.length - 1;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={modal.close}
      onPress={dismiss}
      className="absolute inset-0 items-center justify-center bg-ink/50 p-6"
    >
      <Pressable accessibilityViewIsModal className="w-full gap-4 rounded-3xl bg-cream p-6">
        <Text className="font-heading text-2xl text-ink">{t.popupTitle}</Text>
        <Text className="font-body text-base text-ink">{t.popupIntro}</Text>
        <FactCardView card={card} unlocked />
        {more > 0 ? <Text className="font-body text-sm text-inkMuted">{t.popupMore(more)}</Text> : null}
        <View className="gap-2">
          {more > 0 ? <Button label={t.popupNext} onPress={dismiss} /> : null}
          <Button label={modal.close} variant="secondary" onPress={dismiss} />
        </View>
      </Pressable>
    </Pressable>
  );
}
