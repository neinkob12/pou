import { Switch, Text, View } from 'react-native';
import { useMMKVBoolean } from 'react-native-mmkv';

import { soundSettings as texts } from '../../content/strings';
import { setSoundSetting, SOUND_KEYS, type SoundSetting } from '../../lib/audio';
import { storage } from '../../lib/storage';
import { colors } from '../../lib/theme';
import { SettingsSection } from './SettingsSection';

const ROWS: { key: SoundSetting; label: string }[] = [
  { key: 'music', label: texts.music },
  { key: 'effects', label: texts.effects },
  { key: 'haptics', label: texts.haptics },
];

function SoundRow({ setting, label }: { setting: SoundSetting; label: string }) {
  // Nur zum Neuzeichnen; geschrieben wird über setSoundSetting, damit laufende Musik sofort reagiert.
  const [stored] = useMMKVBoolean(SOUND_KEYS[setting], storage);
  return (
    <View className="flex-row items-center justify-between gap-4">
      <Text className="flex-1 font-body text-base text-ink">{label}</Text>
      <Switch
        value={stored ?? true}
        onValueChange={(value) => setSoundSetting(setting, value)}
        trackColor={{ true: colors.plantLight, false: colors.inkMuted }}
      />
    </View>
  );
}

/** Musik, Soundeffekte und Vibration getrennt an und aus (P23). */
export function SoundSection() {
  return (
    <SettingsSection title={texts.title}>
      {ROWS.map(({ key, label }) => (
        <SoundRow key={key} setting={key} label={label} />
      ))}
      <Text className="font-body text-sm text-inkMuted">{texts.hint}</Text>
    </SettingsSection>
  );
}
