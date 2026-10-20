import { Image, Text, View, type ImageSourcePropType } from 'react-native';

import { colors, fonts, radii, type ColorName } from '../../lib/theme';
import { IconTile } from './IconTile';
import { Placeholder } from './Placeholder';

/** Unter dieser Breite passt der normale Platzhalter-Text nicht, dann nur ein Icon-Kürzel. */
const ICON_PLACEHOLDER_MAX = 48;

interface AssetImageProps {
  /** Eintrag aus src/lib/assets.ts. Fehlt er, erscheint ein Platzhalter. */
  source: ImageSourcePropType | undefined;
  label: string;
  color?: ColorName;
  size: number;
  height?: number;
  round?: boolean;
  /** Fehlt das Bild: Kachel mit Initialen statt Platzhalter-Text, für kleine Karten-Bilder (WEB-3). */
  tile?: boolean;
}

/** Bild aus assets.ts oder, solange die Datei fehlt, ein beschrifteter Platzhalter. */
export function AssetImage({ source, label, color = 'lavender', size, height = size, round, tile }: AssetImageProps) {
  if (source) {
    return <Image source={source} accessibilityLabel={label} style={{ width: size, height }} resizeMode="contain" />;
  }
  if (tile) return <IconTile label={label} color={color} size={size} height={height} round={round} />;
  if (size > ICON_PLACEHOLDER_MAX) {
    return <Placeholder label={label} color={color} width={size} height={height} round={round} />;
  }
  return (
    <View
      accessibilityLabel={label}
      style={{
        width: size,
        height,
        borderRadius: round ? radii.pill : radii.sm,
        backgroundColor: colors[color],
        borderWidth: 1,
        borderColor: colors.ink,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ fontFamily: fonts.bodyBold, fontSize: size * 0.35, color: colors.ink }}>{label.slice(0, 3)}</Text>
    </View>
  );
}
