import { BackButton } from '../src/components/ui/BackButton';
import { ScreenPlaceholder } from '../src/components/ui/ScreenPlaceholder';
import { onboarding } from '../src/content/strings';

export default function OnboardingRoute() {
  return (
    <ScreenPlaceholder title={onboarding.title}>
      <BackButton />
    </ScreenPlaceholder>
  );
}
