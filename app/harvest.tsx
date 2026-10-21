import { HarvestFlow } from '../src/components/harvest/HarvestFlow';
import { Screen } from '../src/components/ui/Screen';
import { harvestScreen } from '../src/content/strings';

/** Ernte (P24): Trichom-Lupe, Schere, Trocknen, Abschluss, danach Samenauswahl. */
export default function HarvestRoute() {
  return (
    <Screen title={harvestScreen.title} back>
      <HarvestFlow />
    </Screen>
  );
}
