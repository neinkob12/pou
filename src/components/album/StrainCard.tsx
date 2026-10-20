import { Text, View } from 'react-native';

import type { Rarity, Strain } from '../../game/config';
import { unlockProgress, type ProgressStats } from '../../game/progression';
import { strainsAlbum } from '../../content/strings';
import type { ColorName } from '../../lib/theme';
import { Bar } from '../ui/Bar';
import { Button } from '../ui/Button';
import { Placeholder } from '../ui/Placeholder';

const DAYS_PER_WEEK = 7;
const PORTRAIT_HEIGHT = 120;

const RARITY_COLOR: Record<Rarity, ColorName> = {
  common: 'plantLight',
  rare: 'lavender',
  epic: 'coral',
  speed: 'lamp',
  legendary: 'terracotta',
};

const RARITY_BG: Record<Rarity, string> = {
  common: 'bg-plantLight',
  rare: 'bg-lavender',
  epic: 'bg-coral',
  speed: 'bg-lamp',
  legendary: 'bg-terracotta',
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

/** Rätsel-Porträt einer gesperrten Sorte: dunkle Fläche mit Fragezeichen (WEB-3). */
function LockedPortrait() {
  return (
    <View
      accessibilityLabel={strainsAlbum.lockedPortrait}
      className="items-center justify-center rounded-xl border-2 border-dashed border-inkMuted bg-night"
      style={{ height: PORTRAIT_HEIGHT }}
    >
      <Text className="font-heading text-5xl text-white/70">{strainsAlbum.lockSymbol}</Text>
      <Text className="font-body-bold text-sm text-white/70">{strainsAlbum.lockedPortrait}</Text>
    </View>
  );
}

/**
 * Sammelkarte einer Sorte (WEB-3 überarbeitet): Seltenheit als farbige Plakette. Freigeschaltet mit
 * farbigem Porträt, gesperrt als dunkle Rätselkarte mit Fortschrittsbalken bis zur Freischaltung.
 */
export function StrainCard({ strain, unlocked, stats, action }: StrainCardProps) {
  const weeks = Math.round(strain.floweringDays / DAYS_PER_WEEK);
  const progress = unlocked ? null : unlockProgress(strain, stats);
  return (
    <View
      accessibilityLabel={`${strain.name}, ${unlocked ? strainsAlbum.unlocked : strainsAlbum.locked}`}
      className={`gap-2 rounded-2xl p-4 ${unlocked ? 'bg-white' : 'bg-white/60'}`}
    >
      {unlocked ? (
        <Placeholder
          label={strainsAlbum.portrait(strain.name)}
          color={RARITY_COLOR[strain.rarity]}
          height={PORTRAIT_HEIGHT}
        />
      ) : (
        <LockedPortrait />
      )}
      <View className="flex-row items-center justify-between gap-2">
        <Text className={`flex-1 font-heading text-xl ${unlocked ? 'text-ink' : 'text-inkMuted'}`}>{strain.name}</Text>
        <View className={`rounded-full px-3 py-0.5 ${unlocked ? RARITY_BG[strain.rarity] : 'bg-inkMuted/30'}`}>
          <Text className="font-body-bold text-xs text-ink">{strainsAlbum.rarity[strain.rarity]}</Text>
        </View>
      </View>
      <Text className="font-body text-sm text-ink">
        {strainsAlbum.floweringWeeks(weeks)}
        {strain.autoflower ? ` · ${strainsAlbum.autoflower}` : ''}
      </Text>
      <Text className="font-body text-base text-ink">{strainsAlbum.special[strain.id]}</Text>
      <Text className={`font-body-bold text-sm ${unlocked ? 'text-plantDark' : 'text-inkMuted'}`}>
        {unlocked ? strainsAlbum.unlocked : unlockHint(strain, stats)}
      </Text>
      {progress ? (
        <Bar
          value={progress.target > 0 ? progress.current / progress.target : 0}
          color="lavender"
          accessibilityLabel={unlockHint(strain, stats)}
        />
      ) : null}
      {action && unlocked ? <Button label={action.label} onPress={action.onPress} disabled={action.disabled} /> : null}
    </View>
  );
}
