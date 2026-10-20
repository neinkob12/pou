import { Text } from 'react-native';

import { debug } from '../../content/strings';
import { NavLink } from '../ui/NavLink';
import { SettingsSection } from './SettingsSection';

/** Einstieg ins Debug-Menü. Im Release-Build nicht vorhanden. */
export function DebugSection() {
  if (!__DEV__) return null;
  return (
    <SettingsSection title={debug.sectionTitle}>
      <Text className="font-body text-sm text-inkMuted">{debug.sectionHint}</Text>
      <NavLink href="/debug" label={debug.open} />
    </SettingsSection>
  );
}
