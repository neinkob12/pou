import { settingsSections } from '../src/components/settings/sections';
import { Screen } from '../src/components/ui/Screen';
import { settings } from '../src/content/strings';

export default function SettingsRoute() {
  return (
    <Screen title={settings.title}>
      {settingsSections.map(({ key, Component }) => (
        <Component key={key} />
      ))}
    </Screen>
  );
}
