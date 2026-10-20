# PotPou: Fortschritt

Wird vom Leiter (Abteilungsleiter PotPou) nach jedem Merge aus `docs/progress/pNN.md` zusammengeführt. Kollegen schreiben nur ihre eigene Notiz. Du kannst hier selbst Notizen ergänzen.

Aktuelle Welle: 1 (Kern-Logik und Gerüste), 8 Kollegen parallel. Plan: `docs/AUFTRAEGE.md`.

## Auftragsstatus

| Auftrag | Status | PR | Handy-Test offen |
| --- | --- | --- | --- |
| P01 Projekt-Setup, CI, Gerüste | gemergt | #2 | ja (Tabs, Routen, Einstellungen) |
| P02 Spielstand und Persistenz | in Arbeit | | |
| P03 Hauptraum-Layout | PR offen | #7 | |
| P04 Bedürfnis-Logik | gemergt | #6 | nach P10 |
| P05 Gesundheits-Logik | PR offen | #8 | |
| P06 Ernte-Logik | gemergt | #5 | nach P24 |
| P07 Inhalte: Fakten-Karten, Sprüche | gemergt | #4 | Texte gegenlesen |
| P08 Minigame-Framework | in Arbeit | | |
| P09 Debug-Menü | PR offen | #9 | |

## Fertig

- Starter-Paket: CLAUDE.md, TECH_STACK.md, Konzept, Sessions, Asset-Liste, Design-Leitfaden, Launch-Checkliste
- `src/game/config.ts` mit allen Balancing-Werten und reservierten Abschnitten je Auftrag
- `src/game/timeEngine.ts` mit 11 grünen Tests
- Büro-Betrieb: `docs/AUFTRAEGE.md` (35 Aufträge in 6 Wellen), CI (`.github/workflows/ci.yml`), Prüfskript `scripts/check.sh`, Inhalts-Check, Progress-Notizen je Auftrag
- P01 (#2): Expo SDK 58 im Repo-Root, alle Pakete, fünf Tabs und alle Platzhalter-Routen, Slice-Store, Event-Bus, Theme, Assets, Strings, Einstellungs-Abschnitte, Album-Tabs, `eas.json`. 20 Tests grün. Details: `docs/progress/p01.md`
- P07 (#4): `src/content/facts.ts` (10 Fakten-Karten mit Quelle und Link), `src/content/quotes.ts` (Budi-Sprüche je Anlass und Sorte, `pickQuote`), Tests
- P06 (#5): `src/game/harvest.ts` (`computeYield`, `computeQualityStars`, `harvestRewards`), Werte im Abschnitt Ernte-Qualität, Tests
- P04 (#6): `src/game/needs.ts` (`computeNeeds`, `applyCare`, `deriveCondition`, Koma), Needs-Slice, 31 Tests

## Offen

- Welle 1: P02, P08 in Arbeit; P03 (#7), P05 (#8), P09 (#9) warten aufs Mergen
- P04: Licht-Balken hat keinen Abfallwert in `config.ts` (kommt mit P11). Neuer Samen setzt die Balken nicht automatisch zurück: wer `plantSeed` aufruft, ruft auch `resetNeeds(nowMs)`
- P06: `READY_GRACE_DAYS` (zu spät geerntet) und Münzverdopplung per Werbung gehören zu P24/P29
- P07: Nur 10 Fakten-Karten für 5 Phasen, Sämling und Erntebereit ohne Karte. Mehr Karten wären ein eigener Inhalts-Auftrag mit Quellenrecherche
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

P07 (ohne Handy, nur lesen):
1. Sprüche in `src/content/quotes.ts`: passt der Ton (frech, albern, nie Konsum)?
2. Kölsche Knospe spricht Kölsch: stimmen die drei Sätze?
3. Karten-Texte in `src/content/facts.ts`: passen sie als Budi-Popup?

P04 und P06: erst mit P10 bzw. P24 sichtbar.

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
- P04: `computeNeeds(state, nowMs, modifiers, phase)` mit Phase als viertem Parameter; `applyCare(state, { type, phase, amount? }, nowMs, modifiers?)`; im Koma wirkt Pflege nicht, raus nur per Wiederbelebung (P05 prüft Kosten)
- P06: Krankheitsmalus kommt als Zahl in Sternen; Samen-Fragmente 0/1/1/2/3 je nach Sternen (Balancing in P32)
- P09: Zeitraffer wirkt nur, wenn `getPlantStatus`/`flipLight`/`harvest` mit `selectDebugMultiplier(state)` aufgerufen werden (gilt für P10, P11, P24)
- Büro-Betrieb: Merge bei grüner CI (derzeit von Hand durch den CvD, GitHub-Auto-Merge ist aus), bis zu 8 Kollegen, ein Leiter (von CvD Luis ernannt). Grün heißt: Typen, Lint, Tests, Inhalts-Check.
