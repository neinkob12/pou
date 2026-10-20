// Onboarding-Slice (Auftrag P26): Altersbestätigung, Tutorial und Consent-Schritt beim Erststart.
// Wird wie jeder Slice automatisch gespeichert. Ein "Nein" bei der Altersfrage wird nicht
// gespeichert: Beim nächsten Start fragt die App erneut.

import type { SliceCreator } from './types';

export interface OnboardingSlice {
  /** Spieler hat bestätigt, dass er mindestens 18 ist. */
  ageConfirmed: boolean;
  /** Tutorial fertig oder übersprungen. */
  tutorialDone: boolean;
  /** Consent-Schritt nach dem Tutorial ist gelaufen (P29 füllt den Dialog). */
  consentStepDone: boolean;
  confirmAge: () => void;
  finishTutorial: () => void;
  finishConsentStep: () => void;
}

export const createOnboardingSlice: SliceCreator<OnboardingSlice> = (set) => ({
  ageConfirmed: false,
  tutorialDone: false,
  consentStepDone: false,
  confirmAge: () => set({ ageConfirmed: true }),
  finishTutorial: () => set({ tutorialDone: true }),
  finishConsentStep: () => set({ consentStepDone: true }),
});
