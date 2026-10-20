import { room } from '../../content/strings';
import { useGameStore } from '../../store/gameStore';
import { CoinAnchor } from '../feedback/CoinAnchor';
import { CoinChip } from '../ui/CoinChip';

/** Münzstand aus dem Store, oben rechts im Raum. */
export function CoinDisplay() {
  const coins = useGameStore((s) => s.coins);
  // Ziel für fliegende Münzen (WEB-3).
  return (
    <CoinAnchor>
      <CoinChip coins={coins} accessibilityLabel={room.coinsLabel(coins)} />
    </CoinAnchor>
  );
}
