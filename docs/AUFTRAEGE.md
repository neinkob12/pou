# PotPou im Büro: Auftragsplan für bis zu 8 parallele Sessions

Dieser Plan ersetzt die **Reihenfolge** aus `docs/SESSIONS.md`, nicht deren Inhalt. Die Session-Prompts dort bleiben die fachliche Vorlage jedes Auftrags. Hier steht, wer wann was baut, welche Dateien ihm gehören und wovon er abhängt, damit mehrere Kollegen gleichzeitig arbeiten können, ohne sich in die Quere zu kommen.

Kurzfassung des Systems:

- Ein Auftrag = ein Branch = ein PR = eine Session. Abhängigkeiten entscheiden, wann ein Auftrag starten darf.
- `bash scripts/check.sh` ist der einzige Prüfbefehl (Typen, Lint, Tests, Inhalts-Check). Grün in der CI heißt: der Büro-Mod merged automatisch.
- Geteilte Dateien haben feste Regeln (Abschnitte, Slices, Einhängezeilen), damit parallele Branches sauber zusammenlaufen.
- Der CvD schreibt keinen Feature-Code. Er führt das Brett, bewacht `main` und pflegt `docs/PROGRESS.md`.

## Rollen

| Rolle | Wer | Aufgabe |
| --- | --- | --- |
| Chef | Vincent | Entscheidungen, Assets, Konten, Tests auf dem Handy, Rückfragen beantworten |
| CvD (Chef vom Dienst) | eine Session | Aufträge anlegen, Kollegen holen, `main` bewachen, PROGRESS.md konsolidieren, Blocker bündeln, dem Chef berichten |
| Kollegen | bis zu 8 Sessions | je ein Auftrag von diesem Brett |

## Ablauf eines Auftrags

1. Der CvD legt den Auftrag auf dem Brett an (Vorlage ganz unten) und holt einen Kollegen.
2. Der Kollege arbeitet auf `claude/auftrag-{nr}-{name}`, prüft lokal mit `bash scripts/check.sh`, schreibt `docs/progress/pNN.md`, merged `origin/main` in seinen Branch, pusht, öffnet den PR und meldet `review`.
3. CI läuft. Grün: Auto-Merge, Session wird archiviert. Rot: der Kollege behebt die Ursache, bis grün.
4. Der CvD prüft nach dem Merge: CI auf `main` grün? Abnahme laut Progress-Notiz plausibel? Fremde Dateien angefasst? Er überträgt Handy-Tests, offene Punkte und Blocker nach `docs/PROGRESS.md`.
5. Sobald alle Abhängigkeiten eines weiteren Auftrags gemerged sind und ein Platz frei ist, startet der CvD ihn. **Wellen sind Orientierung, die Spalte "Braucht" ist verbindlich.**

## Arbeitsregeln für Kollegen

1. **Ein Auftrag, ein Branch, ein PR.** Nichts außerhalb des Auftrags bauen, auch wenn es naheliegt. Entdeckungen kommen in die Progress-Notiz unter "Gefunden, nicht gemacht".
2. **Nur eigene Dateien ändern.** Jeder Auftrag "besitzt" Dateien (siehe Liste). Geteilte Dateien nur nach der Tabelle unten. Fremde Dateien nur, wenn der Auftrag es ausdrücklich erlaubt.
3. **Vor `review`:** `git fetch origin main && git merge origin/main`, Konflikte lösen, `bash scripts/check.sh` grün, dann pushen und `review` melden. Nie `review` mit roter lokaler Prüfung.
4. **Logik in `src/game/` ist reines TypeScript** ohne React-Import. Jede neue Logikfunktion bekommt einen Test. Balancing-Werte nur in `src/game/config.ts`, im eigenen Abschnitt.
5. **Fehlende Assets:** Platzhalter über `src/lib/assets.ts` und `Placeholder`-Komponente, Eintrag in der Progress-Notiz unter "Fehlende Assets". Nie auf Assets warten.
6. **Progress-Notiz** `docs/progress/pNN.md` nach `docs/progress/VORLAGE.md`. `docs/PROGRESS.md` fasst nur der CvD an.
7. **Nie:** Tests löschen, überspringen oder abschwächen; CI-Workflow oder `scripts/` ändern; Force-Push; neue Abhängigkeiten ohne Nennung im Auftrag; Spielregeln oder Balancing ändern, wenn der Auftrag es nicht sagt; Konsum, Rauchen, Wirkung, Dosierung oder echten Verkauf darstellen (der Inhalts-Check in der CI blockt das, aber er ist nur ein Netz).
8. **Blockiert** (fehlende Abhängigkeit, fehlende Entscheidung, fehlendes Material): `auftrag blockieren` mit Grund und dem CvD melden. Nicht raten, nicht warten, nicht selbst erweitern.
9. **Kontext knapp:** `abgeben` mit Stand, offenen Punkten und nächstem Schritt, statt halbfertig zu pushen.
10. **CI rot nach dem Push:** Ursache lesen und beheben. Dreimal rot in Folge: CvD melden.

