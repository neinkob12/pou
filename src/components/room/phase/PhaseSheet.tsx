import { Image, Text, View } from 'react-native';

import { lightPhase, roomHud } from '../../../content/strings';
import { ui } from '../../../lib/assets';
import { chrome, radii, spacing } from '../../../lib/theme';
import { Button } from '../../ui/Button';
import { Modal } from '../../ui/Modal';
import { HudBar } from '../hud/HudBar';
import { NEED_TONES } from '../hud/hudStyle';
import { phaseText } from '../phaseText';
import { FLIP_ALLOWED_FROM_DAY, showLightSwitch } from './lightCycle';
import type { PlantView } from './usePlantStatus';

interface PhaseSheetProps {
  visible: boolean;
  view: PlantView;
  /** Schalter auf 12/12 ist jetzt erlaubt. */
  switchReady: boolean;
  onClose: () => void;
  onSwitch: () => void;
}

/** Details zur Phase (Redesign): Fortschritt, Restzeit, Lichtplan und der Schalter auf 12/12 (P11). */
export function PhaseSheet({ visible, view, switchReady, onClose, onSwitch }: PhaseSheetProps) {
  const { status, light, autoflower } = view;
  if (!status || !light) return null;
  const text = phaseText(status);
  const tone = NEED_TONES.nutrients;
  const withSwitch = showLightSwitch(status, autoflower);
  const lightState = autoflower ? lightPhase.autoflower : light.isDay ? lightPhase.lampOn : lightPhase.night;

  return (
    <Modal visible={visible} title={roomHud.phaseTitle} onClose={onClose}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
        <View
          style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: tone.light, alignItems: 'center', justifyContent: 'center' }}
        >
          <Image source={ui.u11_nutrients} style={{ width: 38, height: 38 }} />
        </View>
        <View style={{ flex: 1 }}>
          <Text className="font-heading text-2xl text-ink">{text.phaseLabel}</Text>
          <Text className="font-body-bold text-sm text-inkMuted">{roomHud.phaseDay(Math.floor(status.ageDays))}</Text>
        </View>
      </View>
      <View style={{ gap: 6 }}>
        <HudBar value={text.progress} fill={tone.base} deep={tone.dark} height={16} accessibilityLabel={text.phaseLabel} />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text className="font-body-bold text-sm text-ink">{roomHud.phaseProgress(Math.round(text.progress * 100))}</Text>
          <Text className="font-body-bold text-sm text-inkMuted">{text.remaining}</Text>
        </View>
      </View>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.sm,
          padding: spacing.sm + 2,
          borderRadius: radii.md,
          backgroundColor: chrome.glass,
          borderWidth: 1,
          borderColor: chrome.glassLine,
        }}
      >
        <Image source={ui.u11_light} style={{ width: 28, height: 28 }} />
        <View style={{ flex: 1 }}>
          <Text className="font-heading text-base text-ink">{lightPhase.schedule[light.schedule]}</Text>
          <Text className="font-body text-xs text-inkMuted">{lightState}</Text>
        </View>
      </View>
      {withSwitch && switchReady ? <Button label={lightPhase.switchLabel} variant="gold" onPress={onSwitch} /> : null}
      {withSwitch && !switchReady ? (
        <Text className="text-center font-body text-xs text-inkMuted">
          {lightPhase.switchLockedFrom(FLIP_ALLOWED_FROM_DAY, Math.floor(status.ageDays))}
        </Text>
      ) : null}
    </Modal>
  );
}
