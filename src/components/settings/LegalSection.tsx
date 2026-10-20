import { Linking, Pressable, Text } from 'react-native';

import { legal, legalUrls } from '../../content/strings';
import { SettingsSection } from './SettingsSection';

function LegalLink({ label, url }: { label: string; url: string }) {
  const open = () => {
    Linking.openURL(url).catch((error: unknown) => console.warn('[legal] Link nicht geöffnet.', error));
  };
  return (
    <Pressable accessibilityRole="link" onPress={open} className="rounded-xl bg-cream px-4 py-3 active:opacity-70">
      <Text className="font-body-bold text-base text-ink">{label}</Text>
    </Pressable>
  );
}

/** Impressum und Datenschutz als Links (P26). Adressen in legalUrls, noch Platzhalter. */
export function LegalSection() {
  return (
    <SettingsSection title={legal.title}>
      <LegalLink label={legal.imprint} url={legalUrls.imprint} />
      <LegalLink label={legal.privacy} url={legalUrls.privacy} />
    </SettingsSection>
  );
}