## Geteilte Dateien und wie man sie anfasst

| Datei oder Ordner | Regel |
| --- | --- |
| `src/game/config.ts` | Nur im eigenen, mit Kommentar markierten Abschnitt ergänzen. Nie am Dateiende anhängen. Neue Abschnitte nur, wenn dieser Plan sie nennt. |
| `src/store/gameStore.ts`, `src/store/slices/index.ts` | Eigenen Slice als eigene Datei `src/store/slices/<bereich>.ts` anlegen, in `index.ts` eine Zeile registrieren. `gameStore.ts` selbst gehört P01 und P02. |
| `src/lib/assets.ts` | Eigenen Abschnitt ergänzen, Dateien nach `docs/ASSETS.md` benennen. |
| `src/content/strings.ts` | Eigenes Objekt je Screen oder Bereich ergänzen. Alle sichtbaren Texte dort, nicht in Komponenten. |
| `src/game/events.ts` | Ereignisse (Typen) nur ergänzen, nie umbenennen. Wer ein Ereignis braucht, das fehlt, fügt es als eigenen Typ hinzu. |
| `app/_layout.tsx`, `app/(tabs)/_layout.tsx` | Gehören P01. Alle Routen sind ab P01 als Platzhalter angelegt. Fehlt eine Route, fragt man den CvD, statt die Layouts zu ändern (Ausnahme: P26 darf die Onboarding-Weiche einbauen). |
| `app/index.tsx`, `src/components/room/RoomScreen.tsx` | Ein Besitzer je Welle: P03 (Welle 1), P10 (Welle 2), danach P31. Alle anderen bauen eigene Komponenten unter `src/components/room/<bereich>/` und hängen sie mit **einer** Zeile in `RoomScreen.tsx` ein, nach Merge von `main`. |
| `src/components/room/*.tsx` (Slots) | Jeder Slot hat genau einen Besitzer (siehe P03). |
| `app/settings.tsx` | Rendert eine Liste von Abschnitten. Eigener Abschnitt als Datei `src/components/settings/<Bereich>Section.tsx`, eine Zeile in der Liste. |
| `app/album.tsx` | Zwei Tabs als eigene Komponenten: `StrainsTab.tsx` (P16) und `KnowledgeTab.tsx` (P17). |
| `app/shop.tsx` | Gehört P15. Kosmetik als eigene Datei `CosmeticsTab.tsx` (P25, P33). |
| `package.json`, `package-lock.json` | Neue Pakete nur, wenn der Auftrag sie nennt; Eintrag in `TECH_STACK.md` mit Begründung; vor `review` `main` mergen und `npm install` erneut laufen lassen. |
| `src/game/timeEngine.ts` | Bis P27 nur lesen. |
| `docs/PROGRESS.md` | Nur der CvD. |
| `docs/SESSIONS.md`, `docs/KONZEPT.md`, `CLAUDE.md`, `.github/`, `scripts/` | Niemand ohne ausdrücklichen Auftrag vom Chef. |

## Wellen-Übersicht

| Welle | Aufträge | Parallel | Voraussetzung | Ergebnis |
| --- | --- | --- | --- | --- |
| 0 Fundament | P01 | 1 (seriell) | Plan-PR gemerged | Expo-Projekt, CI grün, Gerüste für alle geteilten Dateien |
| 1 Kern-Logik und Gerüste | P02 bis P09 | 8 | P01 | Spielstand, Hauptraum-Layout, Bedürfnis-, Gesundheits-, Ernte-Logik, Inhalte, Minigame-Framework, Debug-Menü |
| 2 Features | P10 bis P19 | 10 (8 gleichzeitig, 2 nachrücken) | je nach "Braucht" | Pflege, Licht, drei Minigames, Shop, Sorten, Fakten, Notifications, Tagesziele |
| 3 Budi und Zyklus | P20 bis P27 | 8 | je nach "Braucht" | Budi-Grafik, Krankheiten im UI, Jump-Feinschliff, Polish, Ernte-UI, Kosmetik, Onboarding, Zeit-Robustheit |
| 4 Geld, Audio, Härte | P28 bis P33 | 6 | je nach "Braucht", Konten vom Chef | Käufe, Werbung, Audio, Bugfix-Durchlauf, Balancing, Saisonpass-Modell |
| 5 Launch | P34, P35 | 1 bis 2 | alles vorher, Material vom Chef | Build, Einreichung (zusammen mit dem Chef) |

Abhängigkeitsgraph in Kurzform:

```
P01 → P02, P03, P04, P05, P06, P07, P08, P09
P03 + P04 → P10          P03 + P02 → P11
P08 + P05 → P12          P08 + P04 → P13          P08 → P14
P02 + P03 + P04 → P15    P02 + P07 → P16          P02 + P07 → P17
P02 + P04 → P18          P02 + P08 → P19
P10 → P20                P05 + P20 → P21          P14 → P22
P12 + P13 + P22 → P23    P06 + P10 + P16 → P24    P15 + P20 → P25
P03 + P10 → P26          P02 → P27
P02 + P26 → P28          P08 + P21 + P24 + P26 → P29
P20 + P23 → P30          Welle 3 komplett → P31   P04 + P05 + P06 + P16 + P19 → P32
P25 + P28 → P33          P31 + P33 → P34          P34 → P35
```

