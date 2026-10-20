import { Pressable, StyleSheet, View } from 'react-native';

import { health as healthText } from '../../content/strings';
import type { PestKind } from '../../game/config';
import { health as healthAssets, type HealthAssetId } from '../../lib/assets';
import { useGameStore } from '../../store/gameStore';
import { playPickupHaptic } from '../room/care/haptics';
import { pestSpots } from '../room/health/healthLogic';
import { MoldSpot } from '../room/health/MoldSpot';
import { AssetImage } from '../ui/AssetImage';
import { BUDI_SIZE } from './Budi';

/** Größe eines Schädlings als Anteil der Budi-Leinwand. Klein, aber gut zu treffen. */
const PEST_SIZE = 0.13;
/** Extra Trefferfläche rundum in Punkten. */
const PEST_HIT_SLOP = 10;

const PEST_ASSET: Record<PestKind, HealthAssetId> = {
  spiderMite: 'u17_spider_mite',
  fungusGnat: 'u17_fungus_gnat',
};

/** Schädlinge und Schimmel auf Budi (P21). Liegt über Budi auf derselben Leinwand. */
export function Pests({ size = BUDI_SIZE }: { size?: number }) {
  const pests = useGameStore((s) => s.health.pests);
  const tapPest = useGameStore((s) => s.tapPest);
  const pestSize = size * PEST_SIZE;

  return (
    <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
      <MoldSpot canvasSize={size} />
      {pestSpots(pests).map(({ pest, x, y }) => (
        <Pressable
          key={pest.id}
          accessibilityRole="button"
          accessibilityLabel={healthText.pestLabel(healthText.pests[pest.kind])}
          hitSlop={PEST_HIT_SLOP}
          onPress={() => {
            playPickupHaptic();
            tapPest(pest.id);
          }}
          style={{ position: 'absolute', left: size * x - pestSize / 2, top: size * y - pestSize / 2 }}
        >
          <AssetImage
            source={healthAssets[PEST_ASSET[pest.kind]]}
            label={healthText.pestPlaceholder[pest.kind]}
            color={pest.kind === 'spiderMite' ? 'coral' : 'night'}
            size={pestSize}
            round
          />
        </Pressable>
      ))}
    </View>
  );
}
