import { Text, View } from 'react-native';

import { Bar } from '../ui/Bar';
import { LightSwitch } from './phase/LightSwitch';
import { usePlantStatus } from './phase/usePlantStatus';
import { phaseText } from './phaseText';

/** Phasenname, Fortschrittsbalken, "noch X Std." und Lichtplan mit Schalter (P11). */
export function PhaseHeader() {
  const view = usePlantStatus();
  const text = phaseText(view.status);
  return (
    <View className="gap-1 rounded-2xl bg-white/80 px-4 py-2">
      <View className="flex-row items-baseline justify-between">
        <Text className="font-heading text-xl text-ink">{text.phaseLabel}</Text>
        <Text className="font-body text-sm text-inkMuted">{text.remaining}</Text>
      </View>
      <Bar value={text.progress} color="plantLight" accessibilityLabel={text.phaseLabel} />
      <LightSwitch view={view} />
    </View>
  );
}