---

## Welle 0: Fundament (seriell)

### P01 Projekt-Setup, CI und Gerüste

- **Basis:** Session 2, plus Gerüste aus Session 3 und 5. **Braucht:** nichts. **Nutzer-Input:** keiner.
- **Besitzt:** alles. Das ist der einzige Auftrag, der überall schreiben darf.
- **Umsetzung:**
  1. Expo-Projekt (TypeScript-Template) **im Repo-Root**, nicht in einem Unterordner: in einem Temp-Ordner erzeugen, Dateien ins Root verschieben. Bestehende Dateien (`CLAUDE.md`, `docs/`, `src/game/`, `scripts/`, `.github/`, `.gitignore`) bleiben unverändert.
  2. Alle Pakete aus `TECH_STACK.md` installieren, zusätzlich `expo-sensors`, `expo-font` mit `@expo-google-fonts/fredoka` und `@expo-google-fonts/nunito`, `eslint` mit `eslint-config-expo`. **Nicht:** `react-native-purchases`, `react-native-google-mobile-ads` (kommen in P28 und P29).
  3. `package.json`-Skripte: `typecheck` (`tsc --noEmit`), `lint` (`eslint .`), `test` (`jest`). Jest über `jest-expo`. Die 11 bestehenden Tests in `src/game/__tests__/` laufen grün. `bash scripts/check.sh` grün. Das Skript selbst nicht ändern.
  4. Expo Router mit Tabs: `index`, `minigames`, `shop`, `album`, `settings`. **Alle Routen der späteren Aufträge jetzt als Platzhalter anlegen:** `minigames/index`, `minigames/tap`, `minigames/smash`, `minigames/drops`, `minigames/jump`, `minigames/quiz`, `debug`, `harvest`, `seed-select`, `onboarding`. Ab dann ändert niemand mehr die Layout-Dateien.
  5. Gerüste für geteilte Dateien:
     - `src/store/gameStore.ts`: Zustand-Store, der Slices aus `src/store/slices/*.ts` zusammensetzt, mit `src/store/slices/index.ts` als Registrierungsliste. Beispiel-Slice `plant.ts` (aktuelle `PlantRecord`, `coins`, `turbo`). Noch keine Persistenz (P02).
     - `src/game/events.ts`: kleiner typisierter Event-Bus ohne React (`phaseChanged`, `careAction`, `harvested`, `minigameFinished`, `purchaseCompleted`), mit Test. Daran docken spätere Aufträge an, ohne fremde Dateien zu ändern.
     - `src/lib/theme.ts`: Farben (D3), Schriften (D5), Abstände, Radien. Fonts laden in `app/_layout.tsx`.
     - `src/lib/assets.ts`: Abschnitte je Bereich (budi, room, ui, minigames, sounds, icon), noch leer, plus `src/components/ui/Placeholder.tsx` (farbige Form + Text).
     - `src/content/strings.ts`: ein Objekt je Screen, erste Texte für die Tabs. Alle sichtbaren Texte wandern ab jetzt hierhin.
     - `app/settings.tsx` als Liste von Abschnitten aus `src/components/settings/`, mit einem Beispielabschnitt "Über".
     - `app/album.tsx` mit zwei Tabs aus `src/components/album/StrainsTab.tsx` und `KnowledgeTab.tsx` (Platzhalter).
  6. `eas.json` mit Profilen `development`, `preview`, `production`. In `docs/progress/p01.md` eine Schritt-für-Schritt-Anleitung für den Chef, wie er einen Development Build baut und installiert (Skia und MMKV laufen nicht in Expo Go).
  7. `TECH_STACK.md`: installierte Versionen und die Root-Setup-Abweichung eintragen.
- **Abnahme:** `bash scripts/check.sh` grün lokal und in CI. `npx expo start` zeigt fünf Tabs mit Platzhaltern. Alle Platzhalter-Routen erreichbar. Progress-Notiz mit Dev-Build-Anleitung.

---

## Welle 1: Kern-Logik und Gerüste (parallel nach P01)

### P02 Spielstand und Persistenz

- **Basis:** Session 3. **Braucht:** P01. **Nutzer-Input:** keiner.
- **Besitzt:** `src/store/gameStore.ts`, `src/store/slices/plant.ts`, `src/lib/storage.ts`, zugehörige Tests.
- **Zusatz:** Persistenz als Middleware um den Slice-Store (MMKV), Versionsnummer im Spielstand, `migrate(old, fromVersion)` mit Test, Hydration-Status im Store. Statistiken (Ernten gesamt) und `turbo` im Plant-Slice. Kein UI; der Handy-Test kommt über das Debug-Menü (P09).
- **Abnahme:** Tests für Speichern, Laden, Migration von Version 1 auf 2. Slices anderer Aufträge werden automatisch mitgespeichert.

