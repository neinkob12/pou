# PotPou: Fortschritt

Wird vom Leiter (Abteilungsleiter PotPou) nach jedem Merge aus `docs/progress/pNN.md` zusammengeführt. Kollegen schreiben nur ihre eigene Notiz. Du kannst hier selbst Notizen ergänzen.

Stand: 34 Aufträge gemergt (30 aus dem Plan, die Nacharbeiten P09b, P10b, P27b und die Web-Version PWEB). Alles, was ohne dich geht, ist fertig. Offen sind P28, P29, P32b und P33, alle warten auf dich (siehe "Braucht dich"). Plan: `docs/AUFTRAEGE.md`.

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
| P13 Tropfen-Fang | gemergt | #29 | ja |
| P14 Budi Jump, Grundmechanik | gemergt | #30 | ja |
| P15 Shop und Upgrades | gemergt | #16 | ja |
| P16 Sorten, Level, Album | gemergt | #17 | ja |
| P17 Fakten-Karten im UI, Quiz | gemergt | #13 | ja |
| P18 Benachrichtigungen | gemergt | #18 | ja |
| P19 Tagesziele | gemergt | #27 | ja |
| P20 Budi-Grafik | gemergt | #24 | ja |
| P21 Krankheiten im UI | gemergt | #25 | ja |
| P22 Budi Jump, Feinschliff | gemergt | #34 | ja |
| P23 Minigame-Polish, Sound-Grundlage | gemergt | #35 | ja |
| P24 Ernte-UI | gemergt | #23 | ja |
| P25 Kosmetik gegen Münzen | gemergt | #33 | ja |
| P26 Onboarding, Altersabfrage | gemergt | #22 | ja |
| P27 Zeit-Robustheit | gemergt | #19 | ja |
| P27b Monotone Uhr eingehängt | gemergt | #26 | ja |
| P30 Audio: Musik, Effekte, Budi-Stimme | gemergt | #37 | ja |
| P31 Robustheit, Bugfixes | gemergt | #40 | ja |
| P32 Balancing-Simulation | gemergt | #38 | nein, Entscheidung |
| P32b Balancing anwenden | wartet auf deine Entscheidung | | |
| P33 Kosmetik gegen Echtgeld, Saisonpass | wartet auf P28 | | |
| P28, P29 | warten auf deine Konten | | |
| PWEB Web-Version (Zusatzauftrag) | gemergt | #41 | ja, im Browser |

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
- P13 (#29): Tropfen-Fang, gefangenes Wasser und Dünger füllen die Balken (je höchstens +40, nie Überwässerung)
- P14 (#30), P22 (#34): Budi Jump mit Neigen oder Tippen, brechende Blätter, Federn, Lichtpunkte, Rekordmarke
- P15 (#16): Shop mit Upgrades, Effekte auf Abfall, Schädlinge, Schimmel und Ertrag
- P16 (#17): Sorten, Level, Album, Samenauswahl
- P17 (#13): Fakten-Karten werden je Phase freigeschaltet (Popup in Budis Stimme), Album "Wissen", Pflanzen-Quiz
- P18 (#18): Lokale Benachrichtigungen in Budis Stimme
- P19 (#27): Tagesziel im Raum (Pflege oder Minigame), Belohnungskiste mit Münzen, neues Ziel jeden Kalendertag
- P23 (#35): Sound- und Vibrations-Grundlage in allen Minigames, Schalter für Musik, Effekte und Vibration, Minigame-Münzen neu balanciert
- P20 (#24): Budi aus Ebenen, Atmen, Blinzeln, Reaktionen, Gesicht folgt Zustand, Accessoire-Slot
- P21 (#25): Schädlinge wegtippen, Schimmel behandeln, Koma mit Wiederbeleben gegen 30 Münzen
- P25 (#33): Kosmetik-Tab im Shop, Accessoires anprobieren, kaufen, Budi trägt sie im Raum
- P30 (#37): Raum-Musik, Sounds für Pflege, Phasenwechsel und Ernte, Budi-Stimme mit Tonhöhe je Laune
- P31 (#40): Doppel-Tap bei Upgrade und Wiederbeleben bezahlt nur einmal, voller Speicher stürzt nicht mehr ab, Ernte-Ansicht flüssig, kein Aufblitzen des Raums vor der Altersfrage, Spieluhr überall
- P32 (#38): Balancing-Simulation mit drei Spielertypen über 30 Tage (`scripts/simulate.ts`), Vorschläge in `docs/progress/p32.md`
- PWEB (#41): Web-Version im Browser, auch auf dem Handy; behebt nebenbei einen Fehler, durch den Altersfrage, Ernte, Samenauswahl und Debug nativ nicht erreichbar waren
- P24 (#23): Ernte mit Lupe, Schere, Trocknen, Abschluss, neue Sorte freigeschaltet
- P26 (#22): Altersfrage 18+, Tutorial im Raum, rechtliche Links
- P27 (#19), P27b (#26): Monotone Uhr, überall eingehängt (Alter sinkt nie bei zurückgestellter Uhr)

## Offen

- Keine offenen PRs, kein Kollege arbeitet. Alles Weitere wartet auf dich
- P19b entfällt: P19 hat die Minigame-Ziele gleich mit eingebaut
- P25: Topf-Skins (U16 Gestreift, Gold, Köln-Dom) nicht gebaut, brauchen einen eigenen Topf-Slot in `Budi.tsx`; Kandidat für P33
- P30: Stimme bei Sprüchen fehlt, weil es noch keine Sprechblase für `quotes.ts` gibt
- Licht-Balken sinkt nie (kein Abfallwert), siehe "Braucht dich". Der Lichtbonus aus Budi Jump (P22) sammelt sich bis dahin in einem Guthaben
- Spielende-Screen (P08) zeigt nur Punkte und Münzen, kein "+n Licht" (P22) und kein Hochzählen der Münzen (P23)
- P07: Nur 10 Fakten-Karten für 5 Phasen, Sämling und Erntebereit ohne Karte
- P10: Universaldünger hat kein Werkzeug
- P18: Shop-Upgrades fließen noch nicht in die Durst-Planung ein
- Für P31 gesammelt: `PHASE_LABELS` nach `strings.ts`; `needBars.ts` (P03) ungenutzt; `useNow` liegt in `src/components/room/`; P11-Logik liegt unter `src/components/`; P24 rechnet nur minütlich neu (Trocknungsbalken springt im Zeitraffer); P26: Raum ist beim ersten Start kurz vor der Altersfrage zu sehen
- Kein Auftrag ist bisher auf einem echten Handy geprüft, nur Android-Bundle-Builds und Tests

## Braucht dich (gesammelt vom Leiter)

1. **GitHub Pages einschalten:** Settings > Pages > Source: GitHub Actions. Danach läuft das Spiel nach dem nächsten Push auf main unter https://neinkob12.github.io/pou-/ (Debug-Menü sichtbar, Spielstand nur im Browser). Ohne diesen Schalter schlägt nur der Pages-Lauf fehl, die CI bleibt grün.
1. **Balancing aus P32 entscheiden** (Tabelle "Vorschläge" in `docs/progress/p32.md`, Ja/Nein je Zeile). Kern: Wer einmal am Tag spielt, liegt heute ca. 14 Mal in 30 Tagen im Koma und hat nie eine seltene Sorte. Vorschlag: Koma nach 36 statt 24 h, Wasser 3 und Laune 3 statt 5 und 4 pro Stunde, Lila Lotte ab 1 Ernte, Tageskiste 25 statt 60, Münzen je Ertragseinheit 10 statt 5, Jump-Münzkurs 0,05. Ergebnis: 0 Koma, Lila Lotte an Tag 13. Danach legt der Leiter P32b an.
1. Development Build auf dem Handy installieren: Anleitung in `docs/progress/p01.md`. Danach die `projectId` aus `eas init` an den Leiter geben. Seit P23 ist `expo-audio` dabei: ein schon installierter Build muss neu gebaut werden.
2. Balancing: Licht-Balken, wie viele Punkte pro echter Stunde? Ohne Wert sinkt er nie, LED-Upgrade wirkt nicht. P32 empfiehlt: keinen Abfallwert, solange der Balken nichts bewirkt.
3. Balancing: Laune-Abzug, wenn Budi nachts in der Blüte gestört wird, ist vorläufig 10 (`DARK_DISTURB_MOOD_PENALTY`). P32: harmlos, Empfehlung bestätigen.
4. Wasserfarbe: Palette hat kein Blau, Wasserbalken und Wassertropfen (P13) sind dunkel. Blau ergänzen?
5. Bundle-ID festlegen (vorläufig `app.potpou`), OK für `expo-env.d.ts` in `.gitignore`, Impressum- und Datenschutz-URLs.
6. Vorlauf Welle 4: Apple-, Google- und RevenueCat-Konten mit Produkt `turbo` (P28), AdMob-Konto mit Freigabe des Themas (P29).
7. Assets: Budi (B1 bis B8, B10 Gesichter, B12 Blinzeln, U1 Topf) zuerst, dann Raum (H1 bis H3), Pflege (U3, U4), Minigames (M1 bis M11), Shop (U1, U2, U4 bis U6), Krankheit (U17), Ernte (U7, U8, B7, B8). Liste in `docs/ASSETS.md`. Echte Budi-Dateien nur über die vorhandenen Dateinamen in `assets/budi/` tauschen (dann P20b).
8. Zur Info, beim Handy-Test prüfen: P23 hat die Minigame-Münzen gesenkt, von bis zu 50 auf höchstens 8 pro Runde (Rechnung in `docs/progress/p23.md`). Echte Punktzahlen vom Handy helfen P32 (in `MINIGAME_REWARDS.typicalScores` eintragen, Skript neu laufen lassen).
9. Sounds S1 bis S12 (Liste in `docs/ASSETS.md`, Budi-Stimme S9 als 7 kurze Laute in normaler Tonlage). Stille Platzhalter liegen unter den endgültigen Namen in `assets/sounds/`, einfach drüberkopieren.

## Handy-Tests für dich

Vieles geht schon in der Web-Version (ohne Benachrichtigungen, Vibration und Neigen, Details in `docs/progress/pweb.md`). Sonst erst nach Installation des Development Builds. Pro Auftrag die wichtigsten Punkte, alle Details in `docs/progress/pNN.md`.

Start und Raum (P01, P03, P26, P31, PWEB):
1. Frische Installation: zuerst nur heller Hintergrund, dann Altersfrage (kein Zimmer dazwischen, keine Endlosschleife). "Nein" sperrt, "Ja" führt ins Zimmer mit Tutorial "Dein erster Samen".
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
3. Budi Jump: Handy kippen lenkt (falls verkehrt herum: melden), Fallen beendet das Spiel. In den Einstellungen auf "Tippen" umstellbar. Lila Blätter federn hoch, orange brechen nach einem Sprung, gelbe Punkte zählen "Licht", ab Runde 2 gestrichelte Rekordlinie.
4. Tropfen fangen (P13): Topf per Wischen, blaue und grüne Tropfen füllen Wasser und Nährstoffe (je höchstens +40), drei Salzklumpen beenden die Runde.
5. Ton und Vibration (P23): Smash-Treffer vibrieren, Einstellungen "Ton und Vibration" schalten Musik, Effekte und Vibration einzeln. Münzen am Rundenende etwa 3 bis 8.

Tagesziele und Kosmetik (P19, P25):
1. Raum: unter der Phase steht ein Tagesziel mit Zähler. Erfüllen, Kiste antippen: Münzen steigen, ein zweites Mal geht nicht. Am nächsten Tag ein anderes Ziel.
2. Shop > Kosmetik: Krone antippen probiert sie an. Mit Debug-Münzen die Kappe kaufen: Budi trägt sie im Raum, auch nach Neustart.

Audio (P30, erst nach einem echten Sound über einem Platzhalter):
1. Raum: leise Musik im Loop, nach einem Minigame läuft sie wieder. Gießen, Düngen, Werkzeug aufnehmen klingen je eigen.
2. Budi streicheln bei voller und bei leerer Laune: Laut klingt höher bzw. tiefer. Stummschalter an: alles still, Spotify läuft weiter.

Fakten-Karten (P17):
1. Samen pflanzen, Raum: Popup "Psst, Budi weiß was!" mit zwei Keimungs-Karten. Album > Wissen: freigeschaltete Karten bunt, Quelle öffnet den Browser.
2. Spiele > Pflanzen-Quiz (ab 3 Karten): alles richtig zahlt doppelte Münzen.

Shop und Sorten (P15, P16, P09b):
1. Shop: Upgrade kaufen, Münzen sinken, Upgrade steht im Raum unter der Lampe, bleibt nach Neustart.
2. Album "Sorten": nur Gurken-Gustav frei. Debug "Alle Sorten freischalten": alle frei, Samenauswahl erlaubt alle.

Robustheit (P31):
1. Shop: zweimal ganz schnell auf ein Upgrade tippen, nur eine Stufe wird gekauft. Im Koma zweimal schnell "Wiederbeleben": nur 30 Münzen weg.
2. iPhone: gießen, App im App-Umschalter wegwischen, die Benachrichtigung kommt trotzdem.

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
- Minigames (P08, P12, P13, P14, P22): Kartenbilder, M1 bis M4 (Smash), M5 bis M8 (Tropfen), M9 je Blatt-Typ, M10 Lichtpunkte, M11, B11 (Jump)
- Fakten (P17): U14 Kartenrahmen
- Sounds (P23, P30): alle S1 bis S12 als stille Platzhalter in `assets/sounds/`
- Tagesziel (P19): Belohnungskiste zu und offen (noch ohne ID in `docs/ASSETS.md`)
- Kosmetik (P25): U16 Sonnenbrille, Kappe, Strohhut, Krone als Platzhalter in `assets/budi/`
- Shop (P15): U1 Topf-Stufen, U2 LED, U4 Spezialdünger, U5 Ventilator, U6 Entfeuchter, Nützlings-Kit (keine ID)
- Krankheit (P21): U17 Spinnmilbe, Trauermücke, Schimmel
- Ernte (P24): U7 Lupe, U8 Schere, B7, B8, H3 Trockenraum
- Sorten (P16): U15 Sortenkarten
- App (P01): Tab-Icons, App-Icon, Splash; Benachrichtigungs-Icon Android (P18)

## Bekannte Bugs

- P27: Uhr vorstellen bleibt ein Trick (Höchststand gilt). Ohne Serverzeit nicht lösbar, nach dem Launch
- P18: Stürzt die App ab, wird keine Benachrichtigung geplant (Wegwischen ist seit P31 abgedeckt, ein echter Absturz nicht lösbar, siehe p31.md)
- Web-Version: Sounds erst nach der ersten Berührung (Browser-Regel), Spielstand nur im jeweiligen Browser

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
- P13: Tropfen-Fang füllt die Balken einmal am Rundenende, je Balken höchstens +40, nie über die Überwässerungs-Grenze, Dünger zählt als Universaldünger
- P17: Ein Phasenwechsel schaltet alle Karten dieser Phase frei; volle Quiz-Punktzahl verdoppelt die Punkte statt eines Sonderwegs bei den Münzen
- P22: Brechende Blätter tragen einmal (Strecke bleibt immer erreichbar); Lichtbonus als Guthaben `jumpLightBank`, der künftige Licht-Balken holt es mit `takeJumpLight()` ab
- P23: Sound-Schalter sind Geräte-Einstellungen (nicht im Spielstand), Vibration hat einen eigenen Schalter; `MINIGAME_REWARDS` 0,14 Münzen je Punkt, höchstens 8 pro Runde; neue Töne als Eintrag in `CUES` (`src/lib/audio.ts`)
- P19: Tagesziel gilt je Kalendertag in Ortszeit (nicht im Zeitraffer), Ziele reihum, nicht geöffnete Kiste verfällt; Smash-Ziel zählt Punkte inkl. Kombo
- P25: Budi trägt höchstens ein Accessoire, Anprobe wird nicht gespeichert; `purchaseCompleted` mit `cosmetic:<id>` (P33 nutzt dieselbe Form)
- P30: Raum-Musik läuft in allen Tabs weiter und endet nur im Minigame; Budi-Stimme hängt am Streicheln und zählt als Effekt
- P32: Simulationsskript `scripts/simulate.ts` läuft nicht in der Testsuite, Aufruf in `docs/progress/p32.md`
- P31: Spieldateien schreiben nur über `safeSet` (`src/lib/storage.ts`); Käufe prüfen den erwarteten Stand (`buyUpgrade(..., expectedLevel)`); `PHASE_LABELS` heißt jetzt `phaseLabels` in `strings.ts`; `useNow` liegt in `src/hooks/`
- PWEB: Versteckte Routen über `HIDDEN_TAB_OPTIONS` (`src/lib/hiddenTab.ts`) statt `href: null`; Web-Abweichungen nur als `.web.ts`-Dateien; P28 und P29 brauchen je eine leere `.web.ts`-Datei
- `config.ts`-Abschnitte, vom Leiter zugewiesen: P11 "Licht und Phasen" vor "Shop-Upgrades", P12 vor "Sorten", P13 vor "Ertrag und Wirtschaft", P14/P22 vor "Gesundheit", P17 im Minigame-Abschnitt am Dateiende; P18 oben und P19 unten im Abschnitt Tagesziele/Benachrichtigungen; P25 oben im Abschnitt Kosmetik; P30 als Block "Audio (P30)" direkt vor dem Minigame-Abschnitt
- Büro-Betrieb: Merge bei grüner CI (derzeit von Hand durch den CvD), bis zu 8 Kollegen, ein Leiter
