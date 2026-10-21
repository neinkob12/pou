import { memo, useCallback, useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import Animated, { FadeInDown, FadeOut } from 'react-native-reanimated';

import { care } from '../../content/strings';
import { useNeeds } from '../../hooks/useNeeds';
import { chrome, radii } from '../../lib/theme';
import { useCareControls } from './care/CareStage';
import { CARE_TOOLS, type CareTool as CareToolId } from './care/careLogic';
import { CareTool } from './care/CareTool';
import { hud } from './hud/hudStyle';

/** So lange steht der Bedien-Hinweis nach dem Öffnen des Zimmers, dann räumt er sich weg. */
const HINT_MS = 5000;

/**
 * Werkzeuge unter Budi (Redesign): Gießkanne und zwei Dünger auf einer hellen Glas-Leiste. Der
 * Bedien-Hinweis erscheint nur kurz; Hinweise zu Sonderfällen (Koma, keine Pflege) bleiben stehen.
 * memo: Das Dock rendert jede Sekunde neu (Ernte-Status), die Werkzeuge sollen das nicht.
 */
export const ActionTray = memo(function ActionTray() {
  const { phase, condition, canCare, care: doCare } = useNeeds();
  const { react } = useCareControls();
  const [introHint, setIntroHint] = useState(true);

  useEffect(() => {
    const id = setTimeout(() => setIntroHint(false), HINT_MS);
    return () => clearTimeout(id);
  }, []);

  const onDrop = useCallback(
    (tool: CareToolId) => {
      setIntroHint(false);
      const feedback = doCare(tool);
      if (feedback) react(tool, feedback);
    },
    [doCare, react],
  );

  let hint: string | null = introHint ? care.hint : null;
  if (phase === null) hint = care.hintNoPlant;
  else if (condition === 'coma') hint = care.hintComa;
  else if (!canCare) hint = care.hintRest;

  return (
    <View className="items-center">
      {hint ? (
        <Animated.View
          key={hint}
          entering={FadeInDown.springify().damping(14)}
          exiting={FadeOut.duration(200)}
          pointerEvents="none"
          style={{ position: 'absolute', bottom: '100%', marginBottom: 10, maxWidth: 300 }}
        >
          <View className="rounded-2xl px-3 py-1.5" style={{ backgroundColor: hud.hintBg }}>
            <Text className="text-center font-body-bold text-xs text-white">{hint}</Text>
          </View>
        </Animated.View>
      ) : null}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          gap: 18,
          paddingHorizontal: 16,
          paddingTop: 6,
          paddingBottom: 8,
          borderRadius: radii.lg + 6,
          backgroundColor: chrome.glass,
          borderWidth: 1,
          borderColor: chrome.glassLine,
          boxShadow: chrome.glassShadow,
        }}
      >
        {CARE_TOOLS.map((tool, i) => (
          <CareTool key={tool} tool={tool} index={i} disabled={!canCare} onDrop={() => onDrop(tool)} />
        ))}
      </View>
    </View>
  );
});
