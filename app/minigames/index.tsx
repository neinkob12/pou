import { NavLink } from '../../src/components/ui/NavLink';
import { ScreenPlaceholder } from '../../src/components/ui/ScreenPlaceholder';
import { minigames } from '../../src/content/strings';

export default function MinigamesRoute() {
  return (
    <ScreenPlaceholder title={minigames.title}>
      <NavLink href="/minigames/tap" label={minigames.tap} />
      <NavLink href="/minigames/smash" label={minigames.smash} />
      <NavLink href="/minigames/drops" label={minigames.drops} />
      <NavLink href="/minigames/jump" label={minigames.jump} />
      <NavLink href="/minigames/quiz" label={minigames.quiz} />
    </ScreenPlaceholder>
  );
}