### P03 Hauptraum-Layout mit Platzhaltern

- **Basis:** Session 5. **Braucht:** P01. **Nutzer-Input:** optional eine Skizze in `docs/skizzen/`. Fehlt sie: nach `KONZEPT.md` und `DESIGN_GUIDE.md` bauen.
- **Besitzt:** `app/index.tsx`, `src/components/room/*`, `src/components/ui/*` (Button, Bar, Modal, CoinChip).
- **Zusatz:** `RoomScreen.tsx` ist dünne Komposition aus **genau diesen Slot-Dateien**, je eine Datei: `RoomBackground.tsx` (später P11), `NeedBars.tsx` (später P10), `PhaseHeader.tsx` (später P11), `BudiStage.tsx` (später P10, Budi-Grafik P20), `Lamp.tsx` (später P11), `ActionTray.tsx` (später P10), `CoinDisplay.tsx`, `BottomNav.tsx`. Balken lesen aus dem Store (Platzhalterwerte, bis P10 sie füllt). Phase und Restzeit aus `getPlantStatus`.
- **Abnahme:** Raum sieht strukturell aus wie das Spiel. Alle Grafiken über `assets.ts`. Theme-Konstanten aus `theme.ts`, keine Farbwerte in Komponenten.

### P04 Bedürfnis-Logik

- **Basis:** Session 6, **nur Logik und Store-Slice, keine UI** (UI ist P10). **Braucht:** P01.
- **Besitzt:** `src/game/needs.ts`, Tests, `src/store/slices/needs.ts`, Abschnitt "Bedürfnisse" in `config.ts`.
- **Zusatz:** API: `computeNeeds(state, nowMs, modifiers)`, `applyCare(state, action, nowMs)`, `deriveCondition(needs, phase)`. `modifiers` (Abfall-Multiplikatoren je Balken) ist ein Parameter, damit P15 Shop-Effekte einspeisen kann, ohne die Rechnung anzufassen. `careAction`-Ereignis über `events.ts` auslösen.
- **Abnahme:** Tests für Abfall nach Tagen Abwesenheit, Phasen-Twists (Sämling, Überwässerung, falscher Dünger), alle Zustände inkl. Koma-Schwelle.

### P05 Gesundheits-Logik

- **Basis:** Session 10, **nur Logik und Slice** (UI ist P21). **Braucht:** P01.
- **Besitzt:** `src/game/health.ts`, Tests, `src/store/slices/health.ts`, Abschnitt "Gesundheit" in `config.ts`.
- **Zusatz:** Zufall über injizierbaren RNG (seedbar, testbar). Schädlingsschutz mit Ablaufzeitstempel (P12 setzt ihn). Koma-Eintritt und Wiederbelebungskosten. Qualitätsmalus als Zahl exportieren (P06 liest ihn).
- **Abnahme:** Tests für Auftretenswahrscheinlichkeit bei Vernachlässigung, Schimmel beim Trocknen, Schutzzeit, Koma.

### P06 Ernte-Logik

- **Basis:** Session 17, **nur Logik** (UI ist P24). **Braucht:** P01.
- **Besitzt:** `src/game/harvest.ts`, Tests, Abschnitt "Ernte-Qualität" in `config.ts`.
- **Zusatz:** API: `computeYield(plant, careScore, moodScore, strain)`, `computeQualityStars(diseases, dryingScore, trichomeScore)`, `harvestRewards(yield, stars, strain)` liefert Münzen und Samen-Fragmente. Kein Wort zu Konsum oder echtem Verkauf, Ziel ist der "Kräutermarkt".
- **Abnahme:** Tests mit Beispielrechnung aus `KONZEPT.md`.

### P07 Inhalte: Fakten-Karten, Budi-Sprüche

- **Basis:** Session 20 (Karten) und Session 19 (Sprüche), Text-Asset T1. **Braucht:** P01.
- **Besitzt:** `src/content/facts.ts`, `src/content/quotes.ts`, Tests dazu.
- **Zusatz:** Alle Karten aus `KONZEPT.md` mit Phase, Text, Quelle, Link. Rund 60 Sprüche: Begrüßung, Durst, Hunger, gestreichelt, Phasenwechsel, nachts gestört, je Sorte mindestens 3 eigene. Ton: frech, albern, nie Konsum. Test: jede Karte hat Quelle und Link, jede Sorte hat Sprüche.
- **Abnahme:** `scripts/check-content.sh` grün, Tests grün.

### P08 Minigame-Framework

