import { BackButton } from '../src/components/ui/BackButton';
import { ScreenPlaceholder } from '../src/components/ui/ScreenPlaceholder';
import { harvestScreen } from '../src/content/strings';

export default function HarvestRoute() {
  return (
    <ScreenPlaceholder title={harvestScreen.title}>
      <BackButton />
    </ScreenPlaceholder>
  );
}
