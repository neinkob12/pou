import type { ReactNode } from 'react';
import { View } from 'react-native';

interface OverlayProps {
  children: ReactNode;
  /** Abgedunkelter Hintergrund mit Karte (Pause, Spielende) oder nur zentriert (Countdown). */
  card?: boolean;
}

/** Liegt über dem Spielfeld und fängt alle Berührungen ab. */
export function Overlay({ children, card = true }: OverlayProps) {
  return (
    <View className={`absolute inset-0 items-center justify-center p-6 ${card ? 'bg-ink/40' : ''}`}>
      {card ? <View className="w-full max-w-sm gap-3 rounded-3xl bg-cream p-6">{children}</View> : children}
    </View>
  );
}
