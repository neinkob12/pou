import { MinigameShell } from '../../src/components/minigames/framework/MinigameShell';
import { TapCircleGame } from '../../src/components/minigames/framework/example/TapCircleGame';
import { tapGame } from '../../src/content/strings';
import { TAP_CIRCLE } from '../../src/game/config';

export default function TapRoute() {
  return (
    <MinigameShell gameId="tap" title={tapGame.title} durationSeconds={TAP_CIRCLE.durationSeconds}>
      {(session) => <TapCircleGame session={session} />}
    </MinigameShell>
  );
}
