import {
  careCompletesStep,
  firstTutorialStep,
  nextTutorialStep,
  onboardingStage,
  shouldLeaveOnboarding,
  shouldRedirectToOnboarding,
  TUTORIAL_STEPS,
  tutorialStrainId,
} from '../onboardingFlow';
import { STRAINS } from '../../../game/config';

const flags = (ageConfirmed: boolean, tutorialDone: boolean, consentStepDone: boolean) => ({
  ageConfirmed,
  tutorialDone,
  consentStepDone,
});

describe('onboardingStage', () => {
  it('fragt zuerst nach dem Alter', () => {
    expect(onboardingStage(flags(false, false, false))).toBe('age');
    expect(onboardingStage(flags(false, true, true))).toBe('age');
  });

  it('geht über Tutorial und Consent zu fertig', () => {
    expect(onboardingStage(flags(true, false, false))).toBe('tutorial');
    expect(onboardingStage(flags(true, true, false))).toBe('consent');
    expect(onboardingStage(flags(true, true, true))).toBe('done');
  });
});

describe('Weiche', () => {
  it('leitet ohne Altersbestätigung immer zur Altersfrage', () => {
    expect(shouldRedirectToOnboarding('age', false)).toBe(true);
    expect(shouldRedirectToOnboarding('age', true)).toBe(false);
  });

  it('leitet nach der Bestätigung nie mehr dorthin', () => {
    for (const stage of ['tutorial', 'consent', 'done'] as const) {
      expect(shouldRedirectToOnboarding(stage, false)).toBe(false);
    }
  });

  it('verlässt den Onboarding-Screen nach der Bestätigung', () => {
    expect(shouldLeaveOnboarding('age', true)).toBe(false);
    expect(shouldLeaveOnboarding('tutorial', true)).toBe(true);
    expect(shouldLeaveOnboarding('done', true)).toBe(true);
    expect(shouldLeaveOnboarding('done', false)).toBe(false);
  });
});

describe('Tutorial-Schritte', () => {
  it('beginnt mit Pflanzen, außer es steht schon eine Pflanze im Topf', () => {
    expect(firstTutorialStep(false)).toBe('plant');
    expect(firstTutorialStep(true)).toBe('water');
  });

  it('läuft Pflanzen, Gießen, Balken, Minigames und endet dann', () => {
    expect(TUTORIAL_STEPS).toEqual(['plant', 'water', 'bars', 'minigames']);
    expect(nextTutorialStep('plant')).toBe('water');
    expect(nextTutorialStep('water')).toBe('bars');
    expect(nextTutorialStep('bars')).toBe('minigames');
    expect(nextTutorialStep('minigames')).toBeNull();
  });

  it('Gießen schließt nur den Gieß-Schritt ab', () => {
    expect(careCompletesStep('water', 'water')).toBe(true);
    expect(careCompletesStep('water', 'pet')).toBe(false);
    expect(careCompletesStep('bars', 'water')).toBe(false);
  });

  it('pflanzt eine Sorte, die von Anfang an frei ist', () => {
    expect(STRAINS[tutorialStrainId()].unlock.type).toBe('start');
  });
});
