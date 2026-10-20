import { HIDDEN_TAB_OPTIONS } from '../hiddenTab';

describe('lib/hiddenTab', () => {
  it('versteckt nur den Tab-Knopf, nicht die Route (sonst Umleitung auf den Start-Tab)', () => {
    expect(HIDDEN_TAB_OPTIONS).not.toHaveProperty('href');
    expect(HIDDEN_TAB_OPTIONS).not.toHaveProperty('hidden');
    expect(HIDDEN_TAB_OPTIONS.tabBarButton()).toBeNull();
    expect(HIDDEN_TAB_OPTIONS.tabBarItemStyle.display).toBe('none');
    expect(HIDDEN_TAB_OPTIONS.tabBarStyle.display).toBe('none');
  });
});
