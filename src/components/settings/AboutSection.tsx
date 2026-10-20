import Constants from 'expo-constants';
import { Text } from 'react-native';

import { settings } from '../../content/strings';
import { SettingsSection } from './SettingsSection';

export function AboutSection() {
  return (
    <SettingsSection title={settings.aboutTitle}>
      <Text className="font-body text-base text-ink">{settings.aboutText}</Text>
      <Text className="font-body text-sm text-inkMuted">
        {settings.versionLabel} {Constants.expoConfig?.version ?? '?'}
      </Text>
    </SettingsSection>
  );
}
