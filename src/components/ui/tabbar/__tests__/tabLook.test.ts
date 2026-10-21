import { TAB_LOOK, tabIconPose } from '../tabLook';

describe('tabLook', () => {
  it('aktives Icon hebt sich und wird größer, inaktives sitzt tiefer und kleiner', () => {
    const idle = tabIconPose(0);
    const active = tabIconPose(1);
    expect(active.translateY).toBeLessThan(idle.translateY);
    expect(active.scale).toBeGreaterThan(idle.scale);
  });

  it('bleibt beim Überschwingen der Feder in den Grenzen', () => {
    expect(tabIconPose(1.2)).toEqual(tabIconPose(1));
    expect(tabIconPose(-0.2)).toEqual(tabIconPose(0));
  });

  it('kennt genau die fünf sichtbaren Tabs', () => {
    expect(Object.keys(TAB_LOOK)).toEqual(['index', 'minigames', 'shop', 'album', 'settings']);
  });
});
