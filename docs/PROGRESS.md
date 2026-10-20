# PotPou: Fortschritt

Wird vom Leiter (Abteilungsleiter PotPou) nach jedem Merge aus `docs/progress/pNN.md` zusammengeführt. Kollegen schreiben nur ihre eigene Notiz. Du kannst hier selbst Notizen ergänzen.

Stand: 12 von 33 Aufträgen gemergt. Welle 1 fast fertig (P08 offen), Welle 2 und 3 laufen parallel. Plan: `docs/AUFTRAEGE.md`.

## Auftragsstatus

| Auftrag | Status | PR | Handy-Test offen |
| --- | --- | --- | --- |
| P01 Projekt-Setup, CI, Gerüste | gemergt | #2 | ja (Tabs, Routen, Einstellungen) |
| P02 Spielstand und Persistenz | gemergt | #10 | ja (über Debug-Menü) |
| P03 Hauptraum-Layout | gemergt | #7 | ja |
| P04 Bedürfnis-Logik | gemergt | #6 | über P10 |
| P05 Gesundheits-Logik | gemergt | #8 | erst mit P21 |
| P06 Ernte-Logik | gemergt | #5 | erst mit P24 |
| P07 Inhalte: Fakten-Karten, Sprüche | gemergt | #4 | Texte gegenlesen |
| P08 Minigame-Framework | PR offen (Konflikt mit main) | #12 | |
| P09 Debug-Menü | gemergt | #9 | ja |
| P09b Debug: Sorten freischalten | in Arbeit | | |
| P10 Pflege-Gesten und Balken | gemergt | #15 | ja (Gefühl der Gesten) |
| P11 Licht, Tag/Nacht, Phasen | PR offen | #14 | |
| P15 Shop und Upgrades | PR offen | #16 | |
| P16 Sorten, Level, Album | gemergt | #17 | ja |
| P17 Fakten-Karten im UI, Quiz | PR offen | #13 | |
| P18 Benachrichtigungen | gemergt | #18 | ja (geschlossene App) |
| P20 Budi-Grafik | in Arbeit | | |
| P24 Ernte-UI | in Arbeit | | |
| P26 Onboarding, Altersabfrage | in Arbeit | | |
| P27 Zeit-Robustheit | gemergt | #19 | erst nach P27b |
| P12, P13, P14, P19 | wartet auf P08 | | |

## Fertig

