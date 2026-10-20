import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { lightPhase, room } from '../../content/strings';
import { gameEvents } from '../../game/events';
import { room as roomAssets } from '../../lib/assets';
import { ArtCanvas } from '../budi/art/ArtCanvas';
import { AssetImage } from '../ui/AssetImage';
import { LampArt, LightCone } from './art/LampArt';
import { lampTapOutcome } from './phase/lightCycle';
import { LightFlipDialog } from './phase/LightFlipDialog';
import { usePlantStatus } from './phase/usePlantStatus';
import { clock } from '../../lib/clock';

const LAMP_WIDTH = 140;
const LAMP_HEIGHT = 60;
/** Gezeichnete Lampe: Seitenverhältnis von LampArt (100 × 43). */
const ART_HEIGHT = LAMP_WIDTH * 0.43;
/** Lichtkegel unter der Lampe. */
const CONE_WIDTH = 300;
const CONE_HEIGHT = 300;
/** So lange bleibt der Hinweis nach einer Störung sichtbar (reine Anzeige, kein Spielwert). */
const HINT_MS = 3000;

/** Lampe oben im Bild, an einem Kabel über Budi. An/aus nach Lichtplan, antippbar (P11). */
export function Lamp() {
  const view = usePlantStatus();
  const [dialog, setDialog] = useState(false);
  const [hint, setHint] = useState(false);
  const isOn = view.light?.isDay ?? true;

  useEffect(() => {
    if (!hint) return;
    const id = setTimeout(() => setHint(false), HINT_MS);
    return () => clearTimeout(id);
  }, [hint]);

  const onPress = () => {
    if (!view.status || !view.light) return;
    const outcome = lampTapOutcome(view.status, view.light);
    if (outcome === 'disturb') {
      gameEvents.emit('lightDisturbed', { atMs: clock.now() });
      setHint(true);
    } else if (outcome === 'confirmFlip') {
      setDialog(true);
    }
  };

  return (
    <View className="items-center">
      <View className="h-6 w-1 bg-ink" />
      {isOn ? (
        <View pointerEvents="none" style={[styles.cone, { top: 24 + ART_HEIGHT * 0.8 }]}>
          <ArtCanvas width={CONE_WIDTH} height={CONE_HEIGHT} still>
            <LightCone />
          </ArtCanvas>
        </View>
      ) : null}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={isOn ? lightPhase.lampOn : lightPhase.lampOff}
        onPress={onPress}
        style={styles.target}
      >
        {roomAssets.u2_lamp_on ? (
          <AssetImage
            source={isOn ? roomAssets.u2_lamp_on : roomAssets.u2_lamp_off}
            label={isOn ? room.lamp : `${room.lamp}, ${lightPhase.lampOff}`}
            size={LAMP_WIDTH}
            height={LAMP_HEIGHT}
          />
        ) : (
          <ArtCanvas width={LAMP_WIDTH} height={ART_HEIGHT} still>
            <LampArt on={isOn} />
          </ArtCanvas>
        )}
      </Pressable>
      {hint ? (
        <Text className="mt-2 rounded-2xl bg-white px-3 py-2 text-center font-body-bold text-sm text-ink">
          {lightPhase.disturbed}
        </Text>
      ) : null}
      <LightFlipDialog visible={dialog} debugMultiplier={view.debugMultiplier} onClose={() => setDialog(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  cone: { position: 'absolute', width: CONE_WIDTH, height: CONE_HEIGHT },
  // Mindestens 44 Punkte hoch zum Antippen, auch wenn die Lampe flacher gezeichnet ist.
  target: { minHeight: 44, justifyContent: 'center' },
});
