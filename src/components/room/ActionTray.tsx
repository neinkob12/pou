import { useCallback } from 'react';
import { Text, View } from 'react-native';

import { care } from '../../content/strings';
import { useNeeds } from '../../hooks/useNeeds';
import { useCareStage } from './care/CareStage';
import { CARE_TOOLS, type CareTool as CareToolId } from './care/careLogic';
import { CareTool } from './care/CareTool';

/** Fach unter Budi: Gießkanne und zwei Dünger zum Ziehen, darunter ein Hinweis. */
export function ActionTray() {
  const { phase, condition, canCare, care: doCare } = useNeeds();
  const { react } = useCareStage();

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
      <View className="flex-row justify-center gap-8 rounded-3xl bg-white/70 px-6 py-3">
        {CARE_TOOLS.map((tool) => (
          <CareTool key={tool} tool={tool} disabled={!canCare} onDrop={() => onDrop(tool)} />
        ))}
      </View>
      <Text className="text-center font-body text-xs text-inkMuted">{hint}</Text>
    </View>
  );
}
