import { BackButton } from '../../src/components/ui/BackButton';
import { ScreenPlaceholder } from '../../src/components/ui/ScreenPlaceholder';
import { minigames } from '../../src/content/strings';

export default function JumpRoute() {
  return (
    <ScreenPlaceholder title={minigames.jump}>
      <BackButton />
    </ScreenPlaceholder>
  );
}
