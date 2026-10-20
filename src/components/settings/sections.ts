// Liste der Einstellungs-Abschnitte in Anzeigereihenfolge.
// Büro-Regel: eigener Abschnitt als src/components/settings/<Bereich>Section.tsx, hier eine Zeile.

import type { ComponentType } from 'react';

import { AboutSection } from './AboutSection';
import { DevLinksSection } from './DevLinksSection';

export const settingsSections: { key: string; Component: ComponentType }[] = [
  { key: 'about', Component: AboutSection },
  { key: 'dev', Component: DevLinksSection },
];
