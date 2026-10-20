import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { onboarding } from '../../content/strings';
import { gameEvents } from '../../game/events';
import { usePlantNewSeed } from '../../hooks/usePlantNewSeed';
import { useGameStore } from '../../store/gameStore';
import { budiSpeak } from '../budi/voice';
import { SpeechBubble } from '../feedback/SpeechBubble';
import { Button } from '../ui/Button';
import {
  careCompletesStep,
  nextTutorialStep,
  TUTORIAL_STEPS,
  tutorialStrainId,
  type TutorialStep,
} from './onboardingFlow';

/** Abstand der Blase unter der Statusleiste, damit Balken und Phase sichtbar bleiben. */
const CARD_TOP_OFFSET = 124;

interface TutorialOverlayProps {
  step: TutorialStep;
  onStepChange: (step: TutorialStep) => void;
}

/**
 * Geführtes Tutorial über dem Zimmer: Budi erklärt in einer Sprechblase je Schritt (WEB-3), das
 * Zimmer bleibt bedienbar. Überspringen geht in jedem Schritt.
 */
export function TutorialOverlay({ step, onStepChange }: TutorialOverlayProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const plantNewSeed = usePlantNewSeed();
  const finishTutorial = useGameStore((s) => s.finishTutorial);
  const hasPlant = useGameStore((s) => s.plant !== null);
  const texts = onboarding.tutorial;
  const next = nextTutorialStep(step);

  const advance = () => (next ? onStepChange(next) : finishTutorial());

  // Budi sagt bei jedem Schritt etwas (im Browser erst nach der ersten Berührung hörbar).
  useEffect(() => budiSpeak(), [step]);

  // Gepflanzt (auch auf anderem Weg): weiter zum Gießen.
  useEffect(() => {
    if (step === 'plant' && hasPlant && next) onStepChange(next);
  }, [step, hasPlant, next, onStepChange]);

  // Echt gegossen: weiter zu den Balken.
  useEffect(
    () =>
      gameEvents.on('careAction', ({ action }) => {
        if (careCompletesStep(step, action) && next) onStepChange(next);
      }),
    [step, next, onStepChange],
  );

  const showMinigames = () => {
    finishTutorial();
    router.push('/minigames');
  };

  return (
    <View pointerEvents="box-none" className="absolute inset-0">
      <View className="mx-4" style={{ marginTop: insets.top + CARD_TOP_OFFSET }}>
        <SpeechBubble
          bubbleKey={step}
          kicker={texts.stepCounter(TUTORIAL_STEPS.indexOf(step) + 1, TUTORIAL_STEPS.length)}
          title={texts.steps[step].title}
          text={texts.steps[step].text}
        >
          <View className="gap-2 pt-1">
            {step === 'plant' && (
              <Button label={texts.steps.plant.action} onPress={() => plantNewSeed(tutorialStrainId())} />
            )}
            {step === 'minigames' && <Button label={texts.steps.minigames.action} onPress={showMinigames} />}
            {step !== 'plant' && (
              <Button
                label={next ? texts.next : texts.done}
                variant={step === 'minigames' ? 'secondary' : 'primary'}
                onPress={advance}
              />
            )}
            {next && (
              <Pressable accessibilityRole="button" onPress={finishTutorial} className="items-center py-1">
                <Text className="font-body text-sm text-inkMuted underline">{texts.skip}</Text>
              </Pressable>
            )}
          </View>
        </SpeechBubble>
      </View>
    </View>
  );
}
