import { Text, View } from 'react-native';

import { levelProgress, type ProgressStats } from '../../game/progression';
import { strainsAlbum } from '../../content/strings';
import { colors, radii, surface } from '../../lib/theme';
import { Bar } from '../ui/Bar';
import { Card } from '../ui/Card';

const LEVEL_BADGE = 56;

function Stat({ label }: { label: string }) {
  return (
    <View
      className="flex-1 items-center rounded-2xl bg-white px-2 py-2"
      style={{ borderWidth: surface.line, borderColor: colors.plantDark }}
    >
      <Text className="text-center font-body-bold text-sm text-ink">{label}</Text>
    </View>
  );
}

/** Level, Erfahrungsbalken und Zähler über dem Sorten-Album (WEB-5: als lila Karte mit Level-Plakette). */
export function LevelHeader({ stats }: { stats: ProgressStats }) {
  const p = levelProgress(stats.xp);
  return (
    <Card tone="rare">
      <View className="flex-row items-center gap-3">
        <View
          style={{
            width: LEVEL_BADGE,
            height: LEVEL_BADGE,
            borderRadius: radii.pill,
            backgroundColor: colors.lavender,
            borderWidth: surface.line,
            borderColor: colors.plantDark,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text className="font-heading text-2xl text-white">{p.level}</Text>
        </View>
        <View className="flex-1 gap-1">
          <Text className="font-heading text-xl text-ink">{strainsAlbum.level(p.level)}</Text>
          <Bar value={p.progress} color="lavender" height={12} accessibilityLabel={strainsAlbum.level(p.level)} />
          <Text className="font-body text-sm text-inkMuted">
            {p.xpForNextLevel === null ? strainsAlbum.maxLevel : strainsAlbum.xp(p.xpIntoLevel, p.xpForNextLevel)}
          </Text>
        </View>
      </View>
      <View className="flex-row gap-2 pt-1">
        <Stat label={strainsAlbum.harvests(stats.harvests)} />
        <Stat label={strainsAlbum.seedFragments(stats.seedFragments)} />
      </View>
    </Card>
  );
}
