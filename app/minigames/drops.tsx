import { MinigameShell } from '../../src/components/minigames/framework/MinigameShell';
import { DropsGame } from '../../src/components/minigames/drops/DropsGame';
import { minigames } from '../../src/content/strings';

export default function DropsRoute() {
  return (
    <MinigameShell gameId="drops" title={minigames.drops} durationSeconds={null} supportsExtraLife>
      {(session) => <DropsGame session={session} />}
    </MinigameShell>
  );
}
