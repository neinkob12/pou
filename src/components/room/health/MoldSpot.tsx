import { Pressable } from 'react-native';

import { health as healthText } from '../../../content/strings';
import { MOLD_TREATMENT_COINS } from '../../../game/config';
import { health as healthAssets } from '../../../lib/assets';
import { useGameStore } from '../../../store/gameStore';
import { playCareHaptic } from '../care/haptics';
import { AssetImage } from '../../ui/AssetImage';
import { cureMoldWithCoins } from './healthLogic';

/** Größe des Schimmelflecks als Anteil der Budi-Leinwand. */
const MOLD_SIZE = 0.26;
/** Mitte des Flecks auf der Leinwand (über der Trockenleine). */
const MOLD_SPOT = { x: 0.5, y: 0.42 };

/** Schimmelfleck beim Trocknen. Antippen behandelt ihn gegen Münzen. */
export function MoldSpot({ canvasSize }: { canvasSize: number }) {
  const hasMold = useGameStore((s) => s.health.moldSinceMs !== null);
  const coins = useGameStore((s) => s.coins);
  if (!hasMold) return null;

  const size = canvasSize * MOLD_SIZE;
  const affordable = coins >= MOLD_TREATMENT_COINS;
  const onPress = () => playCareHaptic(cureMoldWithCoins(useGameStore.getState()) ? 'success' : 'error');

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={affordable ? healthText.moldLabel(MOLD_TREATMENT_COINS) : healthText.moldTooPoor}
      onPress={onPress}
      hitSlop={8}
      style={{
        position: 'absolute',
        left: canvasSize * MOLD_SPOT.x - size / 2,
        top: canvasSize * MOLD_SPOT.y - size / 2,
      }}
    >
      <AssetImage source={healthAssets.u17_mold} label={healthText.moldPlaceholder} color="plantLight" size={size} round />
    </Pressable>
  );
}
