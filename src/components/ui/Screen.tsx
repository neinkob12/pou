import type { ReactNode } from 'react';
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { surface } from '../../lib/theme';
import { ScreenTitle } from './ScreenTitle';

interface ScreenProps {
  title: string;
  subtitle?: string;
  /** Zurück-Knopf links neben dem Titel (Screens ohne eigenen Tab). */
  back?: boolean;
  /** Rechts im Kopf, etwa der Münzzähler. */
  right?: ReactNode;
  children: ReactNode;
}

/**
 * Gemeinsamer Rahmen aller Screens außerhalb des Zimmers (WEB-5): cremefarbener Grund, Kopf mit
 * Titel, darunter scrollbare Karten in festen Abständen.
 */
export function Screen({ title, subtitle, back = false, right, children }: ScreenProps) {
  return (
    <SafeAreaView className="flex-1 bg-cream" edges={['top']}>
      <ScrollView
        contentContainerStyle={{
          padding: surface.screenPadding,
          paddingBottom: surface.screenPadding * 2,
          gap: surface.gap,
        }}
      >
        <ScreenTitle title={title} subtitle={subtitle} back={back} right={right} />
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}
