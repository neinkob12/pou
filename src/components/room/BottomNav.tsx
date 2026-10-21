import { Link, type Href } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ui, type UiAssetId } from '../../lib/assets';
import type { GameIconId } from '../ui/icons/iconArt';
import { room } from '../../content/strings';
import { depth, gameRadii, outline, shadows, spacing, tones } from '../../lib/theme';
import { AssetImage } from '../ui/AssetImage';
import { GlossFill } from '../ui/game/GlossFill';
import { usePressSpring } from '../ui/game/usePressSpring';
import { NAV_TONES } from './hud/hudStyle';

const ICON_SIZE = 34;
const TILE = 54;

type NavId = keyof typeof room.nav;

const NAV: readonly { id: NavId; href: Href; icon: UiAssetId; art: GameIconId }[] = [
  { id: 'minigames', href: '/minigames', icon: 'u12_minigames', art: 'minigames' },
  { id: 'shop', href: '/shop', icon: 'u12_shop', art: 'shop' },
  { id: 'album', href: '/album', icon: 'u12_album', art: 'album' },
  { id: 'settings', href: '/settings', icon: 'u12_settings', art: 'settings' },
];

/** Eine Kachel: 3D-Knopf mit eigener Farbe, sinkt beim Tippen ein und federt zurück (ART-4). */
function NavTile({ item }: { item: (typeof NAV)[number] }) {
  const tone = NAV_TONES[item.id];
  const press = usePressSpring({ sink: depth.md });
  const radius = gameRadii.button;
  return (
    <Link href={item.href} asChild>
      <Pressable
        accessibilityRole="link"
        accessibilityLabel={room.nav[item.id]}
        onPressIn={press.onPressIn}
        onPressOut={press.onPressOut}
        className="min-w-16 items-center gap-1"
      >
        <Animated.View style={[{ borderRadius: radius, boxShadow: shadows.button }, press.outerStyle]}>
          <View
            style={{
              width: TILE,
              height: TILE + depth.md,
              borderRadius: radius,
              borderWidth: outline.regular,
              borderColor: outline.color,
              backgroundColor: tone.edge,
              paddingBottom: depth.md,
            }}
          >
            <Animated.View style={[{ flex: 1, borderRadius: radius, alignItems: 'center', justifyContent: 'center' }, press.faceStyle]}>
              <GlossFill tone={tone} radius={radius - outline.regular} />
              <AssetImage source={ui[item.icon]} label={room.nav[item.id]} color="coral" size={ICON_SIZE} round icon={item.art} />
            </Animated.View>
          </View>
        </Animated.View>
        <Text className="font-heading text-xs text-ink">{room.nav[item.id]}</Text>
      </Pressable>
    </Link>
  );
}

/** Untere Navigation im Raum: Leiste mit Kontur und vier bunten 3D-Kacheln. */
export function BottomNav() {
  const insets = useSafeAreaInsets();
  return (
    <View
      className="flex-row justify-around rounded-t-[28px] pt-2.5"
      style={{
        paddingBottom: insets.bottom + spacing.sm,
        borderWidth: outline.regular,
        borderBottomWidth: 0,
        borderColor: outline.color,
        backgroundColor: tones.cream.base,
        boxShadow: shadows.card,
      }}
    >
      {NAV.map((item) => (
        <NavTile key={item.id} item={item} />
      ))}
    </View>
  );
}
