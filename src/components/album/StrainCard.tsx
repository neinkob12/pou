import { Text, View } from 'react-native';

import type { Rarity, Strain } from '../../game/config';
import { unlockProgress, type ProgressStats } from '../../game/progression';
import { strainsAlbum } from '../../content/strings';
import type { ColorName } from '../../lib/theme';
import { Button } from '../ui/Button';
import { Placeholder } from '../ui/Placeholder';

const DAYS_PER_WEEK = 7;

const RARITY_COLOR: Record<Rarity, ColorName> = {
  common: 'plantLight',
  rare: 'lavender',
  epic: 'coral',
  speed: 'lamp',
  legendary: 'terracotta',
};

interface StrainCardProps {
  strain: Strain;
  unlocked: boolean;
  stats: ProgressStats;
  /** Knopf zum Pflanzen (Samenauswahl). Fehlt er, ist es eine reine Album-Karte. */
  action?: { label: string; onPress: () => void; disabled?: boolean };
}

function unlockHint(strain: Strain, stats: ProgressStats): string {
  const u = strain.unlock;
  const p = unlockProgress(strain, stats);
  switch (u.type) {
    case 'start':
      return strainsAlbum.unlockHint.start;
    case 'harvests':
      return strainsAlbum.unlockHint.harvests(p?.current ?? 0, u.count);
    case 'seedFragments':
      return strainsAlbum.unlockHint.seedFragments(p?.current ?? 0, u.count);
    case 'level':
      return strainsAlbum.unlockHint.level(u.level);
    case 'event':
      return strainsAlbum.unlockHint.event;
  }
}

/** Sammelkarte einer Sorte: Porträt, Seltenheit, Blütedauer, Besonderheit, gesperrt oder frei. */
export function StrainCard({ strain, unlocked, stats, action }: StrainCardProps) {
  const weeks = Math.round(strain.floweringDays / DAYS_PER_WEEK);
  return (
    <View
      accessibilityLabel={`${strain.name}, ${unlocked ? strainsAlbum.unlocked : strainsAlbum.locked}`}
      className={`gap-2 rounded-2xl bg-white p-4 ${unlocked ? '' : 'opacity-60'}`}
    >
      <Placeholder
        label={unlocked ? strainsAlbum.portrait(strain.name) : strainsAlbum.locked}
        color={unlocked ? RARITY_COLOR[strain.rarity] : 'inkMuted'}
        height={120}
      />
      <View className="flex-row items-center justify-between">
        <Text className="font-heading text-xl text-ink">{strain.name}</Text>
        <Text className="font-body-bold text-sm text-inkMuted">{strainsAlbum.rarity[strain.rarity]}</Text>
      </View>
      <Text className="font-body text-sm text-ink">
        {strainsAlbum.floweringWeeks(weeks)}
        {strain.autoflower ? ` · ${strainsAlbum.autoflower}` : ''}
      </Text>
      <Text className="font-body text-base text-ink">{strainsAlbum.special[strain.id]}</Text>
      <Text className="font-body-bold text-sm text-plantDark">
        {unlocked ? strainsAlbum.unlocked : unlockHint(strain, stats)}
      </Text>
      {action && unlocked ? (
        <Button label={action.label} onPress={action.onPress} disabled={action.disabled} />
      ) : null}
    </View>
  );
}
