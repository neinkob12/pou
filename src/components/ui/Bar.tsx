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
export function Bar({ value, color, height = 12, accessibilityLabel }: BarProps) {
  const clamped = Math.min(1, Math.max(0, value));
  return (
    <View
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(clamped * 100) }}
      style={{
        height,
        borderRadius: radii.pill,
        backgroundColor: colors.cream,
        borderWidth: 1.5,
        borderColor: colors.plantDark,
        overflow: 'hidden',
      }}
    >
      <View style={{ width: `${clamped * 100}%`, height: '100%', backgroundColor: colors[color], borderRadius: radii.pill }}>
        <View style={{ marginTop: height * 0.15, marginHorizontal: height * 0.3, height: height * 0.25, borderRadius: radii.pill, backgroundColor: colors.white, opacity: 0.45 }} />
      </View>
    </View>
  );
}
