# PotPou: Fortschritt

Wird vom Leiter (Abteilungsleiter PotPou) nach jedem Merge aus `docs/progress/pNN.md` zusammengeführt. Kollegen schreiben nur ihre eigene Notiz. Du kannst hier selbst Notizen ergänzen.

Stand: 24 Aufträge gemergt (inkl. Nacharbeiten P09b, P10b, P27b). Welle 1 und 2 fast fertig, Welle 3 läuft. Plan: `docs/AUFTRAEGE.md`.

## Auftragsstatus

| Auftrag | Status | PR | Handy-Test offen |
| --- | --- | --- | --- |
| P01 Projekt-Setup, CI, Gerüste | gemergt | #2 | ja |
| P02 Spielstand und Persistenz | gemergt | #10 | ja |
| P03 Hauptraum-Layout | gemergt | #7 | ja |
| P04 Bedürfnis-Logik | gemergt | #6 | über P10 |
| P05 Gesundheits-Logik | gemergt | #8 | über P21 |
| P06 Ernte-Logik | gemergt | #5 | über P24 |
| P07 Inhalte: Fakten-Karten, Sprüche | gemergt | #4 | Texte gegenlesen |
| P08 Minigame-Framework | gemergt | #12 | ja |
| P09 Debug-Menü | gemergt | #9 | ja |
| P09b Debug: Sorten freischalten | gemergt | #21 | ja |
| P10 Pflege-Gesten und Balken | gemergt | #15 | ja |
| P10b Laune-Abzug nachts in der Blüte | gemergt | #31 | ja |
| P11 Licht, Tag/Nacht, Phasen | gemergt | #14 | ja |
| P12 Schädlings-Smash | gemergt | #28 | ja |
| P13 Tropfen-Fang | PR offen | #29 | |
| P14 Budi Jump, Grundmechanik | gemergt | #30 | ja |
| P15 Shop und Upgrades | gemergt | #16 | ja |
| P16 Sorten, Level, Album | gemergt | #17 | ja |
| P17 Fakten-Karten im UI, Quiz | PR offen | #13 | |
| P18 Benachrichtigungen | gemergt | #18 | ja |
| P19 Tagesziele | PR offen | #27 | |
| P20 Budi-Grafik | gemergt | #24 | ja |
| P21 Krankheiten im UI | gemergt | #25 | ja |
| P22 Budi Jump, Feinschliff | in Arbeit | | |
| P24 Ernte-UI | gemergt | #23 | ja |
| P25 Kosmetik gegen Münzen | in Arbeit | | |
| P26 Onboarding, Altersabfrage | gemergt | #22 | ja |
| P27 Zeit-Robustheit | gemergt | #19 | ja |
| P27b Monotone Uhr eingehängt | gemergt | #26 | ja |
| P23, P30, P31, P32, P33 | warten auf Vorgänger | | |
| P28, P29 | warten auf deine Konten | | |

## Fertig

