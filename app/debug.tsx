import { Redirect } from 'expo-router';

import { DebugMenu } from '../src/components/debug/DebugMenu';
import { devToolsEnabled } from '../src/lib/devTools';

export default function DebugRoute() {
  // Im Release-Build führt auch ein direkter Link nur zurück ins Zimmer.
  if (!devToolsEnabled()) return <Redirect href="/" />;
  return <DebugMenu />;
}
