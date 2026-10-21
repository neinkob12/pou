import { Text, View } from 'react-native';

import type { Rarity, Strain } from '../../game/config';
import { unlockProgress, type ProgressStats } from '../../game/progression';
import { strainsAlbum } from '../../content/strings';
import { colors, radii, surface, type ColorName } from '../../lib/theme';
import { Badge } from '../ui/Badge';
import { Bar } from '../ui/Bar';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { IconTile } from '../ui/IconTile';

const DAYS_PER_WEEK = 7;
const PORTRAIT_SIZE = 84;

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

/** Rätsel-Porträt einer gesperrten Sorte: dunkle Kachel mit Fragezeichen (WEB-3, WEB-5 kompakt). */
function LockedPortrait() {
  return (
    <View
      accessibilityLabel={strainsAlbum.lockedPortrait}
      style={{
        width: PORTRAIT_SIZE,
        height: PORTRAIT_SIZE,
        borderRadius: radii.md,
        backgroundColor: colors.night,
        borderWidth: surface.line,
        borderStyle: 'dashed',
        borderColor: colors.inkMuted,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text className="font-heading text-4xl text-white/70">{strainsAlbum.lockSymbol}</Text>
    </View>
  );
}

/**
 * Sammelkarte einer Sorte (WEB-3, WEB-5 überarbeitet): Porträt links, rechts Name, Seltenheit und
 * Blütezeit. Gesperrt als stumpfe Rätselkarte mit Fortschrittsbalken bis zur Freischaltung.
 */
export function StrainCard({ strain, unlocked, stats, action }: StrainCardProps) {
  const weeks = Math.round(strain.floweringDays / DAYS_PER_WEEK);
  const progress = unlocked ? null : unlockProgress(strain, stats);
  return (
    <Card
      tone={unlocked ? 'plain' : 'muted'}
      accessibilityLabel={`${strain.name}, ${unlocked ? strainsAlbum.unlocked : strainsAlbum.locked}`}
    >
      <View className="flex-row gap-3">
        {unlocked ? (
          <IconTile label={strainsAlbum.portrait(strain.name)} color={RARITY_COLOR[strain.rarity]} size={PORTRAIT_SIZE} />
        ) : (
          <LockedPortrait />
        )}
        <View className="flex-1 gap-1">
          <Text className={`font-heading text-xl leading-6 ${unlocked ? 'text-ink' : 'text-inkMuted'}`}>
            {strain.name}
          </Text>
          <Badge label={strainsAlbum.rarity[strain.rarity]} color={unlocked ? RARITY_COLOR[strain.rarity] : 'cream'} />
          <Text className="font-body text-sm text-inkMuted">
            {strainsAlbum.floweringWeeks(weeks)}
            {strain.autoflower ? ` · ${strainsAlbum.autoflower}` : ''}
          </Text>
        </View>
      </View>
      <Text className={`font-body text-base ${unlocked ? 'text-ink' : 'text-inkMuted'}`}>{strainsAlbum.special[strain.id]}</Text>
      {unlocked ? null : (
        <View className="gap-1">
          <Text className="font-body-bold text-sm text-inkMuted">{unlockHint(strain, stats)}</Text>
          {progress ? (
            <Bar
              value={progress.target > 0 ? progress.current / progress.target : 0}
              color="lavender"
              accessibilityLabel={unlockHint(strain, stats)}
            />
          ) : null}
        </View>
      )}
      {action && unlocked ? <Button label={action.label} onPress={action.onPress} disabled={action.disabled} /> : null}
    </Card>
  );
}
