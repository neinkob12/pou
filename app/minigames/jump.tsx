import { MinigameShell } from '../../src/components/minigames/framework/MinigameShell';
import { JumpGame } from '../../src/components/minigames/jump/JumpGame';
import { minigames } from '../../src/content/strings';

export default function JumpRoute() {
  return (
    <MinigameShell gameId="jump" title={minigames.jump} durationSeconds={null} supportsExtraLife>
      {(session) => <JumpGame session={session} />}
    </MinigameShell>
  );
}
