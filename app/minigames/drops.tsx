import { BackButton } from '../../src/components/ui/BackButton';
import { ScreenPlaceholder } from '../../src/components/ui/ScreenPlaceholder';
import { minigames } from '../../src/content/strings';

export default function DropsRoute() {
  return (
    <ScreenPlaceholder title={minigames.drops}>
      <BackButton />
    </ScreenPlaceholder>
  );
}
