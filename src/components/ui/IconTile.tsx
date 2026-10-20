import { Text, View } from 'react-native';

import { colors, fonts, radii, type ColorName } from '../../lib/theme';

/** Initialen aus den ersten zwei Wörtern, etwa "Größerer Topf" zu "GT". */
export function initials(label: string): string {
  return label
    .split(/[\s-]+/)
    .filter((w) => w.length > 0 && w[0] === w[0].toUpperCase())
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .slice(0, 2) || label.slice(0, 2);
}

interface IconTileProps {
  label: string;
  color: ColorName;
  size: number;
  height?: number;
  round?: boolean;
}

/**
 * Platzhalter-Kachel für fehlende Bilder in Karten (WEB-3): farbige Fläche mit gestricheltem Rand und
 * großen Initialen. Lesbar auch bei 72 px, wo der volle Platzhalter-Text nicht mehr passt.
 */
export function IconTile({ label, color, size, height = size, round }: IconTileProps) {
  const dark = color === 'night' || color === 'plantDark' || color === 'ink' || color === 'inkMuted';
  return (
    <View
      accessibilityLabel={label}
      style={{
        width: size,
        height,
        borderRadius: round ? radii.pill : radii.md,
        backgroundColor: colors[color],
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: colors.ink,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ fontFamily: fonts.headingBold, fontSize: size * 0.38, color: dark ? colors.white : colors.ink }}>
        {initials(label)}
      </Text>
    </View>
  );
}
