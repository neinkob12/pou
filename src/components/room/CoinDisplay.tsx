import { room } from '../../content/strings';
import { useGameStore } from '../../store/gameStore';
import { CoinChip } from '../ui/CoinChip';

/** Münzstand aus dem Store, oben rechts im Raum. */
export function CoinDisplay() {
  const coins = useGameStore((s) => s.coins);
  return <CoinChip coins={coins} accessibilityLabel={room.coinsLabel(coins)} />;
}