- **Basis:** Session 11. **Braucht:** P01.
- **Besitzt:** `src/components/minigames/framework/*`, `app/minigames/index.tsx`, `app/minigames/tap.tsx` (Beispielspiel "Tipp den Kreis"), `src/store/slices/minigames.ts`.
- **Zusatz:** Countdown, Pause, Punkte, Spielende mit Münzen aus `MINIGAME_REWARDS`, Highscore je Spiel im Slice, Laune-Bonus über `minigameFinished`-Ereignis (P10 reagiert darauf). Hook-Punkt für "Extra-Leben" (P29 hängt dort die Werbung ein). Skia-Hinweis: Dev Build nötig, siehe P01-Notiz.
- **Abnahme:** Beispielspiel läuft flüssig, Münzen werden gutgeschrieben, Highscore bleibt nach Neustart (sobald P02 gemerged ist).

### P09 Debug-Menü

- **Basis:** Session 4. **Braucht:** P01 (P02 vor `review` per `main`-Merge nachziehen).
- **Besitzt:** `app/debug.tsx`, `src/components/debug/*`, `src/components/settings/DebugSection.tsx`.
- **Zusatz:** Einstieg über Abschnitt "Debug" in den Einstellungen, nur in `__DEV__`. Zeigt Phase, Alter, Balken. Zeitraffer nur über `debugMultiplier` der `timeEngine`.
- **Abnahme:** Kompletter Zyklus in Minuten durchspulbar. Im Release-Build nicht erreichbar (Test mit `__DEV__ = false`).

---

## Welle 2: Features (starten, sobald "Braucht" erfüllt ist)

### P10 Pflege-Gesten und Balken im UI

- **Basis:** Session 6 (UI-Teil) und Session 7. **Braucht:** P03, P04. **Nutzer-Input:** U3, U4 optional.
- **Besitzt:** `NeedBars.tsx`, `BudiStage.tsx`, `ActionTray.tsx`, `src/components/room/care/*`, `src/hooks/useNeeds.ts`. Besitzer von `RoomScreen.tsx` in dieser Welle.
- **Zusatz:** Alle Aktionen gehen über `applyCare` aus `needs.ts`. Laune-Bonus aus `minigameFinished`-Ereignis anwenden.
- **Abnahme:** Gießen und Füttern fühlen sich gut an, Balken reagieren, Haptik vorhanden.

### P11 Licht-Schalter, Tag/Nacht, Phasenwechsel

- **Basis:** Session 8. **Braucht:** P03, P02. **Nutzer-Input:** H2 optional.
- **Besitzt:** `Lamp.tsx`, `RoomBackground.tsx`, `PhaseHeader.tsx`, `src/components/room/phase/*`, `src/hooks/usePhaseWatcher.ts`.
- **Zusatz:** `usePhaseWatcher` erkennt Phasenübergänge beim Öffnen und im Vordergrund und löst `phaseChanged` aus (P17 und P18 hören darauf). Popup und "Puff" als eigene Komponente, Einhängezeile in `RoomScreen.tsx` nach `main`-Merge.
- **Abnahme:** Alle Phasen inkl. Lichtwechsel im Zeitraffer durchspielbar. Autoflower ohne Schalter.

### P12 Schädlings-Smash

- **Basis:** Session 12. **Braucht:** P08, P05. **Nutzer-Input:** M1 bis M4 optional.
- **Besitzt:** `app/minigames/smash.tsx`, `src/components/minigames/smash/*`.
- **Abnahme:** 45 Sekunden, Tempo steigt, Kombo, Schädlingsschutz wird in `health.ts` gesetzt.

### P13 Tropfen-Fang

- **Basis:** Session 13. **Braucht:** P08, P04. **Nutzer-Input:** M5 bis M8 optional.
- **Besitzt:** `app/minigames/drops.tsx`, `src/components/minigames/drops/*`.
- **Abnahme:** Balken füllen sich über `applyCare`, max. +40 pro Runde (Wert in `config.ts`, Abschnitt Minigames).

### P14 Budi Jump, Grundmechanik

- **Basis:** Session 14. **Braucht:** P08. **Nutzer-Input:** M9, M11, B11 optional.
- **Besitzt:** `app/minigames/jump.tsx`, `src/components/minigames/jump/*`, `src/components/settings/ControlsSection.tsx`.
- **Abnahme:** Neigen und Tippen, saubere Physik, 60 fps, Spielende beim Fallen.

### P15 Shop und Upgrades

- **Basis:** Session 18. **Braucht:** P02, P03, P04. **Nutzer-Input:** U1, U2, U5, U6 optional.
- **Besitzt:** `app/shop.tsx`, `src/components/shop/*` (inkl. leerer `CosmeticsTab.tsx`), `src/store/slices/shop.ts`, Abschnitt "Shop-Upgrades" in `config.ts`, `src/components/room/RoomUpgrades.tsx` (eine Einhängezeile in `RoomScreen.tsx`).
- **Darf zusätzlich:** `needs.ts` um die Übergabe der `modifiers` ergänzen (P04 ist dann gemerged), nicht die Rechnung ändern.
- **Abnahme:** Upgrades kaufbar, Effekte messbar in Tests, sichtbar im Raum.

### P16 Sorten, Level, Album

