import { settingsSections } from '../src/components/settings/sections';
import { GameScreen } from '../src/components/frame/GameScreen';
import { settings } from '../src/content/strings';

export default function SettingsRoute() {
  return (
    <GameScreen backdrop="settings" title={settings.title}>
      {settingsSections.map(({ key, Component }) => (
        <Component key={key} />
      ))}
    </GameScreen>
  );
}
