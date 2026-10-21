import type { ReactNode } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { surface } from '../../lib/theme';
import { BackButton } from './BackButton';

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
        <View className="gap-1">
          {back ? (
            <View className="pb-1">
              <BackButton />
            </View>
          ) : null}
          <View className="min-h-11 flex-row items-center justify-between gap-3">
            <Text accessibilityRole="header" className="flex-1 font-heading text-3xl text-ink">
              {title}
            </Text>
            {right}
          </View>
          {subtitle ? <Text className="font-body text-base text-inkMuted">{subtitle}</Text> : null}
        </View>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}
