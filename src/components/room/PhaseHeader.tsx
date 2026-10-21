import { Text, View } from 'react-native';

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
    <HudPanel innerStyle={{ paddingHorizontal: 14, paddingTop: 8, paddingBottom: 8, gap: 6 }}>
      <View className="flex-row items-center justify-between gap-2">
        <Text className="font-heading text-xl text-ink" style={{ textShadowColor: 'rgba(47,93,58,0.18)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 0 }}>
          {text.phaseLabel}
        </Text>
        {text.remaining ? (
          <View className="rounded-full border-2 border-plantDark bg-cream px-2.5 py-0.5">
            <Text className="font-body-bold text-xs text-ink">{text.remaining}</Text>
          </View>
        ) : null}
      </View>
      <HudBar value={text.progress} fill={tone.fill} deep={tone.deep} accessibilityLabel={text.phaseLabel} />
      <LightSwitch view={view} />
    </HudPanel>
  );
}
