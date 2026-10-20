import { MinigameShell } from '../../src/components/minigames/framework/MinigameShell';
import { SmashGame } from '../../src/components/minigames/smash/SmashGame';
import { smashGame } from '../../src/content/strings';
import { PEST_SMASH } from '../../src/game/config';

export default function SmashRoute() {
  return (
    <MinigameShell gameId="smash" title={smashGame.title} durationSeconds={PEST_SMASH.durationSeconds}>
      {(session) => <SmashGame session={session} />}
    </MinigameShell>
  );
}
