import { useState, type ComponentType } from 'react';
import { Pressable, Text, View } from 'react-native';

export interface AlbumTab {
  key: string;
  label: string;
  Component: ComponentType;
}

/** Einfache Umschaltung zwischen den Album-Tabs. */
export function AlbumTabs({ tabs }: { tabs: AlbumTab[] }) {
  const [activeKey, setActiveKey] = useState(tabs[0]?.key);
  const active = tabs.find((t) => t.key === activeKey) ?? tabs[0];

  return (
    <View className="gap-4">
      <View className="flex-row gap-2">
        {tabs.map((tab) => {
          const selected = tab.key === active?.key;
          return (
            <Pressable
              key={tab.key}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              onPress={() => setActiveKey(tab.key)}
              className={`flex-1 items-center rounded-full py-2 ${selected ? 'bg-plantDark' : 'bg-white'}`}
            >
              <Text className={`font-body-bold text-base ${selected ? 'text-white' : 'text-ink'}`}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {active ? <active.Component /> : null}
    </View>
  );
}
