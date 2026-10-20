import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

interface SettingsSectionProps {
  title: string;
  children: ReactNode;
}

/** Rahmen für einen Abschnitt der Einstellungen. */
export function SettingsSection({ title, children }: SettingsSectionProps) {
  return (
    <View className="gap-2 rounded-2xl bg-white p-4">
      <Text className="font-heading text-xl text-ink">{title}</Text>
      {children}
    </View>
  );
}
