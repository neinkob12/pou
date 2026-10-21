import type { ReactNode } from 'react';
import { Text, type StyleProp, type TextStyle } from 'react-native';

import { colors, textShadow, typography, type TypeStyle } from '../../lib/theme';

interface GameTextProps {
  children: ReactNode;
  variant?: TypeStyle;
  color?: string;
  /** Dunkler Schatten unter heller Schrift (Titel, Zahlen auf Farbe). */
  shadow?: boolean;
  align?: TextStyle['textAlign'];
  numberOfLines?: number;
  style?: StyleProp<TextStyle>;
  accessibilityRole?: 'header' | 'text';
}

/** Schrift im Spiel-Look (ART-1): Fredoka Bold für Titel und Zahlen, Nunito für Text. */
export function GameText({
  children,
  variant = 'body',
  color = colors.ink,
  shadow = false,
  align,
  numberOfLines,
  style,
  accessibilityRole,
}: GameTextProps) {
  return (
    <Text
      accessibilityRole={accessibilityRole}
      numberOfLines={numberOfLines}
      style={[
        typography[variant],
        { color, textAlign: align },
        shadow
          ? { textShadowColor: textShadow.color, textShadowOffset: textShadow.offset, textShadowRadius: textShadow.radius }
          : null,
        style,
      ]}
    >
      {children}
    </Text>
  );
}
