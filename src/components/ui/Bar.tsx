import { View } from 'react-native';

import { colors, radii, type ColorName } from '../../lib/theme';

interface BarProps {
  /** 0 bis 1, wird auf diesen Bereich begrenzt. */
  value: number;
  color: ColorName;
  height?: number;
  accessibilityLabel?: string;
}

/** Fortschritts- oder Bedürfnisbalken. */
export function Bar({ value, color, height = 10, accessibilityLabel }: BarProps) {
  const clamped = Math.min(1, Math.max(0, value));
  return (
    <View
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(clamped * 100) }}
      style={{
        height,
        borderRadius: radii.pill,
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.plantDark,
        overflow: 'hidden',
      }}
    >
      <View style={{ width: `${clamped * 100}%`, height: '100%', backgroundColor: colors[color] }} />
    </View>
  );
}
