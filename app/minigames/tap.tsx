import { BackButton } from '../../src/components/ui/BackButton';
import { ScreenPlaceholder } from '../../src/components/ui/ScreenPlaceholder';
import { minigames } from '../../src/content/strings';

export default function TapRoute() {
  return (
    <ScreenPlaceholder title={minigames.tap}>
      <BackButton />
    </ScreenPlaceholder>
  );
}
