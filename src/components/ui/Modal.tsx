import type { ReactNode } from 'react';
import { Modal as RNModal, Pressable, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { modal } from '../../content/strings';
import { cardTones, overlay, spacing, tones } from '../../lib/theme';
import { Button } from './Button';
import { GameText } from './GameText';
import { gradientStyle, toneGradient } from './game/gradient';
import { PopIn } from './PopIn';
import { POPUP_MAX_WIDTH, popupCardStyle } from './popupCard';

interface ModalProps {
  visible: boolean;
  title: string;
  onClose: () => void;
  children?: ReactNode;
}

/**
 * Popup im Spiel-Look (ART-1): ploppt mit Federung auf, Titel auf einem Band in Koralle, darunter
 * Inhalt und Schließen-Knopf. Tippen daneben schließt auch.
 */
export function Modal({ visible, title, onClose, children }: ModalProps) {
  return (
    <RNModal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Animated.View entering={FadeIn.duration(160)} style={{ flex: 1, backgroundColor: overlay.backdrop }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={modal.close}
          onPress={onClose}
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg }}
        >
          <PopIn style={{ width: '100%', maxWidth: POPUP_MAX_WIDTH }}>
            <Pressable
              accessibilityViewIsModal
              style={[
                popupCardStyle,
                gradientStyle(`linear-gradient(180deg, ${cardTones.plain.top} 0%, ${cardTones.plain.bottom} 100%)`, cardTones.plain.bottom),
                { overflow: 'hidden' },
              ]}
            >
              <View style={[gradientStyle(toneGradient(tones.coral), tones.coral.base), { paddingVertical: spacing.sm + 2, paddingHorizontal: spacing.lg }]}>
                <GameText variant="heading" color={tones.coral.text} shadow align="center" accessibilityRole="header">
                  {title}
                </GameText>
              </View>
              <View style={{ gap: spacing.md, padding: spacing.lg }}>
                {children}
                <Button label={modal.close} variant="secondary" onPress={onClose} />
              </View>
            </Pressable>
          </PopIn>
        </Pressable>
      </Animated.View>
    </RNModal>
  );
}
