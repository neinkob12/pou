import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, Text } from 'react-native';

import { settingsSections } from '../src/components/settings/sections';
import { settings } from '../src/content/strings';

export default function SettingsRoute() {
  return (
    <SafeAreaView className="flex-1 bg-cream" edges={['top']}>
      <ScrollView contentContainerClassName="gap-4 p-4">
        <Text className="font-heading text-3xl text-ink">{settings.title}</Text>
        {settingsSections.map(({ key, Component }) => (
          <Component key={key} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
