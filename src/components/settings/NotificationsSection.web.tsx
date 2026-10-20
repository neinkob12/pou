import { Text } from 'react-native';

import { notifications as texts, webVersion } from '../../content/strings';
import { SettingsSection } from './SettingsSection';

/** Web (PWEB): keine lokalen Benachrichtigungen im Browser, nur ein Hinweis. */
export function NotificationsSection() {
  return (
    <SettingsSection title={texts.settingsTitle}>
      <Text className="font-body text-sm text-inkMuted">{webVersion.notificationsUnavailable}</Text>
    </SettingsSection>
  );
}
