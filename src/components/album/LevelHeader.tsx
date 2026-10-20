import { Text, View } from 'react-native';

import { levelProgress, type ProgressStats } from '../../game/progression';
import { strainsAlbum } from '../../content/strings';
import { Bar } from '../ui/Bar';

/** Level, Erfahrungsbalken und Zähler über dem Sorten-Album. */
export function LevelHeader({ stats }: { stats: ProgressStats }) {
  const p = levelProgress(stats.xp);
  return (
    <View className="gap-2 rounded-2xl bg-white p-4">
      <Text className="font-heading text-2xl text-ink">{strainsAlbum.level(p.level)}</Text>
      <Bar value={p.progress} color="lavender" height={12} accessibilityLabel={strainsAlbum.level(p.level)} />
      <Text className="font-body text-sm text-inkMuted">
        {p.xpForNextLevel === null ? strainsAlbum.maxLevel : strainsAlbum.xp(p.xpIntoLevel, p.xpForNextLevel)}
      </Text>
      <View className="flex-row justify-between">
        <Text className="font-body-bold text-sm text-ink">{strainsAlbum.harvests(stats.harvests)}</Text>
        <Text className="font-body-bold text-sm text-ink">{strainsAlbum.seedFragments(stats.seedFragments)}</Text>
      </View>
    </View>
  );
}