- Starter-Paket: CLAUDE.md, TECH_STACK.md, Konzept, Sessions, Asset-Liste, Design-Leitfaden, Launch-Checkliste
- Büro-Betrieb: `docs/AUFTRAEGE.md` (35 Aufträge in 6 Wellen), CI, Prüfskript `scripts/check.sh`, Inhalts-Check, Progress-Notizen je Auftrag
- P01 (#2): Expo SDK 58 im Repo-Root, alle Pakete, fünf Tabs und alle Platzhalter-Routen, Slice-Store, Event-Bus, Theme, Assets, Strings, Einstellungs-Abschnitte, Album-Tabs, `eas.json`
- P02 (#10): Persistenz (MMKV) um den Slice-Store, `SAVE_VERSION` und `MIGRATIONS`, Hydration-Status, `harvestsTotal`
- P03 (#7): Hauptraum aus acht Slots, UI-Bausteine (Button, Bar, Modal, CoinChip, AssetImage), Raum mit eigener unterer Leiste
- P04 (#6): `src/game/needs.ts` (`computeNeeds`, `applyCare`, `deriveCondition`, Koma), Needs-Slice
- P05 (#8): `src/game/health.ts` (Schädlinge, Schimmel, Schutzzeit, Koma, Qualitätsmalus in Sternen), Health-Slice, seedbarer Zufall
- P06 (#5): `src/game/harvest.ts` (`computeYield`, `computeQualityStars`, `harvestRewards`)
- P07 (#4): `src/content/facts.ts` (10 Fakten-Karten), `src/content/quotes.ts` (Budi-Sprüche je Anlass und Sorte)
- P09 (#9): Debug-Menü (nur Dev-Build) mit Zeitraffer, Vorspulen, Balken, Münzen, Turbo, Reset
- P10 (#15): Gießkanne, zwei Dünger, Streicheln mit Haptik und Animation, echte Balken, `useNeeds()`
- P16 (#17): Sorten-Freischaltung, Level, Album-Tab "Sorten", Samenauswahl
- P18 (#18): Lokale Benachrichtigungen (max. 3 am Tag, Ruhezeit 22 bis 9 Uhr), Erlaubnis erst nach der ersten Pflege, Schalter in den Einstellungen
- P27 (#19): Monotone Uhr `src/game/clock.ts` (Alter sinkt nie), Tests für Zeitumstellung, zurückgestellte Uhr, Wochen Abwesenheit

## Offen

- P08 (#12) hat einen Konflikt mit main und blockiert P12, P13, P14, P19 und das Quiz in P17
- P27: Die neue Uhr ist noch nicht eingehängt, alle Aufrufer nutzen `Date.now()`. Folge-Auftrag P27b nach Merge von P11
- P05: Niemand ruft `checkHealth` regelmäßig auf. Gehört in P21 (beim Öffnen und im Vordergrund, `resetHealth` bei neuer Pflanze)
- P10/P11: Laune-Abzug beim Antippen der Lampe nachts in der Blüte (`lightDisturbed`) fehlt. Folge-Auftrag P10b nach Merge von P11
- P04/P10: Licht-Balken sinkt nie (kein Abfallwert in `config.ts`), siehe "Braucht dich"
- P07: Nur 10 Fakten-Karten für 5 Phasen, Sämling und Erntebereit ohne Karte. Mehr Karten wären ein eigener Inhalts-Auftrag mit Quellenrecherche
- P10: Universaldünger hat kein Werkzeug (Konzept nennt zwei Sorten)
- P18: Shop-Upgrades fließen noch nicht in die Durst-Planung ein (Meldungen kommen etwas zu früh)
- Für P31 gesammelt: `PHASE_LABELS` von `config.ts` nach `strings.ts`; `needBars.ts` (P03) wird nicht mehr genutzt; `useNow` liegt in `src/components/room/` statt `src/hooks/`; P11-Logik (`lightCycle`, `phaseWatch`) liegt unter `src/components/` statt `src/game/`
- Kein Auftrag ist bisher auf einem echten Handy geprüft, nur Android-Bundle-Builds und Tests

## Braucht dich (gesammelt vom Leiter)

1. Development Build auf dem Handy installieren: Anleitung in `docs/progress/p01.md`. Danach die `projectId` aus `eas init` an den Leiter geben.
2. Licht-Balken: Wie schnell soll er pro echter Stunde sinken? (Wasser 5, Nährstoffe 3, Laune 4.) Ohne Wert bleibt er stehen, und das LED-Upgrade aus P15 wirkt nicht.
3. Wasserfarbe: Die Palette in `DESIGN_GUIDE.md` hat kein Blau, der Wasserbalken ist dunkel (`night`). Blau ergänzen?
4. Bundle-ID festlegen (vorläufig `app.potpou`), spätestens vor P34.
5. OK für eine Zeile `expo-env.d.ts` in `.gitignore`.
6. Optional: D1 bis D3 in `docs/DESIGN_GUIDE.md`, sonst gelten die Empfehlungen.
7. Für P26: Impressum- und Datenschutz-URLs (bis dahin Platzhalter).

## Handy-Tests für dich

Alle erst nach Installation des Development Builds.

P01:
1. Unten fünf Tabs, jeder zeigt einen Platzhalter mit Fredoka-Überschrift.
2. Spiele: Links öffnen je einen Platzhalter, "Zurück" führt zur Auswahl.
3. Album: zwischen "Sorten" und "Wissen" umschalten.

P03 und P10 (Raum):
1. Oben vier Balken und Münzen, darunter der Phasenkopf, in der Mitte Lampe, Budi (grüner Kreis auf Topf), unten runde Knöpfe zu Spiele, Shop, Album, Einstellungen.
2. Debug-Menü: Samen pflanzen. Gießkanne ziehen und über Budi loslassen: Vibration, Budi hüpft, Wasserbalken steigt.
3. Gleich nochmal gießen in der Keimung: Warn-Vibration, "Budi ist gestresst".
4. Blütendünger in der Keimung: nur wenig Nährstoffe. Über Budi wischen: Laune steigt.

P02 und P09 (Debug-Menü und Speichern):
1. Einstellungen > Debug > Debug-Menü öffnen. "Samen pflanzen", dann "x1000": Phase wechselt nach rund einer Minute.
2. "+1000" Münzen, App ganz schließen, neu öffnen: Münzen sind noch da.
3. Kompletter Zyklus: "+30 Tage" zweimal, "Licht auf 12/12", "+30 Tage" zweimal, "Ernten", "+7 Tage": Phase "Fertig".

P16:
1. Album, Tab "Sorten": Level 1, nur Gurken-Gustav frei, die anderen grau mit Bedingung.
2. Einstellungen > Entwicklung > "Samen wählen": Gurken-Gustav pflanzen, Raum zeigt Keimung, Balken voll.

P18:
1. Frische Installation: keine Frage nach Benachrichtigungen. Einmal gießen: jetzt kommt die Frage. Erlauben.
2. Gießen, App wegwischen: Am nächsten Tag zwischen 9 und 22 Uhr meldet sich Budi, nie nachts.
3. Einstellungen, "Budi darf sich melden" aus: nichts kommt mehr.

P07 (ohne Handy, nur lesen):
1. Sprüche in `src/content/quotes.ts`: passt der Ton (frech, albern, nie Konsum)?
2. Kölsche Knospe spricht Kölsch: stimmen die drei Sätze?
3. Karten-Texte in `src/content/facts.ts`: passen sie als Budi-Popup?

## Fehlende Assets

- Alle Assets aus `docs/ASSETS.md`. Gebaut sind überall erkennbare Platzhalter.
- P01: Tab-Icons, App-Icon und Splash (Expo-Vorlagenbilder)
- P03: H1 Raum, U1 Topf, U2 Lampe, B3 Budi, U9 Münze, U11 Balken-Icons, U12 Navigations-Icons
- P10: U3 Gießkanne, U4 Dünger Wachstum und Blüte
- P16: U15 Sortenkarten-Bilder
- P18: eigenes einfarbiges Benachrichtigungs-Icon für Android (später)

## Bekannte Bugs

- P27: Uhr vorstellen bleibt ein Trick (einmal vorgestellt, gilt der Höchststand). Ohne Serverzeit nicht lösbar, nach dem Launch.
- P18: Wird die App hart beendet, ohne dass das System "Hintergrund" meldet (z. B. Absturz), wird keine Benachrichtigung geplant.

## Entscheidungen

- Zyklus ca. 10 echte Tage (TIME_SCALE 10), Turbo 9,99 € halbiert auf ca. 5 Tage
- Budi im MVP als PNG-Ebenen, Gesicht auf dem Topf (Empfehlung, siehe DESIGN_GUIDE.md D4)
- Spielstand nur lokal, kein Login
- P01: Tabs direkt in `app/_layout.tsx` (keine `(tabs)`-Gruppe), Einstellungs-Abschnitte in `src/components/settings/sections.ts`, Slices sehen nur ihren eigenen Zustand
- P02: Neue Slices werden automatisch gespeichert. Formänderung am Spielstand: `SAVE_VERSION` erhöhen, Schritt in `MIGRATIONS`, Test. `__mocks__/react-native-nitro-modules.ts` im Root ist vom Leiter akzeptiert (Test-Infrastruktur)
- P04: `computeNeeds(state, nowMs, modifiers, phase)`; `applyCare(state, { type, phase, amount? }, nowMs, modifiers?)`; im Koma wirkt Pflege nicht
- P05: Wiederbeleben = erst `reviveBudi(now, spendCoins)` (P05, zahlt), dann `reviveFromComa(now)` (P04). Schädlingsschutz "1 Spieltag" = 24 echte Stunden
- P06: Krankheitsmalus kommt als Zahl in Sternen; Samen-Fragmente 0/1/1/2/3 je nach Sternen
- P09: Zeitraffer wirkt nur, wenn `getPlantStatus`/`flipLight`/`harvest` mit `selectDebugMultiplier(state)` aufgerufen werden
- P10: `useNeeds()` ist der Einstieg für alle Bedürfnis-Anzeigen im Raum
- P16: Nach der Ernte nur das Ereignis `harvested` auslösen, Level und Fragmente zählt der Progression-Slice selbst
- P18: eine markierte Zeile `useNotificationScheduler()` in `app/_layout.tsx` (Ausnahme vom Leiter erlaubt); P26 muss sie beim Einbau der Onboarding-Weiche erhalten
- `config.ts`-Abschnitte für Aufträge ohne eigenen Abschnitt (Leiter): P11 "Licht und Phasen" vor "Shop-Upgrades", P12 vor "Sorten", P13 vor "Ertrag und Wirtschaft", P14 vor "Gesundheit", P17 vor "Bedürfnisse"; P18 oben und P19 unten im Abschnitt Tagesziele/Benachrichtigungen
- Büro-Betrieb: Merge bei grüner CI (derzeit von Hand durch den CvD, GitHub-Auto-Merge ist aus), bis zu 8 Kollegen, ein Leiter. Grün heißt: Typen, Lint, Tests, Inhalts-Check.
