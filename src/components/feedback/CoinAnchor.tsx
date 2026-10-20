import { useCallback, useRef, type ReactNode } from 'react';
import { View, type HostInstance } from 'react-native';

import { centerOf, setCoinAnchor } from './coinTarget';

/** Hülle um den Münzzähler (WEB-3): misst nach jedem Layout seine Mitte, als Ziel für fliegende Münzen. */
export function CoinAnchor({ children }: { children: ReactNode }) {
  const ref = useRef<HostInstance>(null);
  const onLayout = useCallback(() => {
    ref.current?.measureInWindow((x, y, w, h) => setCoinAnchor(centerOf(x, y, w, h)));
  }, []);
  return (
    <View ref={ref} onLayout={onLayout}>
      {children}
    </View>
  );
}
