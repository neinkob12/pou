import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { View } from 'react-native';
import { useAnimatedRef, useSharedValue, type AnimatedRef, type SharedValue } from 'react-native-reanimated';

import type { CareActionId } from '../../../game/events';
import { playCareCue } from '../../../lib/audio';
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

/** Was Werkzeuge und Fach brauchen: ändert sich nie, damit sie bei Budis Reaktionen nicht neu rendern. */
type CareControls = Omit<CareStageValue, 'reaction'>;

const CareControlsContext = createContext<CareControls | null>(null);
const CareReactionContext = createContext<CareReaction | null>(null);

/** Verbindet Werkzeug-Fach und Budi: Ziel, Schwebe-Zustand, letzte Reaktion. */
export function CareStageProvider({ children }: { children: ReactNode }) {
  const targetRef = useAnimatedRef<View>();
  const hovering = useSharedValue(0);
  const [reaction, setReaction] = useState<CareReaction | null>(null);
  const react = useCallback((type: CareActionId, feedback: CareFeedback) => {
    setReaction((prev) => ({ type, feedback, id: (prev?.id ?? 0) + 1 }));
    playCareCue(type, feedback);
  }, []);
  // Gestörte Dunkelphase: Budi zeigt Stress wie nach falscher Pflege (Kopfschütteln, beleidigt).
  const onDisturbed = useCallback(() => react('pet', 'warning'), [react]);
  useLightDisturbStress(onDisturbed);
  const controls = useMemo(() => ({ targetRef, hovering, react }), [targetRef, hovering, react]);
  return (
    <CareControlsContext.Provider value={controls}>
      <CareReactionContext.Provider value={reaction}>{children}</CareReactionContext.Provider>
    </CareControlsContext.Provider>
  );
}

/** Ziel, Schwebe-Zustand und react(), ohne die letzte Reaktion (für Werkzeuge und Fach). */
export function useCareControls(): CareControls {
  const value = useContext(CareControlsContext);
  if (!value) throw new Error('useCareControls braucht CareStageProvider (RoomScreen).');
  return value;
}

/** Alles, auch die letzte Reaktion (für Budi). */
export function useCareStage(): CareStageValue {
  const controls = useCareControls();
  const reaction = useContext(CareReactionContext);
  return { ...controls, reaction };
}
