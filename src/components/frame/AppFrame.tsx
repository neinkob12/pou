import type { ReactNode } from 'react';

/** Nativ füllt das Spiel immer den ganzen Bildschirm. Den Rahmen gibt es nur im Web (AppFrame.web.tsx). */
export function AppFrame({ children }: { children: ReactNode }) {
  return children;
}
