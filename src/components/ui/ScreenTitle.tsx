import type { ReactNode } from 'react';
import { View } from 'react-native';

import { colors, spacing, tones } from '../../lib/theme';
import { BackButton } from './BackButton';
import { GameText } from './GameText';

interface ScreenTitleProps {
  title: string;
  subtitle?: string;
  /** Zurück-Knopf über dem Titel (Screens ohne eigenen Tab). */
  back?: boolean;
  /** Rechts im Kopf, etwa der Münzzähler. */
  right?: ReactNode;
}

/** Kopf eines Screens im Spiel-Look (ART-1): großer Titel in Spielschrift, optional Zurück und rechts ein Zähler. */
export function ScreenTitle({ title, subtitle, back = false, right }: ScreenTitleProps) {
  return (
    <View style={{ gap: spacing.xs }}>
      {back ? (
        <View style={{ paddingBottom: spacing.xs }}>
          <BackButton />
        </View>
      ) : null}
      <View style={{ minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm + 4 }}>
        <GameText variant="title" color={tones.cream.text} accessibilityRole="header" style={{ flex: 1 }}>
          {title}
        </GameText>
        {right}
      </View>
      {subtitle ? <GameText color={colors.inkMuted}>{subtitle}</GameText> : null}
    </View>
  );
}
