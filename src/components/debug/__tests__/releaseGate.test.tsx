import { Redirect } from 'expo-router';
import type { ReactElement } from 'react';

import DebugRoute from '../../../../app/debug';
import { DebugSection } from '../../settings/DebugSection';
import { DebugMenu } from '../DebugMenu';

declare const global: { __DEV__: boolean };

describe('Debug-Menü im Release-Build', () => {
  const original = global.__DEV__;
  afterEach(() => {
    global.__DEV__ = original;
  });

  it('zeigt mit __DEV__ = false keinen Einstieg in den Einstellungen', () => {
    global.__DEV__ = false;
    expect(DebugSection()).toBeNull();
  });

  it('leitet mit __DEV__ = false die Route ins Zimmer um', () => {
    global.__DEV__ = false;
    const element = DebugRoute() as ReactElement<{ href: string }>;
    expect(element.type).toBe(Redirect);
    expect(element.props.href).toBe('/');
  });

  it('zeigt im Entwicklungs-Build Einstieg und Menü', () => {
    global.__DEV__ = true;
    expect(DebugSection()).not.toBeNull();
    expect((DebugRoute() as ReactElement).type).toBe(DebugMenu);
  });
});
