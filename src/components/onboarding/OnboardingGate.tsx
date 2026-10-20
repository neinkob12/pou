import { usePathname, useRootNavigationState, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';

import { useGameStore } from '../../store/gameStore';
import { runConsentStep } from './consentHook';
import {
  firstTutorialStep,
  onboardingStage,
  shouldLeaveOnboarding,
  shouldRedirectToOnboarding,
  type TutorialStep,
} from './onboardingFlow';
import { TutorialOverlay } from './TutorialOverlay';

const ONBOARDING_PATH = '/onboarding';
const ROOM_PATH = '/';

/**
 * Onboarding-Weiche (P26), hängt in app/_layout.tsx über den Tabs:
 * ohne Altersbestätigung zur Altersfrage, danach Tutorial im Zimmer, danach der Consent-Schritt.
 */
export function OnboardingGate() {
  const router = useRouter();
  const pathname = usePathname();
  const navReady = Boolean(useRootNavigationState()?.key);
  const hydrated = useGameStore((s) => s.hydration !== 'pending');
  const ageConfirmed = useGameStore((s) => s.ageConfirmed);
  const tutorialDone = useGameStore((s) => s.tutorialDone);
  const consentStepDone = useGameStore((s) => s.consentStepDone);
  const finishConsentStep = useGameStore((s) => s.finishConsentStep);
  // Hier statt im Overlay, damit der Schritt beim Wechsel in einen anderen Tab erhalten bleibt.
  const [step, setStep] = useState<TutorialStep>(() =>
    firstTutorialStep(useGameStore.getState().plant !== null),
  );

  const stage = onboardingStage({ ageConfirmed, tutorialDone, consentStepDone });
  const onOnboarding = pathname === ONBOARDING_PATH;

  useEffect(() => {
    if (!navReady || !hydrated) return;
    if (shouldRedirectToOnboarding(stage, onOnboarding)) router.replace(ONBOARDING_PATH);
    else if (shouldLeaveOnboarding(stage, onOnboarding)) router.replace(ROOM_PATH);
  }, [navReady, hydrated, stage, onOnboarding, router]);

  useEffect(() => {
    if (!hydrated || stage !== 'consent') return;
    let cancelled = false;
    runConsentStep()
      .then(() => {
        if (!cancelled) finishConsentStep();
      })
      .catch((error: unknown) => console.warn('[onboarding] Consent-Schritt fehlgeschlagen.', error));
    return () => {
      cancelled = true;
    };
  }, [hydrated, stage, finishConsentStep]);

  if (!hydrated || stage !== 'tutorial' || pathname !== ROOM_PATH) return null;
  return <TutorialOverlay step={step} onStepChange={setStep} />;
}
