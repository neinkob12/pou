import { uiGallery as t } from '../../../content/strings';
import type { ToneName } from '../../../lib/theme';
import { Button } from '../Button';
import { IconButton } from '../IconButton';
import type { GameIconId } from '../icons/GameIcon';
import { GallerySection, Row } from './GallerySection';

const ICONS: { id: GameIconId; tone: ToneName }[] = [
  { id: 'water', tone: 'sky' },
  { id: 'shop', tone: 'gold' },
  { id: 'settings', tone: 'cream' },
  { id: 'album', tone: 'grape' },
];

export function ButtonGallery() {
  // Skia-Icons erst beim Rendern laden, siehe ui/tabbar/TabItem.tsx.
  // eslint-disable-next-line @typescript-eslint/no-require-imports -- verzögertes Laden
  const { GameIcon } = require('../icons/GameIcon') as typeof import('../icons/GameIcon');
  return (
    <GallerySection title={t.buttons}>
      <Button label={t.primary} />
      <Row>
        <Button label={t.secondary} variant="secondary" />
        <Button label={t.success} variant="success" />
        <Button label={t.danger} variant="danger" />
      </Row>
      <Row>
        <Button label={t.gold} variant="gold" />
        <Button label={t.disabled} disabled />
        <Button label={t.small} size="sm" />
      </Row>
      <Button label={t.large} size="lg" variant="success" />
      <Row>
        {ICONS.map((i) => (
          <IconButton key={i.id} tone={i.tone} accessibilityLabel={t.iconLabel(i.id)} icon={<GameIcon id={i.id} size={28} />} />
        ))}
      </Row>
    </GallerySection>
  );
}
