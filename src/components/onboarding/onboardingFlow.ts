// Ablauf des Erststarts (P26), reines TypeScript ohne React: Altersfrage, Tutorial, Consent.
// Die Weiche in app/_layout.tsx und das Tutorial-Overlay lesen nur diese Funktionen.

import { STRAINS, type StrainId } from '../../game/config';
import type { CareActionId } from '../../game/events';
import { STRAIN_ORDER } from '../../game/progression';

export type OnboardingStage = 'age' | 'tutorial' | 'consent' | 'done';

export interface OnboardingFlags {
  ageConfirmed: boolean;
  tutorialDone: boolean;
  consentStepDone: boolean;
}

/** Wo der Spieler im Erststart steht. */
export function onboardingStage(flags: OnboardingFlags): OnboardingStage {
  if (!flags.ageConfirmed) return 'age';
  if (!flags.tutorialDone) return 'tutorial';
  if (!flags.consentStepDone) return 'consent';
  return 'done';
}

/**
 * Darf das Zimmer schon gezeichnet werden (P31)? Nicht vor dem Laden des Spielstands und nicht
 * ohne Altersbestätigung, sonst blitzt es beim allerersten Start vor der Altersfrage auf.
 */
export function canShowRoom(hydrated: boolean, ageConfirmed: boolean): boolean {
  return hydrated && ageConfirmed;
}

/** Ohne Altersbestätigung führt jede Route zur Altersfrage. */
export function shouldRedirectToOnboarding(stage: OnboardingStage, onOnboardingRoute: boolean): boolean {
  return stage === 'age' && !onOnboardingRoute;
}

/** Nach der Altersbestätigung geht es vom Onboarding-Screen ins Zimmer. */
export function shouldLeaveOnboarding(stage: OnboardingStage, onOnboardingRoute: boolean): boolean {
  return stage !== 'age' && onOnboardingRoute;
}

export type TutorialStep = 'plant' | 'water' | 'bars' | 'minigames';

export const TUTORIAL_STEPS: readonly TutorialStep[] = ['plant', 'water', 'bars', 'minigames'];

/** Erster Schritt: Steht schon eine Pflanze im Topf, entfällt das Pflanzen. */
export function firstTutorialStep(hasPlant: boolean): TutorialStep {
  return hasPlant ? 'water' : 'plant';
}

/** Nächster Schritt oder null, wenn das Tutorial durch ist. */
export function nextTutorialStep(step: TutorialStep): TutorialStep | null {
  const i = TUTORIAL_STEPS.indexOf(step);
  return TUTORIAL_STEPS[i + 1] ?? null;
}

/** Der Gieß-Schritt geht von selbst weiter, sobald der Spieler wirklich gießt. */
export function careCompletesStep(step: TutorialStep, action: CareActionId): boolean {
  return step === 'water' && action === 'water';
}

/** Samen für das Tutorial: die erste Sorte, die von Anfang an frei ist. */
export function tutorialStrainId(): StrainId {
  return STRAIN_ORDER.find((id) => STRAINS[id].unlock.type === 'start') ?? STRAIN_ORDER[0];
}
