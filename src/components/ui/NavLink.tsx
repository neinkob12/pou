import { useRouter, type Href } from 'expo-router';
import { Animated, Pressable } from 'react-native';

import { screenUi } from '../../content/strings';
import { depth, gameRadii, insets, outline, spacing, tones } from '../../lib/theme';
import { GameText } from './GameText';
import { gradientStyle, toneGradient } from './game/gradient';
import { usePressSpring } from './game/usePressSpring';

interface NavLinkProps {
  href: Href;
  label: string;
}

/** Listen-Link als 3D-Zeile mit Pfeil (ART-1), etwa in den Einstellungen. Federt beim Tippen. */
export function NavLink({ href, label }: NavLinkProps) {
  const router = useRouter();
  const press = usePressSpring({ sink: depth.sm });
  return (
    <Animated.View style={press.outerStyle}>
      <Pressable
        accessibilityRole="link"
        accessibilityLabel={label}
        onPress={() => router.push(href)}
        onPressIn={press.onPressIn}
        onPressOut={press.onPressOut}
        style={[
          gradientStyle(toneGradient(tones.cream), tones.cream.base),
          {
            minHeight: 52,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: spacing.md,
            borderRadius: gameRadii.button,
            borderWidth: outline.thin,
            borderBottomWidth: outline.thin + depth.sm,
            borderColor: outline.color,
            boxShadow: insets.highlight,
          },
        ]}
      >
        <GameText variant="bodyBold">{label}</GameText>
        <GameText variant="title" color={tones.coral.edge}>
          {screenUi.chevron}
        </GameText>
      </Pressable>
    </Animated.View>
  );
}
