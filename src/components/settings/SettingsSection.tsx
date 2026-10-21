import type { ReactNode } from 'react';
import { Text } from 'react-native';

import { Card } from '../ui/Card';

interface SettingsSectionProps {
  title: string;
  children: ReactNode;
}

/** Rahmen für einen Abschnitt der Einstellungen: Karte mit Kontur wie alle Screens (WEB-5). */
export function SettingsSection({ title, children }: SettingsSectionProps) {
  return (
    <Card>
      <Text className="font-heading text-xl text-ink">{title}</Text>
      {children}
    </Card>
  );
}
