import { ScrollView, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HarvestFlow } from '../src/components/harvest/HarvestFlow';
import { BackButton } from '../src/components/ui/BackButton';
import { harvestScreen } from '../src/content/strings';

/** Ernte (P24): Trichom-Lupe, Schere, Trocknen, Abschluss, danach Samenauswahl. */
export default function HarvestRoute() {
  return (
    <SafeAreaView className="flex-1 bg-cream" edges={['top']}>
      <ScrollView contentContainerClassName="gap-4 p-4">
        <BackButton />
        <Text className="font-heading text-3xl text-ink">{harvestScreen.title}</Text>
        <HarvestFlow />
      </ScrollView>
    </SafeAreaView>
  );
}
