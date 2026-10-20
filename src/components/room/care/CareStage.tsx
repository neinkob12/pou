import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { View } from 'react-native';
import { useAnimatedRef, useSharedValue, type AnimatedRef, type SharedValue } from 'react-native-reanimated';

import type { CareActionId } from '../../../game/events';
import type { CareFeedback } from './careLogic';
import { useLightDisturbStress } from './useLightDisturbStress';

/** Letzte Pflege, auf die Budi reagiert. `id` zählt hoch, damit gleiche Aktionen neu abspielen. */
export interface CareReaction {
  type: CareActionId;
  feedback: CareFeedback;
  id: number;
}

interface CareStageValue {
  /** Budis Ansicht: Ziel der Ziehgesten (gemessen im UI-Thread). */
  targetRef: AnimatedRef<View>;
  /** 1, solange ein Werkzeug über Budi gehalten wird. */
  hovering: SharedValue<number>;
  reaction: CareReaction | null;
  react: (type: CareActionId, feedback: CareFeedback) => void;
}

const CareStageContext = createContext<CareStageValue | null>(null);

/** Verbindet Werkzeug-Fach und Budi: Ziel, Schwebe-Zustand, letzte Reaktion. */
export function CareStageProvider({ children }: { children: ReactNode }) {
  const targetRef = useAnimatedRef<View>();
  const hovering = useSharedValue(0);
  const [reaction, setReaction] = useState<CareReaction | null>(null);
  const react = useCallback((type: CareActionId, feedback: CareFeedback) => {
    setReaction((prev) => ({ type, feedback, id: (prev?.id ?? 0) + 1 }));
  }, []);
  // Gestörte Dunkelphase: Budi zeigt Stress wie nach falscher Pflege (Kopfschütteln, beleidigt).
  const onDisturbed = useCallback(() => react('pet', 'warning'), [react]);
  useLightDisturbStress(onDisturbed);
  const value = useMemo(() => ({ targetRef, hovering, reaction, react }), [targetRef, hovering, reaction, react]);
  return <CareStageContext.Provider value={value}>{children}</CareStageContext.Provider>;
}

export function useCareStage(): CareStageValue {
  const value = useContext(CareStageContext);
  if (!value) throw new Error('useCareStage braucht CareStageProvider (RoomScreen).');
  return value;
}
