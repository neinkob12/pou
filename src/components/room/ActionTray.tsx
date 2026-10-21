import { useCallback } from 'react';
import { Text, View } from 'react-native';

import { care } from '../../content/strings';
import { useNeeds } from '../../hooks/useNeeds';
import { useCareControls } from './care/CareStage';
import { CARE_TOOLS, type CareTool as CareToolId } from './care/careLogic';
import { CareTool } from './care/CareTool';
import { HudPanel } from './hud/HudPanel';
import { hud } from './hud/hudStyle';

/** Holzfach unter Budi (Look ART-4): Gießkanne und zwei Dünger zum Ziehen, darunter ein Hinweis. */
export function ActionTray() {
  const { phase, condition, canCare, care: doCare } = useNeeds();
  const { react } = useCareControls();

  const onDrop = useCallback(
    (tool: CareToolId) => {
      const feedback = doCare(tool);
      if (feedback) react(tool, feedback);
    },
    [doCare, react],
  );

  let hint = care.hint;
  if (phase === null) hint = care.hintNoPlant;
  else if (condition === 'coma') hint = care.hintComa;
  else if (!canCare) hint = care.hintRest;

  return (
    <View className="items-center gap-2 px-4">
      <HudPanel tone={hud.tray} innerStyle={{ flexDirection: 'row', justifyContent: 'center', gap: 22, paddingHorizontal: 18, paddingTop: 8, paddingBottom: 6 }}>
        {CARE_TOOLS.map((tool, i) => (
          <CareTool key={tool} tool={tool} index={i} disabled={!canCare} onDrop={() => onDrop(tool)} />
        ))}
      </HudPanel>
      <View className="rounded-full px-3 py-1" style={{ backgroundColor: hud.hintBg }}>
        <Text className="text-center font-body-bold text-xs text-white">{hint}</Text>
      </View>
    </View>
  );
}
