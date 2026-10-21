import { Text, View } from 'react-native';

import { celebrations, dailyGoals, lightPhase } from '../../content/strings';
import { cue } from '../../lib/audio';
import { colors, surface } from '../../lib/theme';
import { Button } from '../ui/Button';
import { Bouncy } from './Bouncy';
import { BudiAvatar } from './BudiAvatar';
import type { Celebration } from './celebrationQueue';
import { CountUpText } from './CountUpText';

const TITLE: Record<Celebration['kind'], string> = {
  phase: lightPhase.phaseChangedTitle,
  chest: dailyGoals.chestTitle,
  level: celebrations.levelTitle,
};

interface CelebrationCardProps {
  celebration: Celebration;
  onClose: () => void;
  /** Münzen der Kiste fertig hochgezählt: Münzregen starten. */
  onCoinsCounted: () => void;
}

/** Inhalt einer Feier (ART-5): hüpfender Budi, Titel als Spielschrift, Text oder Zahl, Weiter-Knopf. */
export function CelebrationCard({ celebration: c, onClose, onCoinsCounted }: CelebrationCardProps) {
  return (
    <>
      <Bouncy>
        <BudiAvatar size={80} />
      </Bouncy>
      <Text className="text-center font-heading text-3xl text-ink">{TITLE[c.kind]}</Text>
      {c.kind === 'phase' ? (
        <Text className="text-center font-body-bold text-lg text-ink">{lightPhase.phaseChanged[c.phase]}</Text>
      ) : null}
      {c.kind === 'chest' ? (
        <>
          <CountUpText
            value={c.coins}
            format={celebrations.coins}
            onDone={() => {
              cue('coins');
              onCoinsCounted();
            }}
            className="font-heading text-5xl text-coral"
          />
          <Text className="text-center font-body text-base text-ink">{celebrations.chestText}</Text>
        </>
      ) : null}
      {c.kind === 'level' ? (
        <>
          <View
            className="rounded-full bg-lavender px-6 py-2"
            style={{ borderWidth: surface.line, borderBottomWidth: surface.edge, borderColor: colors.plantDark }}
          >
            <Text className="font-heading text-4xl text-white">{celebrations.level(c.level)}</Text>
          </View>
          <Text className="text-center font-body text-base text-ink">{celebrations.levelText}</Text>
        </>
      ) : null}
      <View className="w-full">
        <Button label={celebrations.continue} onPress={onClose} />
      </View>
    </>
  );
}
