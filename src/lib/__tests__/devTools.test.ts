import { Platform } from 'react-native';

import { devToolsEnabled } from '../devTools';

declare const global: { __DEV__: boolean };

describe('lib/devTools', () => {
  const original = { dev: global.__DEV__, os: Platform.OS };
  afterEach(() => {
    global.__DEV__ = original.dev;
    Platform.OS = original.os;
  });

  it('nativ nur im Entwicklungs-Build', () => {
    Platform.OS = 'android';
    global.__DEV__ = false;
    expect(devToolsEnabled()).toBe(false);
    global.__DEV__ = true;
    expect(devToolsEnabled()).toBe(true);
  });

  it('im Web-Testbau immer', () => {
    Platform.OS = 'web';
    global.__DEV__ = false;
    expect(devToolsEnabled()).toBe(true);
  });
});
