// Spielschrift mit dicker dunkler Kontur (Auftrag 51): Countdown, Popups, Banner, Kombo, Sterne.
// React Native kennt keinen Text-Umriss, deshalb liegt der Text achtmal versetzt in Konturfarbe
// unter dem eigentlichen Text, dazu ein Schatten nach unten.

import { StyleSheet, Text, View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';

import { fonts } from '../../../lib/theme';
import { ink } from './art/palette';

const DIRS = [
  [-1, -1],
  [0, -1],
  [1, -1],
  [-1, 0],
  [1, 0],
  [-1, 1],
  [0, 1],
  [1, 1],
] as const;

interface StrokeTextProps {
  children: string;
  size: number;
  color: string;
  /** Konturbreite in Punkten, Standard ein Zehntel der Schriftgröße. */
  stroke?: number;
  strokeColor?: string;
  style?: StyleProp<ViewStyle>;
}

export function StrokeText({ children, size, color, stroke, strokeColor = ink.outline, style }: StrokeTextProps) {
  const w = stroke ?? Math.max(2, Math.round(size / 10));
  const text: TextStyle = { fontFamily: fonts.headingBold, fontSize: size, lineHeight: size * 1.15 };
  return (
    <View style={style} accessible accessibilityLabel={children}>
      {/* Schatten nach unten */}
      <Text style={[text, styles.layer, { color: strokeColor, opacity: 0.45, transform: [{ translateY: w * 1.6 }] }]}>
        {children}
      </Text>
      {DIRS.map(([dx, dy]) => (
        <Text
          key={`${dx},${dy}`}
          style={[text, styles.layer, { color: strokeColor, transform: [{ translateX: dx * w }, { translateY: dy * w }] }]}
        >
          {children}
        </Text>
      ))}
      <Text style={[text, { color }]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  layer: { position: 'absolute', left: 0, top: 0 },
});