- **Basis:** Session 19 (ohne Sprüche, die sind P07). **Braucht:** P02, P07. **Nutzer-Input:** U15 optional.
- **Besitzt:** `src/game/progression.ts`, Tests, `src/store/slices/progression.ts`, Abschnitt "Level und Freischaltungen" in `config.ts`, `src/components/album/StrainsTab.tsx`, `app/seed-select.tsx`.
- **Abnahme:** Freischaltung nach `STRAINS.unlock` in Tests, Album zeigt gesperrt und entsperrt, Samenauswahl funktioniert (P24 ruft sie nach der Ernte auf).

### P17 Fakten-Karten im UI und Quiz

- **Basis:** Session 20 (UI-Teil). **Braucht:** P07, P02. **Nutzer-Input:** U14 optional.
- **Besitzt:** `src/components/album/KnowledgeTab.tsx`, `src/components/facts/*`, `app/minigames/quiz.tsx`, `src/store/slices/facts.ts`.
- **Zusatz:** Freischaltung hört auf `phaseChanged` (kommt mit P11; bis dahin über Debug-Menü testbar). Quiz als einfache UI, kein Skia.
- **Abnahme:** Karten schalten frei, Quellenlink öffnet Browser, Quiz zahlt doppelte Münzen bei voller Punktzahl.

### P18 Benachrichtigungen

- **Basis:** Session 21 (Notification-Teil). **Braucht:** P02, P04.
- **Besitzt:** `src/lib/notifications.ts`, `src/hooks/useNotificationScheduler.ts`, `src/components/settings/NotificationsSection.tsx`, Abschnitt "Tagesziele und Benachrichtigungen" in `config.ts` (nur Notification-Werte).
- **Zusatz:** Berechtigungsabfrage erst nach dem ersten `careAction`-Ereignis. Max. 3 pro Tag, Ruhezeit 22 bis 9 Uhr, Texte aus `strings.ts` in Budis Stimme.
- **Abnahme:** Bei geschlossener App kommt eine sinnvolle Benachrichtigung.

### P19 Tagesziele

- **Basis:** Session 16 (Datenmodell) und Session 21 (UI). **Braucht:** P02, P08. **Nutzer-Input:** U13 optional.
- **Besitzt:** `src/game/dailyGoals.ts`, Tests, `src/store/slices/dailyGoals.ts`, `src/components/room/DailyGoal.tsx` (eine Einhängezeile), Abschnitt "Tagesziele" in `config.ts` (nur Tagesziel-Werte).
- **Zusatz:** Fortschritt hört auf `minigameFinished` und `careAction`.
- **Abnahme:** Ein Ziel pro Tag, Belohnungskiste, Tageswechsel aus Zeitstempel.

---

## Welle 3: Budi und Zyklus

### P20 Budi-Grafik und Animation

- **Basis:** Session 9. **Braucht:** P10. **Nutzer-Input:** B1 bis B8, B10, B12, U1. **Fehlen sie: trotzdem bauen**, mit Platzhalter-Ebenen in denselben Dateinamen. Das Einhängen der echten Grafiken wird dann ein eigener kleiner Auftrag P20b.
- **Besitzt:** `src/components/budi/*`, `assets/budi/`, Abschnitt "budi" in `assets.ts`. Ersetzt den Platzhalter in `BudiStage.tsx` durch `<Budi />`.
- **Abnahme:** Ebenen-Aufbau, Idle-Animation, Reaktionen, Gesicht folgt Zustand aus `needs.ts`, Accessoire-Slot vorhanden (P25 nutzt ihn).

### P21 Krankheiten im UI

- **Basis:** Session 10 (UI-Teil). **Braucht:** P05, P20. **Nutzer-Input:** U17 optional.
- **Besitzt:** `src/components/budi/Pests.tsx`, `src/components/budi/ComaOverlay.tsx`, `src/components/room/health/*`.
- **Zusatz:** Rewarded-Ad-Option für Wiederbelebung als deaktivierter Button mit Hook-Punkt (P29).
- **Abnahme:** Schädlinge wegtippbar, Koma sichtbar, Wiederbeleben gegen Münzen.

### P22 Budi Jump, Feinschliff

- **Basis:** Session 15. **Braucht:** P14. **Nutzer-Input:** M10 optional.
- **Besitzt:** wie P14.
- **Abnahme:** Drei Plattform-Typen, Lichtpunkte, Rekordmarke, Lichtbonus über `minigameFinished`.

### P23 Minigame-Polish und Sound-Grundlage

- **Basis:** Session 16 (ohne Tagesziel-Modell, das ist P19). **Braucht:** P12, P13, P22. **Nutzer-Input:** S3 bis S6, S11, S12 optional (stille Platzhalter sonst).
- **Besitzt:** `src/lib/audio.ts` (neu, P30 erweitert), `src/components/settings/SoundSection.tsx`, Abschnitt "Minigames" in `config.ts` (Balancing der Belohnungen, mit Begründung in der Progress-Notiz).
- **Abnahme:** Sounds und Haptik in allen drei Spielen, Musik und Effekte getrennt schaltbar, 3 Runden am Tag ergeben ca. ein Upgrade pro Zyklus.

