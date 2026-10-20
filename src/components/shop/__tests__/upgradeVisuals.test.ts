import { UPGRADE_IDS } from '../../../game/config';
import { maxLevel } from '../../../game/shop';
import { upgradeAssetId } from '../upgradeVisuals';

describe('upgradeAssetId', () => {
  it('zeigt je Topf-Stufe ein eigenes Bild, Stufe 0 als Vorschau der ersten', () => {
    expect(upgradeAssetId('pot', 0)).toBe('u1_pot_1');
    expect(upgradeAssetId('pot', 2)).toBe('u1_pot_2');
    expect(upgradeAssetId('pot', maxLevel('pot'))).toBe('u1_pot_3');
    expect(upgradeAssetId('pot', 99)).toBe('u1_pot_3');
  });

  it('hat für jedes Upgrade ein Bild', () => {
    for (const id of UPGRADE_IDS) expect(upgradeAssetId(id, 1)).toBeTruthy();
  });
});
