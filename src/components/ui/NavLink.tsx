import { Link, type Href } from 'expo-router';
import { Pressable, Text } from 'react-native';

interface NavLinkProps {
  href: Href;
  label: string;
}

/** Einfacher Listen-Link für Platzhalter-Navigation. */
export function NavLink({ href, label }: NavLinkProps) {
  return (
    <Link href={href} asChild>
      <Pressable className="rounded-xl bg-white px-4 py-3 active:opacity-70">
        <Text className="font-body-bold text-base text-ink">{label}</Text>
      </Pressable>
    </Link>
  );
}