### P24 Ernte-UI

- **Basis:** Session 17 (UI-Teil). **Braucht:** P06, P10, P16. **Nutzer-Input:** B7, B8, U7, U8, H3 optional.
- **Besitzt:** `app/harvest.tsx`, `src/components/harvest/*`.
- **Zusatz:** Trichom-Lupe als kleines Erkennungsspiel, Schere-Geste, Trocknen-Ansicht, Abschluss mit Sternen, Münzen, Fragmenten, danach `seed-select` (P16). `harvested`-Ereignis auslösen. Hook-Punkt "Münzen verdoppeln" (P29).
- **Abnahme:** Zyklus von Samen bis neuem Samen im Zeitraffer durchspielbar.

### P25 Kosmetik gegen Münzen

- **Basis:** Session 24 (Münz-Teil; Echtgeld ist P33). **Braucht:** P15, P20. **Nutzer-Input:** U16 optional.
- **Besitzt:** `src/components/shop/CosmeticsTab.tsx`, `src/store/slices/cosmetics.ts`, Abschnitt "Kosmetik" in `config.ts`.
- **Abnahme:** Anprobieren, Ausrüsten über Accessoire-Slot, nur Optik.

### P26 Onboarding und Altersabfrage

- **Basis:** Session 25. **Braucht:** P03, P10. **Nutzer-Input:** Onboarding-Texte optional (sonst Vorschlag in `strings.ts`), Impressum- und Datenschutz-URLs als Platzhalter.
- **Besitzt:** `app/onboarding.tsx`, `src/components/onboarding/*`, `src/components/settings/LegalSection.tsx`, die Onboarding-Weiche in `app/_layout.tsx` (ein klar markierter Block).
- **Zusatz:** Hook-Punkt für den Consent-Dialog nach dem Tutorial (P29 füllt ihn).
- **Abnahme:** 18+-Abfrage, Tutorial überspringbar, Links in Einstellungen.

### P27 Zeit-Robustheit

- **Basis:** Session 27 (Zeit-Teil; Rest ist P31). **Braucht:** P02.
- **Besitzt:** `src/game/timeEngine.ts` (ergänzen, nicht umbauen), `src/game/clock.ts` (höchster gesehener Zeitstempel, monotone Zeit), `src/lib/storage.ts` (Feld dafür), Tests.
- **Abnahme:** Tests für Sommer-/Winterzeit, zurückgestellte Gerätezeit (Alter sinkt nie), Wochen Abwesenheit, Migration.

---

## Welle 4: Geld, Audio, Härte

### P28 Turbo-Kauf mit RevenueCat

- **Basis:** Session 22. **Braucht:** P02, P26. **Nutzer-Input (Pflicht):** Apple- und Google-Konten, RevenueCat-Projekt, Produkt `turbo`, API-Keys als Umgebungsvariablen (nie im Repo).
- **Besitzt:** `src/lib/purchases.ts`, `src/components/settings/PurchasesSection.tsx`, `package.json` (nur dieses Paket, Eintrag in `TECH_STACK.md`).
- **Zusatz:** `applyTurbo` auf aktuelle Pflanze, Flag im Plant-Slice für künftige. `purchaseCompleted`-Ereignis. Zweiter Pflanzplatz nur als Datenmodell vorbereiten.
- **Abnahme:** Sandbox-Kauf aktiviert Turbo, Wiederherstellen funktioniert. Anleitung für den Chef in der Progress-Notiz.

### P29 Rewarded Ads und Consent

- **Basis:** Session 23. **Braucht:** P08, P21, P24, P26. **Nutzer-Input (Pflicht):** AdMob-Konto, Ad-Unit-IDs, Bestätigung, dass AdMob das Thema akzeptiert.
- **Besitzt:** `src/lib/ads.ts`, `src/components/ads/*`, `package.json` (nur dieses Paket). **Darf zusätzlich** die Hook-Punkte in P08, P21, P24, P26 füllen (Besitzer sind fertig).
- **Abnahme:** Consent beim ersten Start, nur Rewarded Ads, Buttons verschwinden ohne geladene Anzeige, Test-IDs in Dev.

### P30 Audio: Musik, Effekte, Budi-Stimme

- **Basis:** Session 26. **Braucht:** P20, P23. **Nutzer-Input:** S1, S2, S7 bis S10 (sonst stille Platzhalter und Eintrag in "Fehlende Assets").
- **Besitzt:** `src/lib/audio.ts` (erweitern), `src/components/budi/voice.ts`, Abschnitt "sounds" in `assets.ts`.
- **Abnahme:** Musik loopt leise, Effekte bei allen Aktionen, Stimme je Laune, respektiert Stummschalter und andere Apps.

### P31 Robustheit und Bugfix-Durchlauf

