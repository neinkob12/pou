import type { ReactNode } from 'react';
import { View } from 'react-native';

import { chrome, gameRadii, insets, outline, shadows, spacing, tones, type ToneName } from '../../lib/theme';
import { GameText } from './GameText';
import { gradientStyle, toneGradient } from './game/gradient';
import { needsTextShadow } from './buttonLook';

interface ChipProps {
  /** Icon links, ragt etwas über den Rand der Pille hinaus. */
  icon?: ReactNode;
  value: ReactNode;
  tone?: ToneName;
  accessibilityLabel?: string;
}

/**
 * Zähler-Pille im Spiel-Look (ART-1): Münzen, Leben, Punkte. Zahl in Spielschrift. Creme ist seit dem
 * Redesign eine helle Glas-Pille wie das Zimmer-HUD (Anzeige, kein Knopf: keine dicke Kontur).
 */
export function Chip({ icon, value, tone = 'cream', accessibilityLabel }: ChipProps) {
  const t = tones[tone];
  const glass = tone === 'cream';
  return (
    <View
      accessibilityLabel={accessibilityLabel}
      style={[
        glass ? { backgroundColor: chrome.glass } : gradientStyle(toneGradient(t), t.base),
        {
          minHeight: 40,
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.xs + 2,
          paddingLeft: icon ? spacing.xs : spacing.md,
          paddingRight: spacing.md,
          borderRadius: gameRadii.pill,
          borderWidth: glass ? 1 : outline.thin,
          borderColor: glass ? chrome.glassLine : outline.color,
          boxShadow: glass ? chrome.glassShadow : `${shadows.button}, ${insets.highlight}`,
        },
      ]}
    >
      {icon}
      <GameText variant="number" color={t.text} shadow={needsTextShadow(t)}>
        {value}
      </GameText>
    </View>
  );
}
