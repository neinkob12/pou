import { useState } from 'react';
import { View } from 'react-native';

import { uiGallery as t } from '../../../content/strings';
import { colors, spacing, type ToneName } from '../../../lib/theme';
import { Badge } from '../Badge';
import { Bar } from '../Bar';
import { Button } from '../Button';
import { Card, type CardTone } from '../Card';
import { Chip } from '../Chip';
import { CoinChip } from '../CoinChip';
import { GameText } from '../GameText';
import { Modal } from '../Modal';
import { SectionTitle } from '../SectionTitle';
import { ButtonGallery } from './ButtonGallery';
import { GallerySection, Row } from './GallerySection';

const CARD_TONES: CardTone[] = ['plain', 'success', 'rare', 'highlight', 'muted', 'night'];
const BAR_TONES: ToneName[] = ['sky', 'leaf', 'gold', 'coral', 'grape'];
const BAR_STEPS = [0.15, 0.4, 0.65, 0.9, 1];
const COIN_STEP = 25;

/** Galerie aller Oberflächen-Bausteine im Spiel-Look (ART-1), im Debug-Menü. */
export function UiGallery() {
  const [step, setStep] = useState(0);
  const [coins, setCoins] = useState(120);
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <View style={{ gap: spacing.md }}>
      <SectionTitle title={t.title} />
      <ButtonGallery />

      <GallerySection title={t.bars}>
        {BAR_TONES.map((tone, i) => (
          <Bar key={tone} tone={tone} value={BAR_STEPS[(i + step) % BAR_STEPS.length]} />
        ))}
        <Button label={t.shuffle} variant="secondary" size="sm" onPress={() => setStep((s) => s + 1)} />
      </GallerySection>

      <GallerySection title={t.badges}>
        <Row>
          <Badge label={t.badgeNew} tone="coral" />
          <Badge label={t.badgeRare} tone="grape" />
          <Badge label={t.badgeLevel} tone="gold" />
          <Badge label={t.badgeNew} tone="leaf" />
        </Row>
        <Row>
          <CoinChip coins={coins} />
          <Chip value="3/5" tone="coral" />
          <Chip value="42" tone="sky" />
        </Row>
        <Row>
          <Button label={t.addCoins} variant="gold" size="sm" onPress={() => setCoins((c) => c + COIN_STEP)} />
          <Button label={t.openModal} size="sm" onPress={() => setModalOpen(true)} />
        </Row>
      </GallerySection>

      <SectionTitle title={t.cards} />
      {CARD_TONES.map((tone) => (
        <Card key={tone} tone={tone} onPress={() => undefined}>
          <GameText variant="bodyBold" color={tone === 'night' ? colors.white : colors.ink}>
            {t.cardTone(tone)}
          </GameText>
        </Card>
      ))}

      <GallerySection title={t.type}>
        <GameText variant="display" color={colors.coral} shadow>
          {t.displaySample}
        </GameText>
        <GameText variant="title">{t.titleSample}</GameText>
        <GameText>{t.bodySample}</GameText>
      </GallerySection>

      <Modal visible={modalOpen} title={t.modalTitle} onClose={() => setModalOpen(false)}>
        <GameText align="center">{t.modalText}</GameText>
      </Modal>
    </View>
  );
}