- **Basis:** Session 27 (Rest). **Braucht:** Welle 3 komplett.
- **Besitzt:** Bugfixes überall (kleine, gezielte Änderungen, keine Features). Besitzer von `RoomScreen.tsx` ab jetzt.
- **Zusatz:** Speicherplatz voll, Offline, Doppel-Tap bei Käufen, dann `docs/PROGRESS.md` "Bekannte Bugs" abarbeiten. Jeder Fix bekommt einen Test, wo möglich.
- **Abnahme:** Liste in der Progress-Notiz: Bug, Ursache, Fix, Test.

### P32 Balancing-Simulation

- **Basis:** Session 28. **Braucht:** P04, P05, P06, P16, P19.
- **Besitzt:** `scripts/simulate.ts` (Ausnahme von der `scripts/`-Regel, nur diese Datei), `docs/progress/p32.md` mit Ergebnistabelle.
- **Zusatz:** **Keine Änderung an `config.ts`.** Vorschläge in die Notiz. Der Chef entscheidet; danach legt der CvD P32b "Balancing anwenden" an.
- **Abnahme:** Tabelle für drei Spielertypen über 30 Tage, Vorschläge mit Begründung.

### P33 Kosmetik gegen Echtgeld und Saisonpass-Modell

- **Basis:** Session 24 (Rest). **Braucht:** P25, P28. **Nutzer-Input:** Kosmetik-Produkte in RevenueCat.
- **Besitzt:** `CosmeticsTab.tsx`, `slices/cosmetics.ts`, Abschnitt "Kosmetik und Saisonpass" in `config.ts`.
- **Abnahme:** Echtgeld-Items über RevenueCat, Saisonpass als Datenmodell mit gesperrter Legendär-Sorte, noch nicht verkauft.

---

## Welle 5: Launch (mit dem Chef zusammen)

### P34 Release-Build

- **Basis:** Session 29. **Braucht:** P31, P33 (und P20b, falls offen). **Nutzer-Input (Pflicht):** A1 bis A3, Bundle-ID, EAS-Konto.
- **Besitzt:** `app.json`, `eas.json`, `assets/icon/`, Release-Checks (Debug aus, Test-IDs aus, Logs aus), Inhalts-Durchsicht aller `strings.ts`-Texte.
- **Abnahme:** Chef hat die App über TestFlight und internen Play-Test auf dem Handy.

### P35 Store-Einreichung

- **Basis:** Session 30. **Braucht:** P34. **Nutzer-Input (Pflicht):** A4 bis A9, Store-Texte, Checkliste `STORE_LAUNCH.md`.
- Diese Session führt der Chef interaktiv mit einem Kollegen, nicht über das Brett im Hintergrund.

---

## Was der Chef liefern muss, nach Welle

| Spätestens vor | Was | Wofür |
| --- | --- | --- |
| Welle 1 | Entscheidungen D1 bis D3 in `DESIGN_GUIDE.md` eintragen (Name, Stil, Palette). Fehlt es, nimmt P01 die Empfehlungen. | P01, P03 |
| Welle 1 | Development Build auf dem Handy installieren (Anleitung aus P01) | alle Handy-Tests |
| Welle 2 | optional Skizze Hauptraum, U3, U4, M1 bis M11 | P10, P12 bis P14 |
| Welle 3 | B1 bis B8, B10, B12, U1, U7, U8, H3, U16, U17, S3 bis S6, S11, S12 | P20 bis P25 |
| Welle 4 | Apple- und Google-Konten, RevenueCat, AdMob mit Freigabe des Themas, S1, S2, S7 bis S10 | P28 bis P30 |
| Welle 5 | A1 bis A9, Bundle-ID, Datenschutz- und Impressum-URLs, Store-Texte | P34, P35 |

Alles mit "optional" blockiert nichts: Kollegen bauen mit Platzhaltern. Alles mit "Pflicht" startet der CvD erst, wenn das Material da ist.

## Vorlage: Auftragstext auf dem Brett

Der CvD setzt jeden Auftrag aus vier Teilen zusammen. Titel: `[P07] Inhalte: Fakten-Karten, Budi-Sprüche`.

```
## Ziel
<ein Satz aus dem Plan-Eintrag>

## Kontext
Lies CLAUDE.md, TECH_STACK.md, docs/AUFTRAEGE.md (Arbeitsregeln, geteilte Dateien, deinen Eintrag PNN) und docs/PROGRESS.md.
Fachliche Vorlage (wörtlich aus docs/SESSIONS.md, Session N):
<Session-Prompt>

## Umsetzung
Basis, Braucht, Nutzer-Input, Besitzt, Zusatz aus dem Plan-Eintrag PNN, wörtlich.
Branch: claude/auftrag-{nr}-{kurzname}. Vor review: origin/main mergen, bash scripts/check.sh grün, docs/progress/pNN.md geschrieben.

## Abnahme
<Abnahme-Zeilen aus dem Plan-Eintrag>
- bash scripts/check.sh grün in der CI
- docs/progress/pNN.md vorhanden, nach Vorlage
- keine Dateien außerhalb des Besitzes geändert
```
