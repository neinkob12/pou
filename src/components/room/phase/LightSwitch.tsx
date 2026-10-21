import { useState } from 'react';
import { Text, View } from 'react-native';

import { lightPhase } from '../../../content/strings';
import { Button } from '../../ui/Button';
import { FLIP_ALLOWED_FROM_DAY, showLightSwitch } from './lightCycle';
import { LightFlipDialog } from './LightFlipDialog';
import type { PlantView } from './usePlantStatus';

/** Lichtplan als Chip und, nur bei Photoperioden-Sorten im Wachstum, der Schalter auf 12/12. */
export function LightSwitch({ view }: { view: PlantView }) {
  const [dialog, setDialog] = useState(false);
  const { status, light, autoflower, debugMultiplier } = view;
  if (!status || !light) return null;
  const withSwitch = showLightSwitch(status, autoflower);
  return (
    <View className="gap-0.5">
      <View className="flex-row items-center justify-between">
        <Text className="font-body-bold text-xs text-ink">{lightPhase.schedule[light.schedule]}</Text>
        <Text className="font-body-bold text-xs text-inkMuted">
          {autoflower ? lightPhase.autoflower : light.isDay ? lightPhase.lampOn : lightPhase.night}
        </Text>
      </View>
      {withSwitch && status.canFlipLight ? (
        <Button label={lightPhase.switchLabel} size="sm" onPress={() => setDialog(true)} />
      ) : null}
      {withSwitch && !status.canFlipLight ? (
        <Text className="font-body text-[11px] text-inkMuted">
          {lightPhase.switchLockedFrom(FLIP_ALLOWED_FROM_DAY, Math.floor(status.ageDays))}
        </Text>
      ) : null}
      <LightFlipDialog visible={dialog} debugMultiplier={debugMultiplier} onClose={() => setDialog(false)} />
    </View>
  );
}
