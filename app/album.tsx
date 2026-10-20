import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, Text } from 'react-native';

import { AlbumTabs } from '../src/components/album/AlbumTabs';
import { KnowledgeTab } from '../src/components/album/KnowledgeTab';
import { StrainsTab } from '../src/components/album/StrainsTab';
import { album } from '../src/content/strings';

const albumTabs = [
  { key: 'strains', label: album.strainsTab, Component: StrainsTab },
  { key: 'knowledge', label: album.knowledgeTab, Component: KnowledgeTab },
];

export default function AlbumRoute() {
  return (
    <SafeAreaView className="flex-1 bg-cream" edges={['top']}>
      <ScrollView contentContainerClassName="gap-4 p-4">
        <Text className="font-heading text-3xl text-ink">{album.title}</Text>
        <AlbumTabs tabs={albumTabs} />
      </ScrollView>
    </SafeAreaView>
  );
}
