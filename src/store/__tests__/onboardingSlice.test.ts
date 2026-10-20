import { storage } from '../../lib/storage';
import { toSaveData, useGameStore } from '../gameStore';

const initial = useGameStore.getState();

beforeEach(() => {
  storage.clearAll();
  useGameStore.setState(initial, true);
});

describe('Onboarding-Slice', () => {
  it('startet ohne Bestätigung und ohne Tutorial', () => {
    const s = useGameStore.getState();
    expect(s.ageConfirmed).toBe(false);
    expect(s.tutorialDone).toBe(false);
    expect(s.consentStepDone).toBe(false);
  });

  it('setzt die Schritte einzeln', () => {
    useGameStore.getState().confirmAge();
    expect(useGameStore.getState().ageConfirmed).toBe(true);
    expect(useGameStore.getState().tutorialDone).toBe(false);
    useGameStore.getState().finishTutorial();
    useGameStore.getState().finishConsentStep();
    expect(useGameStore.getState().tutorialDone).toBe(true);
    expect(useGameStore.getState().consentStepDone).toBe(true);
  });

  it('landet im Spielstand', () => {
    useGameStore.getState().confirmAge();
    const save = toSaveData(useGameStore.getState());
    expect(save.ageConfirmed).toBe(true);
    expect(save.tutorialDone).toBe(false);
  });
});
