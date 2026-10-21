import { Text, View } from 'react-native';

import { colors, radii, spacing, surface, type ColorName } from '../../lib/theme';

interface BadgeProps {
  label: string;
  color?: ColorName;
  /** Heller Text auf dunkler Fläche. */
  light?: boolean;
}

/** Kleine Plakette mit Kontur (WEB-5): Seltenheit, Stufe, "Neu", "Gekauft". */
export function Badge({ label, color = 'lamp', light = false }: BadgeProps) {
  return (
    <View
      style={{
        alignSelf: 'flex-start',
        backgroundColor: colors[color],
        borderRadius: radii.pill,
        borderWidth: surface.line,
        borderColor: colors.plantDark,
        paddingHorizontal: spacing.sm + 2,
        paddingVertical: 1,
      }}
    >
      <Text className={`font-body-bold text-xs ${light ? 'text-white' : 'text-ink'}`}>{label}</Text>
    </View>
  );
}
