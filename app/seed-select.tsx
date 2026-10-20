import { BackButton } from '../src/components/ui/BackButton';
import { ScreenPlaceholder } from '../src/components/ui/ScreenPlaceholder';
import { seedSelect } from '../src/content/strings';

export default function SeedSelectRoute() {
  return (
    <ScreenPlaceholder title={seedSelect.title}>
      <BackButton />
    </ScreenPlaceholder>
  );
}
