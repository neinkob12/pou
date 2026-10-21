import { View } from 'react-native';

import { colors, spacing, tones } from '../../lib/theme';
import { GameText } from './GameText';

interface SectionTitleProps {
  title: string;
  /** Rechts daneben, etwa "3 von 12". */
  meta?: string;
}

/** Zwischenüberschrift innerhalb eines Screens in Spielschrift (ART-1). */
export function SectionTitle({ title, meta }: SectionTitleProps) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: spacing.sm, paddingHorizontal: spacing.xs, paddingTop: spacing.xs }}>
      <GameText variant="heading" color={tones.cream.text}>
        {title}
      </GameText>
      {meta ? (
        <GameText variant="small" color={colors.inkMuted}>
          {meta}
        </GameText>
      ) : null}
    </View>
  );
}
