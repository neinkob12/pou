import { Link, type Href } from 'expo-router';
import { Pressable, Text } from 'react-native';

import { screenUi } from '../../content/strings';

interface NavLinkProps {
  href: Href;
  label: string;
}

/** Listen-Link als Zeile mit Pfeil (WEB-5), etwa in den Einstellungen. */
export function NavLink({ href, label }: NavLinkProps) {
  return (
    <Link href={href} asChild>
      <Pressable className="min-h-12 flex-row items-center justify-between rounded-2xl bg-cream px-4 py-3 active:opacity-70">
        <Text className="font-body-bold text-base text-ink">{label}</Text>
        <Text className="font-heading text-xl text-plantDark">{screenUi.chevron}</Text>
      </Pressable>
    </Link>
  );
}
