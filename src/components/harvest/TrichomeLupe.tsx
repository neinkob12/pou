import { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { harvestScreen } from '../../content/strings';
import { harvest as harvestAssets } from '../../lib/assets';
import { colors } from '../../lib/theme';
import { AssetImage } from '../ui/AssetImage';
import { Button } from '../ui/Button';
import { buildTrichomeField, scoreLupe, type TrichomeKind } from './harvestFlow';

const LENS_SIZE = 280;
/** Köpfchen liegen im inneren Quadrat des Kreises, damit keins am Rand abgeschnitten wird. */
const INNER = LENS_SIZE * 0.68;
const INSET = (LENS_SIZE - INNER) / 2;
const HEAD_SIZE = 30;

const HEAD_LOOK: Record<TrichomeKind, { fill: string; border: string }> = {
  clear: { fill: 'transparent', border: colors.white },
  milky: { fill: colors.white, border: colors.white },
  amber: { fill: colors.terracotta, border: colors.lamp },
};

interface TrichomeLupeProps {
  seed: number;
  readyDays: number;
  /** Lupen-Ergebnis 0 bis 1, null wenn übersprungen. */
  onDone: (score: number | null) => void;
}

/** Erkennungsspiel: alle milchigen Köpfchen unter der Lupe antippen. */
export function TrichomeLupe({ seed, readyDays, onDone }: TrichomeLupeProps) {
  const field = useMemo(() => buildTrichomeField(seed, readyDays), [seed, readyDays]);
  const [tapped, setTapped] = useState<number[]>([]);
  const toggle = (id: number) =>
    setTapped((t) => (t.includes(id) ? t.filter((x) => x !== id) : [...t, id]));
  const late = field.filter((h) => h.kind === 'amber').length > field.length / 3;

  return (
    <View className="items-center gap-3">
      <View className="flex-row items-center gap-2">
        <AssetImage source={harvestAssets.u7_lupe} label={harvestScreen.lupeLabel} size={40} round />
        <Text className="font-heading text-2xl text-ink">{harvestScreen.lupeTitle}</Text>
      </View>
      <Text className="text-center font-body text-base text-ink">{harvestScreen.lupeIntro}</Text>
      <View
        style={{
          width: LENS_SIZE,
          height: LENS_SIZE,
          borderRadius: LENS_SIZE / 2,
          borderWidth: 8,
          borderColor: colors.ink,
          backgroundColor: colors.plantDark,
          overflow: 'hidden',
        }}
      >
        {field.map((head) => {
          const look = HEAD_LOOK[head.kind];
          const isTapped = tapped.includes(head.id);
          return (
            <Pressable
              key={head.id}
              accessibilityRole="button"
              accessibilityState={{ selected: isTapped }}
              accessibilityLabel={harvestScreen.lupeHeadLabel(head.id + 1)}
              onPress={() => toggle(head.id)}
              hitSlop={6}
              style={{
                position: 'absolute',
                left: INSET + head.x * INNER - HEAD_SIZE / 2,
                top: INSET + head.y * INNER - HEAD_SIZE / 2,
                width: HEAD_SIZE,
                height: HEAD_SIZE,
                borderRadius: HEAD_SIZE / 2,
                backgroundColor: look.fill,
                borderWidth: isTapped ? 4 : 2,
                borderColor: isTapped ? colors.coral : look.border,
              }}
            />
          );
        })}
      </View>
      <View className="items-center">
        <Text className="font-body text-sm text-inkMuted">{harvestScreen.lupeLegendClear}</Text>
        <Text className="font-body text-sm text-inkMuted">{harvestScreen.lupeLegendMilky}</Text>
        <Text className="font-body text-sm text-inkMuted">{harvestScreen.lupeLegendAmber}</Text>
      </View>
      {late ? <Text className="text-center font-body-bold text-sm text-ink">{harvestScreen.lupeLate}</Text> : null}
      <View className="w-full gap-2">
        <Button label={harvestScreen.lupeDone} onPress={() => onDone(scoreLupe(field, tapped))} />
        <Button label={harvestScreen.lupeSkip} variant="secondary" onPress={() => onDone(null)} />
      </View>
    </View>
  );
}
