import type { ReactNode } from 'react';
import { View } from 'react-native';

import { spacing } from '../../../lib/theme';
import { Card } from '../Card';
import { SectionTitle } from '../SectionTitle';

/** Abschnitt der Galerie: Überschrift und eine Karte mit Beispielen. */
export function GallerySection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={{ gap: spacing.sm }}>
      <SectionTitle title={title} />
      <Card>{children}</Card>
    </View>
  );
}

/** Beispiele nebeneinander, brechen auf schmalen Screens um. */
export function Row({ children }: { children: ReactNode }) {
  return <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.sm + 2 }}>{children}</View>;
}
