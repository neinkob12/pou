import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { lightPhase, room } from '../../content/strings';
import { gameEvents } from '../../game/events';
import { room as roomAssets } from '../../lib/assets';
import { AssetImage } from '../ui/AssetImage';
import { lampTapOutcome } from './phase/lightCycle';
import { LightFlipDialog } from './phase/LightFlipDialog';
import { usePlantStatus } from './phase/usePlantStatus';

const LAMP_WIDTH = 140;
const LAMP_HEIGHT = 60;
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
      gameEvents.emit('lightDisturbed', { atMs: Date.now() });
      setHint(true);
    } else if (outcome === 'confirmFlip') {
      setDialog(true);
    }
  };

  return (
    <View className="items-center">
      <View className="h-6 w-1 bg-ink" />
      <Pressable accessibilityRole="button" accessibilityLabel={isOn ? lightPhase.lampOn : lightPhase.lampOff} onPress={onPress}>
        <AssetImage
          source={isOn ? roomAssets.u2_lamp_on : roomAssets.u2_lamp_off}
          label={isOn ? room.lamp : `${room.lamp}, ${lightPhase.lampOff}`}
          color={isOn ? 'lamp' : 'inkMuted'}
          size={LAMP_WIDTH}
          height={LAMP_HEIGHT}
        />
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
