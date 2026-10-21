import { AlbumTabs } from '../src/components/album/AlbumTabs';
import { GameScreen } from '../src/components/frame/GameScreen';
import { KnowledgeTab } from '../src/components/album/KnowledgeTab';
import { StrainsTab } from '../src/components/album/StrainsTab';
import { album } from '../src/content/strings';

const albumTabs = [
  { key: 'strains', label: album.strainsTab, Component: StrainsTab },
  { key: 'knowledge', label: album.knowledgeTab, Component: KnowledgeTab },
];

export default function AlbumRoute() {
  return (
    <GameScreen backdrop="album" title={album.title}>
      <AlbumTabs tabs={albumTabs} />
    </GameScreen>
  );
}
