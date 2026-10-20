import { useMemo } from 'react';

import { createDebugActions, type DebugActions } from './debugActions';

export function useDebugActions(): DebugActions {
  return useMemo(() => createDebugActions(), []);
}
