import type { ReactNode } from 'react';

import { common } from '../../content/strings';
import { Placeholder } from './Placeholder';
import { Screen } from './Screen';

interface ScreenPlaceholderProps {
  title: string;
  children?: ReactNode;
}

/** Leerer Screen mit Überschrift und Platzhalter, bis der zuständige Auftrag ihn füllt. */
export function ScreenPlaceholder({ title, children }: ScreenPlaceholderProps) {
  return (
    <Screen title={title}>
      <Placeholder label={`${title}: ${common.placeholder}`} />
      {children}
    </Screen>
  );
}
