# Tech Stack

## Frontend

- **React Native** mit **Expo** (TypeScript-Template von Anfang an)
- **Expo Router** für dateibasierte Navigation
- **NativeWind** (Tailwind für React Native) für normale UI-Screens (Shop, Album, Einstellungen)

## Spiel und Animation

- **@shopify/react-native-skia** für die Minigames (2D-Zeichnen mit 60 fps)
- **react-native-reanimated** und **react-native-gesture-handler** für Animationen und Wisch-Gesten (Gießen, Düngen)
- Budi im MVP als **PNG-Ebenen** (Topf, Pflanze je Phase, Gesicht, Accessoire), animiert mit Reanimated. **rive-react-native** erst als Upgrade nach dem Launch (siehe DESIGN_GUIDE.md, D6)
- **expo-haptics** für Vibration bei Aktionen
- **expo-av** (oder `expo-audio`, je nach Expo-Version) für Sounds und Musik

## State und Speicher

- **Zustand** für globalen Spielzustand
- **react-native-mmkv** für lokales Speichern (Spielstand, Einstellungen). Spielstand ist lokal, kein Login nötig.

## Benachrichtigungen

- **expo-notifications**, nur lokal geplante Benachrichtigungen ("Budi hat Durst")

## Monetarisierung

- **react-native-purchases** (RevenueCat) für Turbo-Kauf (9,99 €) und kosmetische Käufe
- **react-native-google-mobile-ads** für Rewarded Ads, inklusive Google UMP Consent (DSGVO)

## Backend (erst nach dem Launch, optional)

- **Supabase** für Cloud-Spielstand und Serverzeit-Check gegen Uhr-Tricks. Im MVP nicht einbauen.

## Tests

- **jest-expo** für Unit-Tests der Spiellogik in `src/game/`

## Build und Release

- **EAS Build** und **EAS Submit** (Expo Application Services)
- Ab Session mit nativen Modulen (Skia, Rive, MMKV, Ads): **Development Build** statt Expo Go (`npx expo run:ios` / `eas build --profile development`)

## Projektstruktur

```
app/                     # Expo Router, nur Komposition
  _layout.tsx
  index.tsx              # Hauptraum mit Budi
  shop.tsx
  album.tsx              # Fakten-Karten und Sorten
  minigames/
    index.tsx            # Auswahl
    smash.tsx
    drops.tsx
    jump.tsx
  settings.tsx
src/
  game/                  # reine Spiellogik, kein React
    config.ts            # ALLE Balancing-Werte
    timeEngine.ts        # Phasen aus Zeitstempeln
    needs.ts             # Balken-Logik
    harvest.ts           # Ertrag und Qualität
    __tests__/
  store/                 # Zustand-Stores
    gameStore.ts
  components/
    ui/                  # Buttons, Balken, Modals
    budi/                # Budi-Darstellung
    minigames/           # Skia-Komponenten
  hooks/
  lib/
    assets.ts            # zentrale Asset-Referenzen
    storage.ts           # MMKV
    notifications.ts
    purchases.ts
    ads.ts
assets/
  budi/                  # PNG-Ebenen (später .riv)
  images/
  minigames/
  sounds/
  icon/
docs/
  KONZEPT.md
  SESSIONS.md
  ASSETS.md
  DESIGN_GUIDE.md
  STORE_LAUNCH.md
  PROGRESS.md            # wird von Claude Code gepflegt
```

## Entwicklungs-Workflow

- `npx expo start`, testen auf dem eigenen Handy, nicht nur im Simulator
- Debug-Menü im Spiel mit Zeitraffer (`DEBUG_SPEED_MULTIPLIER` in `config.ts`), damit ein ganzer Zyklus in Minuten testbar ist
- Claude Code für Features und Änderungen über mehrere Dateien

## Setup-Befehle (Session 2 bzw. Auftrag P01)

Das Expo-Projekt liegt im Repo-Root, nicht in einem Unterordner. Also in einem Temp-Ordner erzeugen und die Dateien ins Root verschieben, ohne `CLAUDE.md`, `docs/`, `src/game/`, `scripts/` und `.github/` zu überschreiben.

