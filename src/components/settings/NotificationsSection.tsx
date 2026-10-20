import { useEffect, useState } from 'react';
import { Linking, Switch, Text, View } from 'react-native';
import { useMMKVBoolean } from 'react-native-mmkv';

import { notifications as texts } from '../../content/strings';
import {
  cancelPendingNotifications,
  hasPermission,
  NOTIFICATION_KEYS,
  permissionAsked,
  requestPermission,
} from '../../lib/notifications';
import { storage } from '../../lib/storage';
import { colors } from '../../lib/theme';
import { Button } from '../ui/Button';
import { SettingsSection } from './SettingsSection';
import { clock } from '../../lib/clock';

/** Schalter für Budis Benachrichtigungen (P18). Geplant wird beim Schließen der App. */
export function NotificationsSection() {
  const [stored, setStored] = useMMKVBoolean(NOTIFICATION_KEYS.enabled, storage);
  const enabled = stored ?? true;
  const [granted, setGranted] = useState(true);

  useEffect(() => {
    hasPermission().then(setGranted).catch(() => undefined);
  }, []);

  const toggle = (value: boolean) => {
    setStored(value);
    if (!value) {
      cancelPendingNotifications(clock.now()).catch(() => undefined);
      return;
    }
    // Wer selbst einschaltet, bevor Budi gepflegt wurde, darf sofort gefragt werden.
    if (!permissionAsked()) requestPermission().then(setGranted).catch(() => undefined);
  };

  return (
    <SettingsSection title={texts.settingsTitle}>
      <View className="flex-row items-center justify-between gap-4">
        <Text className="flex-1 font-body text-base text-ink">{texts.settingsToggle}</Text>
        <Switch
          value={enabled}
          onValueChange={toggle}
          trackColor={{ true: colors.plantLight, false: colors.inkMuted }}
        />
      </View>
      <Text className="font-body text-sm text-inkMuted">{texts.settingsHint}</Text>
      {enabled && !granted && permissionAsked() ? (
        <>
          <Text className="font-body text-sm text-ink">{texts.settingsDenied}</Text>
          <Button label={texts.settingsOpenSystem} variant="secondary" onPress={() => Linking.openSettings().catch((error: unknown) => console.warn('[notifications] Systemeinstellungen nicht geöffnet.', error))} />
        </>
      ) : null}
    </SettingsSection>
  );
}
