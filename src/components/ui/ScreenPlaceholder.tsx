import type { ReactNode } from 'react';
import { ScrollView, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { common } from '../../content/strings';
import { Placeholder } from './Placeholder';

interface ScreenPlaceholderProps {
  title: string;
  children?: ReactNode;
}

/** Leerer Screen mit Überschrift und Platzhalter, bis der zuständige Auftrag ihn füllt. */
export function ScreenPlaceholder({ title, children }: ScreenPlaceholderProps) {
  return (
    <SafeAreaView className="flex-1 bg-cream" edges={['top']}>
      <ScrollView contentContainerClassName="gap-4 p-4">
        <Text className="font-heading text-3xl text-ink">{title}</Text>
        <Placeholder label={`${title}: ${common.placeholder}`} />
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}
