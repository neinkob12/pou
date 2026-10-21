import { ui } from '../../lib/assets';
import { AssetImage } from '../ui/AssetImage';

const SIZE = 18;

/** Kleine Münze vor dem Preis auf Kauf-Knöpfen (WEB-5). */
export function PriceCoin() {
  return <AssetImage source={ui.u9_coin} label="U9" color="lamp" size={SIZE} round icon="coin" />;
}
