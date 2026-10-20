import { Text, View } from 'react-native';

import { getPlantStatus } from '../../game/timeEngine';
import { useGameStore } from '../../store/gameStore';
import { Bar } from '../ui/Bar';
import { phaseText } from './phaseText';
import { useNow } from './useNow';

// Slot. Später P11: Phasenwechsel-Popup und Licht-Schalter.
/** Phasenname, Fortschrittsbalken und "noch X Std." aus getPlantStatus. */
export function PhaseHeader() {
  const plant = useGameStore((s) => s.plant);
  const now = useNow();
  const text = phaseText(plant ? getPlantStatus(plant, now) : null);
  return (
    <View className="gap-1 rounded-2xl bg-white/80 px-4 py-2">
      <View className="flex-row items-baseline justify-between">
        <Text className="font-heading text-xl text-ink">{text.phaseLabel}</Text>
        <Text className="font-body text-sm text-inkMuted">{text.remaining}</Text>
      </View>
      <Bar value={text.progress} color="plantLight" accessibilityLabel={text.phaseLabel} />
    </View>
  );
}
