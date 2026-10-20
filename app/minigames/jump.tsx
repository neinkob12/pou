import { MinigameShell } from '../../src/components/minigames/framework/MinigameShell';
import { JumpGame } from '../../src/components/minigames/jump/JumpGame';
import { JUMP_GAME_ID } from '../../src/components/minigames/jump/jumpReward';
import { minigames } from '../../src/content/strings';

export default function JumpRoute() {
  return (
    <MinigameShell gameId={JUMP_GAME_ID} title={minigames.jump} durationSeconds={null} supportsExtraLife>
      {(session) => <JumpGame session={session} />}
    </MinigameShell>
  );
}
