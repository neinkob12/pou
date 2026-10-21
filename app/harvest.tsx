import { GameScreen } from '../src/components/frame/GameScreen';
import { HarvestFlow } from '../src/components/harvest/HarvestFlow';
import { harvestScreen } from '../src/content/strings';

/** Ernte (P24): Trichom-Lupe, Schere, Trocknen, Abschluss, danach Samenauswahl. */
export default function HarvestRoute() {
  return (
    <GameScreen backdrop="harvest" title={harvestScreen.title} back>
      <HarvestFlow />
    </GameScreen>
  );
}
