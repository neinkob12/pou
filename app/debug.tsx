import { Redirect } from 'expo-router';

import { DebugMenu } from '../src/components/debug/DebugMenu';
import { DEV_TOOLS } from '../src/lib/devTools';

export default function DebugRoute() {
  // Im Release-Build führt auch ein direkter Link nur zurück ins Zimmer.
  if (!DEV_TOOLS) return <Redirect href="/" />;
  return <DebugMenu />;
}
