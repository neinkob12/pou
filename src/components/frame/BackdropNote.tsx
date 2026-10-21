import { Text, View } from 'react-native';

import { colors, fonts, radii, spacing } from '../../lib/theme';

/** Kurzer Hinweis direkt auf dem Spiel-Hintergrund (ART-5): helle Pille, damit er auf jedem Verlauf lesbar ist. */
export function BackdropNote({ text }: { text: string }) {
  return (
    <View
      style={{
        alignSelf: 'flex-start',
        borderRadius: radii.md,
        backgroundColor: 'rgba(255,255,255,0.78)',
        paddingHorizontal: spacing.sm + 2,
        paddingVertical: spacing.xs,
      }}
    >
      <Text style={{ fontFamily: fonts.body, fontSize: 14, color: colors.ink }}>{text}</Text>
    </View>
  );
}
