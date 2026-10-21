import type { ReactNode } from 'react';
import { Modal as RNModal, Pressable, Text } from 'react-native';

import { modal } from '../../content/strings';
import { Button } from './Button';
import { popupCardStyle } from './popupCard';

interface ModalProps {
  visible: boolean;
  title: string;
  onClose: () => void;
  children?: ReactNode;
}

/** Einfaches Popup mit Überschrift, Inhalt und Schließen-Button. Tippen daneben schließt auch. */
export function Modal({ visible, title, onClose, children }: ModalProps) {
  return (
    <RNModal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable accessibilityRole="button" onPress={onClose} className="flex-1 items-center justify-center bg-ink/50 p-6">
        <Pressable className="w-full max-w-md gap-4 rounded-3xl bg-cream p-6" style={popupCardStyle}>
          <Text className="font-heading text-2xl text-ink">{title}</Text>
          {children}
          <Button label={modal.close} variant="secondary" onPress={onClose} />
        </Pressable>
      </Pressable>
    </RNModal>
  );
}
