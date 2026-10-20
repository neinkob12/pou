import { ScrollView, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { debug } from '../../content/strings';
import { BackButton } from '../ui/BackButton';
import { DebugControls } from './DebugControls';
import { DebugStatus } from './DebugStatus';

/** Debug-Menü (nur Entwicklungs-Build, siehe app/debug.tsx). */
export function DebugMenu() {
  return (
    <SafeAreaView className="flex-1 bg-cream" edges={['top']}>
      <ScrollView contentContainerClassName="gap-4 p-4">
        <Text className="font-heading text-3xl text-ink">{debug.title}</Text>
        <BackButton />
        <DebugStatus />
        <DebugControls />
      </ScrollView>
    </SafeAreaView>
  );
}
