import { toSaveData, useGameStore } from '../../../../store/gameStore';

describe('Budi-Jump-Slice', () => {
  it('startet mit Neigen, merkt sich Tippen und speichert es', () => {
    expect(useGameStore.getState().jumpControl).toBe('tilt');
    useGameStore.getState().setJumpControl('tap');
    expect(useGameStore.getState().jumpControl).toBe('tap');
    expect(toSaveData(useGameStore.getState()).jumpControl).toBe('tap');
  });
});
