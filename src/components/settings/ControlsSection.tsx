import { Pressable, Text, View } from 'react-native';

import { jumpGame as texts } from '../../content/strings';
import { useGameStore } from '../../store/gameStore';
import type { JumpControl } from '../minigames/jump/jumpControls';
import { SettingsSection } from './SettingsSection';

const OPTIONS: { value: JumpControl; label: string }[] = [
  { value: 'tilt', label: texts.controlTilt },
  { value: 'tap', label: texts.controlTap },
];

/** Steuerung für Budi Jump: Neigen oder Tippen (P14). */
export function ControlsSection() {
  const control = useGameStore((s) => s.jumpControl);
  const setControl = useGameStore((s) => s.setJumpControl);

  return (
    <SettingsSection title={texts.controlsTitle}>
      <View className="flex-row gap-1 rounded-full bg-cream p-1" accessibilityRole="radiogroup">
        {OPTIONS.map(({ value, label }) => {
          const selected = control === value;
          return (
            <Pressable
              key={value}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              onPress={() => setControl(value)}
              className={`min-h-10 flex-1 items-center justify-center rounded-full px-4 active:opacity-70 ${selected ? 'bg-plantDark' : ''}`}
            >
              <Text className={`font-body-bold text-base ${selected ? 'text-white' : 'text-inkMuted'}`}>{label}</Text>
            </Pressable>
          );
        })}
      </View>
      <Text className="font-body text-sm text-inkMuted">{texts.controlsHint}</Text>
    </SettingsSection>
  );
}