```bash
npx create-expo-app potpou --template blank-typescript   # im Temp-Ordner, dann Inhalt ins Repo-Root verschieben
cd potpou

npx expo install expo-router react-native-safe-area-context react-native-screens expo-linking expo-constants expo-status-bar
npx expo install react-native-reanimated react-native-gesture-handler
npx expo install @shopify/react-native-skia
npx expo install expo-haptics expo-notifications
npm install zustand react-native-mmkv
npm install nativewind
npm install -D tailwindcss jest-expo jest @types/jest
npx expo install expo-sensors expo-font @expo-google-fonts/fredoka @expo-google-fonts/nunito
npm install -D eslint eslint-config-expo
```

Pflicht-Skripte in `package.json`: `typecheck` (`tsc --noEmit`), `lint` (`eslint .`), `test` (`jest`). `bash scripts/check.sh` ruft sie in dieser Reihenfolge auf und ist der einzige Prüfbefehl für Kollegen und CI.

RevenueCat und AdMob kommen erst in ihren eigenen Aufträgen dazu (P28, P29). expo-sensors ist seit P01 installiert.

## Installierte Versionen (Stand P01, Expo SDK 58)

| Paket | Version |
| --- | --- |
| expo | 58.0.16 |
| react / react-native | 19.3.0 / 0.88.0 |
| expo-router | 58.0.24 |
| nativewind / tailwindcss | 4.2.7 / 3.4.19 |
| react-native-reanimated / react-native-worklets | 4.7.1 / 0.13.0 |
| react-native-gesture-handler | 3.3.0 |
| @shopify/react-native-skia | 2.14.0 |
| zustand | 5.0.15 |
| react-native-mmkv / react-native-nitro-modules | 4.3.2 / 0.37.1 |
| expo-haptics, expo-notifications, expo-sensors, expo-font | SDK-58-Versionen (siehe package.json) |
| @expo-google-fonts/fredoka, @expo-google-fonts/nunito | 0.4.x |
| typescript | 6.0.3 |
| jest / jest-expo | 30.5.2 / 58.0.11 |
| eslint / eslint-config-expo | 9.39.5 / 58.0.4 |

Zusätzlich installiert, weil Pflicht-Abhängigkeit der genannten Pakete:

- `react-native-worklets`: von Reanimated 4 und Skia benötigt.
- `react-native-nitro-modules`: von MMKV 4 benötigt.
- `react-dom`: Peer von Expo Router (sonst bricht `npm install` ab).
- `babel-preset-expo` (dev): NativeWind braucht eine eigene `babel.config.js`, die das Preset direkt referenziert.
- `expo-dev-client`: für den Development Build (Profil `development` in `eas.json`), weil Skia und MMKV nicht in Expo Go laufen.

Abweichungen bei P01:

- Projekt liegt im Repo-Root (in einem Temp-Ordner erzeugt und verschoben). Vorlagen-Icons liegen unter `assets/icon/`.
- Expo Router 58: `Tabs` aus `expo-router/js-tabs`, `Stack` aus `expo-router/stack`. Die Tabs sitzen direkt in `app/_layout.tsx` (keine `(tabs)`-Gruppe), damit die Pfade aus `docs/AUFTRAEGE.md` (`app/index.tsx`, `app/shop.tsx` usw.) stimmen. Screens ohne Tab (`debug`, `harvest`, `seed-select`, `onboarding`) sind dort mit `href: null` registriert.
- Fonts nur in den genutzten Schnitten importiert (`@expo-google-fonts/nunito/400Regular` usw.), sonst landen alle Gewichte im Bundle.
- `npx expo install` braucht hier `EXPO_OFFLINE=1`, weil die Expo-API im Cloud-Container gesperrt ist; die Versionen kommen dann aus `expo/bundledNativeModules.json`.

---

## Adding new tools

This stack is the default. If a project genuinely needs something not on this list (a specific charting library, a payment processor, a queue, etc.), just add it. No need to ask first. But:

- Update this file when you do, so the next Claude Code session knows.
- Briefly note why it was added.
- Don't replace existing tools without flagging it to the user first.
