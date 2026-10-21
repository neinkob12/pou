import { AlbumTabs } from '../src/components/album/AlbumTabs';
import { KnowledgeTab } from '../src/components/album/KnowledgeTab';
import { StrainsTab } from '../src/components/album/StrainsTab';
import { Screen } from '../src/components/ui/Screen';
import { album } from '../src/content/strings';

const albumTabs = [
  { key: 'strains', label: album.strainsTab, Component: StrainsTab },
  { key: 'knowledge', label: album.knowledgeTab, Component: KnowledgeTab },
];

export default function AlbumRoute() {
  return (
    <Screen title={album.title}>
      <AlbumTabs tabs={albumTabs} />
    </Screen>
  );
}
