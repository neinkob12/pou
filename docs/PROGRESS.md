# PotPou: Fortschritt

Wird vom Leiter (Abteilungsleiter PotPou) nach jedem Merge aus `docs/progress/pNN.md` zusammengeführt. Kollegen schreiben nur ihre eigene Notiz. Du kannst hier selbst Notizen ergänzen.

Aktuelle Welle: 1 (Kern-Logik und Gerüste), 8 Kollegen parallel. Plan: `docs/AUFTRAEGE.md`.

## Auftragsstatus

| Auftrag | Status | PR | Handy-Test offen |
| --- | --- | --- | --- |
| P01 Projekt-Setup, CI, Gerüste | gemergt | #2 | ja (Tabs, Routen, Einstellungen) |
| P02 Spielstand und Persistenz | in Arbeit | | |
| P03 Hauptraum-Layout | in Arbeit | | |
| P04 Bedürfnis-Logik | in Arbeit | | |
| P05 Gesundheits-Logik | in Arbeit | | |
| P06 Ernte-Logik | in Arbeit | | |
| P07 Inhalte: Fakten-Karten, Sprüche | in Arbeit | | |
| P08 Minigame-Framework | in Arbeit | | |
| P09 Debug-Menü | in Arbeit | | |

## Fertig

- Starter-Paket: CLAUDE.md, TECH_STACK.md, Konzept, Sessions, Asset-Liste, Design-Leitfaden, Launch-Checkliste
- `src/game/config.ts` mit allen Balancing-Werten und reservierten Abschnitten je Auftrag
- `src/game/timeEngine.ts` mit 11 grünen Tests
- Büro-Betrieb: `docs/AUFTRAEGE.md` (35 Aufträge in 6 Wellen), CI (`.github/workflows/ci.yml`), Prüfskript `scripts/check.sh`, Inhalts-Check, Progress-Notizen je Auftrag
- P01 (#2): Expo SDK 58 im Repo-Root, alle Pakete, fünf Tabs und alle Platzhalter-Routen, Slice-Store, Event-Bus, Theme, Assets, Strings, Einstellungs-Abschnitte, Album-Tabs, `eas.json`. 20 Tests grün. Details: `docs/progress/p01.md`

## Offen

- Welle 1 (P02 bis P09) läuft
- P01: `npx expo start` noch nicht auf einem echten Gerät geprüft (nur Android-Bundle gebaut)
- `.gitignore` sollte `expo-env.d.ts` enthalten (Vorschlag aus P01, braucht dein OK, weil `.gitignore` geschützt ist)

## Braucht dich (gesammelt vom Leiter)

- D1 bis D3 in `docs/DESIGN_GUIDE.md` eintragen (Name, Stil, Palette). Sonst nimmt P01 die Empfehlungen.
- Development Build auf dem Handy installieren: Anleitung in `docs/progress/p01.md` (expo.dev-Konto, `eas init`, `eas build --profile development`).
- Nach `eas init`: die `projectId` in `app.json` an den Leiter geben oder als kleinen PR committen.
- Bundle-ID festlegen (vorläufig `app.potpou`), spätestens vor P34.
- OK für eine Zeile `expo-env.d.ts` in `.gitignore`.

## Handy-Tests für dich

P01 (nach Dev-Build-Installation):
1. Unten fünf Tabs (Budi, Spiele, Shop, Album, Einstellungen), jeder zeigt einen Platzhalter mit Fredoka-Überschrift.
2. Spiele: fünf Links öffnen je einen Platzhalter, "Zurück" führt zur Auswahl.
3. Album: zwischen "Sorten" und "Wissen" umschalten.
4. Einstellungen: "Über" mit Version, unter "Entwicklung" vier Links (Debug, Ernte, Samen wählen, Willkommen) ohne Tab-Leiste, "Zurück" funktioniert.

## Fehlende Assets

- Alle (siehe docs/ASSETS.md)
- P01: Tab-Icons (farbiger Kreis), App-Icon und Splash sind Expo-Vorlagenbilder

## Bekannte Bugs

- Keine

## Entscheidungen

- Zyklus ca. 10 echte Tage (TIME_SCALE 10), Turbo 9,99 € halbiert auf ca. 5 Tage
- Budi im MVP als PNG-Ebenen, Gesicht auf dem Topf (Empfehlung, siehe DESIGN_GUIDE.md D4)
- Spielstand nur lokal, kein Login
- P01: Tabs direkt in `app/_layout.tsx` (keine `(tabs)`-Gruppe), Einstellungs-Abschnitte in `src/components/settings/sections.ts`, Slices sehen nur ihren eigenen Zustand (`SliceCreator<T>`)
- Büro-Betrieb: Auto-Merge bei grüner CI, bis zu 8 Kollegen, ein Leiter (von CvD Luis ernannt). Grün heißt: Typen, Lint, Tests, Inhalts-Check.
