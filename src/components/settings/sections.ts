// Liste der Einstellungs-Abschnitte in Anzeigereihenfolge.
// Büro-Regel: eigener Abschnitt als src/components/settings/<Bereich>Section.tsx, hier eine Zeile.

import type { ComponentType } from 'react';

import { AboutSection } from './AboutSection';
import { DebugSection } from './DebugSection';
import { DevLinksSection } from './DevLinksSection';
import { LegalSection } from './LegalSection';
import { NotificationsSection } from './NotificationsSection';

export const settingsSections: { key: string; Component: ComponentType }[] = [
  { key: 'notifications', Component: NotificationsSection },
  { key: 'about', Component: AboutSection },
  { key: 'legal', Component: LegalSection },
  { key: 'dev', Component: DevLinksSection },
  { key: 'debug', Component: DebugSection },
];