- Starter-Paket, Büro-Betrieb (Plan, CI, Prüfskript, Inhalts-Check)
- P01 (#2): Expo SDK 58, Router mit fünf Tabs und allen Platzhalter-Routen, Slice-Store, Event-Bus, Theme, Assets, Strings, `eas.json`
- P02 (#10): Persistenz (MMKV), Spielstand-Version, Migrationen
- P03 (#7): Hauptraum aus acht Slots, UI-Bausteine
- P04 (#6), P05 (#8), P06 (#5): Logik für Bedürfnisse, Gesundheit, Ernte, mit Tests
- P07 (#4): 10 Fakten-Karten, Budi-Sprüche je Anlass und Sorte
- P08 (#12): Minigame-Framework (Countdown, Pause, Punkte, Münzen, Rekord), Beispielspiel "Tipp den Kreis", Auswahl-Screen
- P09 (#9), P09b (#21): Debug-Menü mit Zeitraffer, Vorspulen, Balken, Münzen, Sorten freischalten
- P10 (#15), P10b (#31): Gießen, zwei Dünger, Streicheln mit Haptik; Laune sinkt, wenn man nachts in der Blüte die Lampe antippt
- P11 (#14): Licht-Schalter 18/6 auf 12/12, Tag/Nacht im Raum, Phasenwechsel mit "Puff" und Popup
- P12 (#28): Schädlings-Smash (45 s, Kombo, 24 h Schädlingsschutz)
- P14 (#30): Budi Jump Grundmechanik, Neigen oder Tippen
- P15 (#16): Shop mit Upgrades, Effekte auf Abfall, Schädlinge, Schimmel und Ertrag
- P16 (#17): Sorten, Level, Album, Samenauswahl
- P18 (#18): Lokale Benachrichtigungen in Budis Stimme
- P20 (#24): Budi aus Ebenen, Atmen, Blinzeln, Reaktionen, Gesicht folgt Zustand, Accessoire-Slot
- P21 (#25): Schädlinge wegtippen, Schimmel behandeln, Koma mit Wiederbeleben gegen 30 Münzen
- P24 (#23): Ernte mit Lupe, Schere, Trocknen, Abschluss, neue Sorte freigeschaltet
- P26 (#22): Altersfrage 18+, Tutorial im Raum, rechtliche Links
- P27 (#19), P27b (#26): Monotone Uhr, überall eingehängt (Alter sinkt nie bei zurückgestellter Uhr)

## Offen

- Offene PRs: P13 (#29), P17 (#13), P19 (#27)
- Folge-Auftrag P19b: Minigame-Ziele (Smash, Tropfen, Hüpfen) in den Tagesziel-Pool, sobald P13 und P19 gemergt sind
- Licht-Balken sinkt nie (kein Abfallwert), siehe "Braucht dich"
- P07: Nur 10 Fakten-Karten für 5 Phasen, Sämling und Erntebereit ohne Karte
- P10: Universaldünger hat kein Werkzeug
- P18: Shop-Upgrades fließen noch nicht in die Durst-Planung ein
- Für P31 gesammelt: `PHASE_LABELS` nach `strings.ts`; `needBars.ts` (P03) ungenutzt; `useNow` liegt in `src/components/room/`; P11-Logik liegt unter `src/components/`; P24 rechnet nur minütlich neu (Trocknungsbalken springt im Zeitraffer); P26: Raum ist beim ersten Start kurz vor der Altersfrage zu sehen
- Kein Auftrag ist bisher auf einem echten Handy geprüft, nur Android-Bundle-Builds und Tests

## Braucht dich (gesammelt vom Leiter)

1. Development Build auf dem Handy installieren: Anleitung in `docs/progress/p01.md`. Danach die `projectId` aus `eas init` an den Leiter geben.
2. Balancing: Licht-Balken, wie viele Punkte pro echter Stunde? (Wasser 5, Nährstoffe 3, Laune 4.) Ohne Wert sinkt er nie, LED-Upgrade wirkt nicht.
3. Balancing: Laune-Abzug, wenn Budi nachts in der Blüte gestört wird, ist vorläufig 10 (`DARK_DISTURB_MOOD_PENALTY`). Bestätigen oder ändern.
4. Wasserfarbe: Palette hat kein Blau, Wasserbalken ist dunkel. Blau ergänzen?
5. Bundle-ID festlegen (vorläufig `app.potpou`), OK für `expo-env.d.ts` in `.gitignore`, Impressum- und Datenschutz-URLs.
6. Vorlauf Welle 4: Apple-, Google- und RevenueCat-Konten mit Produkt `turbo` (P28), AdMob-Konto mit Freigabe des Themas (P29).
7. Assets: Budi (B1 bis B8, B10 Gesichter, B12 Blinzeln, U1 Topf) zuerst, dann Raum (H1 bis H3), Pflege (U3, U4), Minigames (M1 bis M11), Shop (U1, U2, U4 bis U6), Krankheit (U17), Ernte (U7, U8, B7, B8). Liste in `docs/ASSETS.md`. Echte Budi-Dateien nur über die vorhandenen Dateinamen in `assets/budi/` tauschen (dann P20b).

## Handy-Tests für dich

Alle erst nach Installation des Development Builds. Pro Auftrag die wichtigsten Punkte, alle Details in `docs/progress/pNN.md`.

Start und Raum (P01, P03, P26):
1. Frische Installation: Altersfrage. "Nein" sperrt, "Ja" führt ins Zimmer mit Tutorial "Dein erster Samen".
2. Tutorial: Samen pflanzen, gießen, Balken, Minigames. "Überspringen" beendet es dauerhaft.
3. Raum: oben vier Balken und Münzen, Phasenkopf, Lampe, Budi auf dem Topf, unten runde Knöpfe.

Budi und Pflege (P10, P20, P10b):
1. Gießkanne über Budi halten und loslassen: Vibration, Budi hüpft, Wasser steigt. Nochmal gießen in der Keimung: Budi schüttelt sich, "gestresst".
2. Budi atmet, blinzelt alle paar Sekunden, Streicheln gibt ein sehr glückliches Gesicht.
3. Nachts in der Blüte Lampe antippen: "Pssst!", Laune sinkt um 10.

Licht und Phasen (P11):
1. Debug: pflanzen, Zeitraffer x1000. "Puff" und Popup "Budi ist jetzt ein Sämling!", Raum wird regelmäßig dunkel.
2. Im Wachstum "Auf 12/12 umschalten", Dialog bestätigen, Blüte beginnt. Auto-Anton hat keinen Schalter.

Krankheit (P21):
1. Balken auf 0, einen Tag vorspulen: Budi grau im Koma. Mit Münzen "Wiederbeleben" (30 Münzen).
2. Ungepflegt laufen lassen: Schädlinge sitzen auf Budi, Antippen entfernt sie.

Ernte (P24):
1. Bis "Erntebereit" vorspulen, "Ernten": Lupe, Schere quer über den Stiel, Trocknen mit "Zweige wenden", "Einsammeln".
2. Abschluss mit Sternen, Münzen, Fragmenten, danach Samenauswahl. Nach 3 Ernten "Neue Sorte freigeschaltet".

Minigames (P08, P12, P14):
1. Spiele-Tab: Karten mit Rekord. "Tipp den Kreis": Countdown, 30 s, Pause, Spielende mit Münzen, Rekord bleibt nach Neustart.
2. Schädlings-Smash: schneller werdend, Kombo ab schnellen Treffern, Marienkäfer kostet Punkte, ab 10 Punkten 24 h Schädlingsschutz.
3. Budi Jump: Handy kippen lenkt (falls verkehrt herum: melden), Fallen beendet das Spiel. In den Einstellungen auf "Tippen" umstellbar.

Shop und Sorten (P15, P16, P09b):
1. Shop: Upgrade kaufen, Münzen sinken, Upgrade steht im Raum unter der Lampe, bleibt nach Neustart.
2. Album "Sorten": nur Gurken-Gustav frei. Debug "Alle Sorten freischalten": alle frei, Samenauswahl erlaubt alle.

Speichern, Zeit, Benachrichtigungen (P02, P27, P18):
1. Münzen geben, App ganz schließen, neu öffnen: Münzen sind noch da.
2. Gerätezeit einen Tag zurückstellen: Alter und Phase springen nicht zurück.
3. Einmal gießen: erst jetzt kommt die Frage nach Benachrichtigungen. App schließen: Budi meldet sich tagsüber, nie nachts.

Texte (P07, ohne Handy):
1. Sprüche in `src/content/quotes.ts` und Karten in `src/content/facts.ts` gegenlesen (Ton, nie Konsum, Kölsch der Kölschen Knospe).

## Fehlende Assets

Überall sind erkennbare Platzhalter gebaut, die Dateinamen stehen in `docs/ASSETS.md` und in `src/lib/assets.ts`.

- Budi (P20): B1 bis B8, B10 (12 Gesichter), B12, U1 Topf. Platzhalter liegen schon unter den endgültigen Namen in `assets/budi/`
- Raum (P03, P11): H1 Tag, H2 Nacht, U2 Lampe an/aus, U9 Münze, U11 Balken-Icons, U12 Navigations-Icons, Puff-Wolke (keine ID)
- Pflege (P10): U3 Gießkanne, U4 Dünger Wachstum und Blüte
- Minigames (P08, P12, P14): Kartenbilder, M1 bis M4 (Smash), M9, M11, B11 (Jump)
- Shop (P15): U1 Topf-Stufen, U2 LED, U4 Spezialdünger, U5 Ventilator, U6 Entfeuchter, Nützlings-Kit (keine ID)
- Krankheit (P21): U17 Spinnmilbe, Trauermücke, Schimmel
- Ernte (P24): U7 Lupe, U8 Schere, B7, B8, H3 Trockenraum
- Sorten (P16): U15 Sortenkarten
- App (P01): Tab-Icons, App-Icon, Splash; Benachrichtigungs-Icon Android (P18)

## Bekannte Bugs

- P24: Ernte-Ansicht rechnet nur minütlich neu; im Zeitraffer springt der Trocknungsbalken, "Einsammeln" erscheint bis zu einer Minute zu spät
- P26: Beim allerersten Start ist der Raum einen Augenblick zu sehen, bevor die Altersfrage kommt
- P27: Uhr vorstellen bleibt ein Trick (Höchststand gilt). Ohne Serverzeit nicht lösbar, nach dem Launch
- P18: Wird die App hart beendet, ohne dass das System "Hintergrund" meldet, wird keine Benachrichtigung geplant

## Entscheidungen

- Zyklus ca. 10 echte Tage (TIME_SCALE 10), Turbo 9,99 € halbiert auf ca. 5 Tage
- Budi im MVP als PNG-Ebenen, Gesicht auf dem Topf
- Spielstand nur lokal, kein Login
- P01: Tabs direkt in `app/_layout.tsx`, Einstellungs-Abschnitte in `src/components/settings/sections.ts`, Slices sehen nur ihren eigenen Zustand
- P02: Neue Slices werden automatisch gespeichert; Formänderung über `SAVE_VERSION` und `MIGRATIONS` mit Test
- P04: `computeNeeds(state, nowMs, modifiers, phase)`, `applyCare(state, { type, phase, amount? }, nowMs, modifiers?)`; im Koma wirkt Pflege nicht. P10b ergänzt `applyMoodPenalty` (zählt nicht als Pflege, verhindert kein Koma)
- P05: Wiederbeleben = `reviveBudi` (zahlt) dann `reviveFromComa`; Schädlingsschutz "1 Spieltag" = 24 echte Stunden
- P06: Krankheitsmalus in Sternen; Samen-Fragmente 0/1/1/2/3 je nach Sternen
- P09: Zeitraffer über `selectDebugMultiplier(state)`
- P16: Nach der Ernte nur `harvested` auslösen, Level und Fragmente zählt der Progression-Slice
- P18: eine markierte Zeile `useNotificationScheduler()` in `app/_layout.tsx`; P26 hat seine Weiche daneben als markierten Block
- P27b: Spielzeit kommt überall aus der geteilten Uhr `src/lib/clock.ts`, nicht aus `Date.now()`
- `config.ts`-Abschnitte, vom Leiter zugewiesen: P11 "Licht und Phasen" vor "Shop-Upgrades", P12 vor "Sorten", P13 vor "Ertrag und Wirtschaft", P14/P22 vor "Gesundheit", P17 im Minigame-Abschnitt am Dateiende; P18 oben und P19 unten im Abschnitt Tagesziele/Benachrichtigungen; P25 oben im Abschnitt Kosmetik
- Büro-Betrieb: Merge bei grüner CI (derzeit von Hand durch den CvD), bis zu 8 Kollegen, ein Leiter
