import { Text, View, type DimensionValue } from 'react-native';

import { colors, fonts, fontSizes, radii, spacing, type ColorName } from '../../lib/theme';

interface PlaceholderProps {
  label: string;
  color?: ColorName;
  width?: DimensionValue;
  height?: DimensionValue;
  round?: boolean;
}

/** Klar erkennbarer Platzhalter für fehlende Grafiken: farbige Form mit Text. */
export function Placeholder({
  label,
  color = 'lavender',
  width = '100%',
  height = 120,
  round = false,
}: PlaceholderProps) {
  return (
    <View
      accessibilityLabel={label}
      style={{
        width,
        height,
        backgroundColor: colors[color],
        borderRadius: round ? radii.pill : radii.md,
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: colors.ink,
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.sm,
      }}
    >
      <Text
        style={{ fontFamily: fonts.bodyBold, fontSize: fontSizes.md, color: colors.ink, textAlign: 'center' }}
      >
        {label}
      </Text>
    </View>
  );
}
