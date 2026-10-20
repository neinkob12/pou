import { Redirect } from 'expo-router';

import { DebugMenu } from '../src/components/debug/DebugMenu';

export default function DebugRoute() {
  // Im Release-Build führt auch ein direkter Link nur zurück ins Zimmer.
  if (!__DEV__) return <Redirect href="/" />;
  return <DebugMenu />;
}
