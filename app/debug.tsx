import { BackButton } from '../src/components/ui/BackButton';
import { ScreenPlaceholder } from '../src/components/ui/ScreenPlaceholder';
import { debug } from '../src/content/strings';

export default function DebugRoute() {
  return (
    <ScreenPlaceholder title={debug.title}>
      <BackButton />
    </ScreenPlaceholder>
  );
}
