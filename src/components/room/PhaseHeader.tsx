import { Text, View } from 'react-native';

import { typography } from '../../lib/theme';
import { HudBar } from './hud/HudBar';
import { HudPanel } from './hud/HudPanel';
import { NEED_TONES } from './hud/hudStyle';
import { LightSwitch } from './phase/LightSwitch';
import { usePlantStatus } from './phase/usePlantStatus';
import { phaseText } from './phaseText';

/** Phasenname, Fortschrittsbalken, "noch X Std." und Lichtplan mit Schalter (P11, Look ART-4). */
export function PhaseHeader() {
  const view = usePlantStatus();
  const text = phaseText(view.status);
  const tone = NEED_TONES.nutrients;
  return (
    <HudPanel innerStyle={{ paddingHorizontal: 12, paddingTop: 5, paddingBottom: 5, gap: 3 }}>
      <View className="flex-row items-center justify-between gap-2">
        <Text className="text-ink" style={typography.heading}>
          {text.phaseLabel}
        </Text>
        {text.remaining ? (
          <View className="rounded-full border-2 border-plantDark bg-cream px-2.5 py-0.5">
            <Text className="font-body-bold text-xs text-ink">{text.remaining}</Text>
          </View>
        ) : null}
      </View>
      <HudBar value={text.progress} fill={tone.base} deep={tone.dark} height={13} accessibilityLabel={text.phaseLabel} />
      <LightSwitch view={view} />
    </HudPanel>
  );
}
