import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

import { colors, outline, spacing, typography } from '../../lib/theme';
import { BackButton } from '../ui/BackButton';
import { BackdropNote } from './BackdropNote';

/** Tiefe des Titels: dunkle Kopie darunter, wie aufgeklebte Spielschrift. */
const TITLE_DEPTH = 3;
const TITLE_SIZE = 34;

interface GameTitleProps {
  title: string;
  subtitle?: string;
  back?: boolean;
  right?: ReactNode;
}

/**
 * Kopf der Screens im Spiele-Look (ART-5): großer weißer Titel mit dunkler Kante und Schatten,
 * Untertitel als helle Pille, damit er auf jedem Verlauf lesbar bleibt.
 */
export function GameTitle({ title, subtitle, back = false, right }: GameTitleProps) {
  return (
    <View style={{ gap: spacing.xs }}>
      {back ? (
        <View style={{ paddingBottom: spacing.xs }}>
          <BackButton />
        </View>
      ) : null}
      <View
        style={{ minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}
      >
        <Text
          accessibilityRole="header"
          style={{
            flex: 1,
            ...typography.display,
            fontSize: TITLE_SIZE,
            lineHeight: TITLE_SIZE + 6,
            color: colors.white,
            textShadowColor: outline.color,
            textShadowOffset: { width: 0, height: TITLE_DEPTH },
            textShadowRadius: 0.1,
          }}
        >
          {title}
        </Text>
        {right}
      </View>
      {subtitle ? <BackdropNote text={subtitle} /> : null}
    </View>
  );
}
