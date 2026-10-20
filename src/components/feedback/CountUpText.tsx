import { Text } from 'react-native';

import { useCountUp } from './useCountUp';

interface CountUpTextProps {
  value: number;
  format: (n: number) => string;
  delayMs?: number;
  className?: string;
  onDone?: () => void;
}

/** Text mit hochzählender Zahl (WEB-3), etwa "56 Münzen". */
export function CountUpText({ value, format, delayMs = 0, className, onDone }: CountUpTextProps) {
  const shown = useCountUp(value, delayMs, onDone);
  return (
    <Text accessibilityLabel={format(value)} className={className}>
      {format(shown)}
    </Text>
  );
}
