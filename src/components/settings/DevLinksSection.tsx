import { debug, harvestScreen, onboarding, seedSelect, settings } from '../../content/strings';
import { NavLink } from '../ui/NavLink';
import { DEV_TOOLS } from '../../lib/devTools';
import { SettingsSection } from './SettingsSection';

/** Nur im Entwicklungs-Build: Links zu Screens ohne eigenen Tab. */
export function DevLinksSection() {
  if (!DEV_TOOLS) return null;
  return (
    <SettingsSection title={settings.devTitle}>
      <NavLink href="/debug" label={debug.title} />
      <NavLink href="/harvest" label={harvestScreen.title} />
      <NavLink href="/seed-select" label={seedSelect.title} />
      <NavLink href="/onboarding" label={onboarding.title} />
    </SettingsSection>
  );
}
