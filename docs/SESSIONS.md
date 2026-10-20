# PotPou: 30 Sessions bis zum App-Store-Launch

**Büro-Betrieb:** Wenn mehrere Sessions parallel arbeiten, gilt die Reihenfolge aus `docs/AUFTRAEGE.md`, nicht die hier. Die Prompts unten bleiben die fachliche Vorlage; jeder Auftrag in `AUFTRAEGE.md` nennt, welche Session er umsetzt und welche Teile davon.

So benutzt du diese Datei allein (ohne Büro):

- Eine Session = ein Teilziel, ca. 1 bis 3 Stunden. Starte jede Session in Claude Code frisch (`/clear`), damit der Kontext sauber bleibt.
- Kopiere den Prompt-Block der Session als erste Nachricht.
- **Deine Aufgabe vorher** = Dinge, die du selbst vorbereiten musst (meist Assets aus `ASSETS.md`). Fehlt etwas, nutzt Claude Code Platzhalter, das ist ok.
- **Fertig, wenn** = so prüfst du auf dem Handy, ob die Session sitzt. Erst dann zur nächsten.
- Bei großen Sessions (mit Stern ★) erst im Plan-Modus planen lassen (Shift+Tab), dann bauen.

Übersicht:

| Block | Sessions | Ergebnis |
| --- | --- | --- |
| A Fundament | 1 bis 5 | App läuft, Zeit-Engine, Spielstand, Hauptraum mit Platzhaltern |
| B Budi lebt | 6 bis 10 | Pflege, Licht-Schalter, echte Grafik, Krankheiten |
| C Minigames | 11 bis 16 | Drei spielbare Minigames mit Belohnungen |
| D Progression | 17 bis 21 | Ernte, Shop, Sorten, Fakten-Karten, Benachrichtigungen |
| E Geld | 22 bis 24 | Turbo-Kauf, Rewarded Ads, Kosmetik |
| F Launch | 25 bis 30 | Tutorial, Feinschliff, Build, Store-Einreichung |

---

## Block A: Fundament

### Session 1: Planungsdurchlauf (kein Code)

**Deine Aufgabe vorher:** Ordner anlegen, alle Dateien aus diesem Starter-Paket hineinkopieren (CLAUDE.md, TECH_STACK.md, docs/, src/game/). Entscheidungen D1 bis D3 aus `DESIGN_GUIDE.md` treffen (Name, Stil, Palette).

```
PotPou, Session 1: Planungsdurchlauf

PotPou ist ein Pou-artiges Handyspiel für Erwachsene: Man pflegt eine Cannabispflanze mit Gesicht ("Budi") in Echtzeit vom Samen bis zur Ernte, spielt Minigames für Münzen und sammelt Sorten. Ein Zyklus dauert ca. 10 echte Tage.

## Tech stack
Lies TECH_STACK.md und CLAUDE.md. Folge beiden.

## Lies zuerst
- docs/KONZEPT.md (Spielkonzept)
- docs/SESSIONS.md (Fahrplan, nur zum Verstehen)
- src/game/config.ts und src/game/timeEngine.ts (fertige Vorlagen mit Tests)

## In Scope
- Verständnis prüfen und Plan bestätigen

## Nicht in Scope
- Jeglicher App-Code, Projekt-Setup, Installation

## Aufgaben
1. Fasse in 5 Sätzen zusammen, was PotPou ist und welche Regeln aus CLAUDE.md am wichtigsten sind.
2. Prüfe config.ts und timeEngine.ts. Nenne Schwachstellen oder Lücken, ändere aber nichts.
3. Prüfe den Fahrplan in SESSIONS.md. Nenne Sessions, die du für zu groß hältst oder deren Reihenfolge du ändern würdest.
4. Liste die 5 größten technischen Risiken (z. B. Skia + Expo, Rewarded Ads mit Cannabis-Thema).
5. Lege docs/PROGRESS.md mit den Abschnitten "Fertig", "Offen", "Fehlende Assets", "Bekannte Bugs" an.

## Constraints
- Schreib keinen App-Code. Das ist ein Planungsdurchlauf.
- Stell Rückfragen, wenn etwas unklar ist. Rate nicht.
- Bleib im Scope. Wenn du etwas Zusätzliches für nötig hältst, schlag es vor, statt es zu tun.
```

**Fertig, wenn:** Du die Risiken verstanden hast und PROGRESS.md existiert.

### Session 2: Projekt-Setup ★

**Deine Aufgabe vorher:** Node.js (LTS) installiert, Expo Go auf dem Handy, Xcode (Mac) oder Android Studio optional.

```
PotPou, Session 2: Projekt-Setup.
Lege das Expo-Projekt nach TECH_STACK.md an (Setup-Befehle dort). Richte Expo Router, NativeWind, Reanimated, Gesture Handler und jest-expo ein. Übernimm src/game/ (config.ts, timeEngine.ts, Tests) unverändert und sorg dafür, dass `npm test` grün läuft. Lege die Ordnerstruktur aus TECH_STACK.md an, mit leeren Platzhalter-Screens für index, shop, album, minigames, settings. Noch keine Spiellogik in der UI. Am Ende: App startet auf meinem Handy, Tabs/Navigation funktionieren, Tests grün. PROGRESS.md aktualisieren.
```

**Fertig, wenn:** Die App auf deinem Handy startet und du zwischen leeren Screens wechseln kannst.

### Session 3: Spielstand und Speicher

```
PotPou, Session 3: Spielstand.
Baue src/store/gameStore.ts mit Zustand und Persistenz über MMKV (src/lib/storage.ts). Der Store hält: aktuelle Pflanze (PlantRecord aus timeEngine), Münzen, Samen-Fragmente, freigeschaltete Sorten, Upgrades, Turbo gekauft ja/nein, Bedürfnis-Balken mit Zeitstempel der letzten Berechnung, Statistiken (Ernten gesamt). Schreib eine Versionsnummer in den Spielstand und eine einfache Migrationsfunktion für spätere Änderungen. Tests für Speichern/Laden. Noch keine UI außer einem Debug-Text auf dem Hauptscreen, der Phase und Alter anzeigt.
```

**Fertig, wenn:** Du die App schließt, wieder öffnest und der Debug-Text dieselbe Pflanze zeigt, nur älter.

### Session 4: Debug-Menü und Zeitraffer

```
PotPou, Session 4: Debug-Menü.
Baue ein verstecktes Debug-Menü (z. B. 5x auf die Phasenanzeige tippen, nur in __DEV__). Funktionen: Zeitraffer-Faktor wählen (1, 100, 1000), X Pflanzentage vorspulen, Balken setzen, Münzen geben, Spielstand zurücksetzen, Turbo an/aus, alle Sorten freischalten. Der Zeitraffer muss über die bestehende debugMultiplier-Logik der timeEngine laufen, nicht über Sonderwege. Das Menü darf im Release-Build nicht erreichbar sein.
```

**Fertig, wenn:** Du einen kompletten Zyklus in wenigen Minuten durchspulen kannst.

### Session 5: Hauptraum-Layout mit Platzhaltern ★

**Deine Aufgabe vorher:** Mindestens grobe Skizze des Hauptraums (Handyfoto einer Papierskizze reicht). Zeig sie Claude Code als Bild.

```
PotPou, Session 5: Hauptraum.
Baue den Hauptscreen nach meiner Skizze (Bild im Anhang). Elemente: Hintergrund, Budi in der Mitte (Platzhalter: Topf-Form + Kreis), vier Balken oben (Wasser, Nährstoffe, Licht, Laune), Phasenname mit Fortschrittsbalken und "noch X Std.", Münzanzeige, untere Navigation (Spiele, Shop, Album, Einstellungen), Lampe oben im Bild. Alle Assets über src/lib/assets.ts, damit ich später nur Dateien tausche. Farben und Schriften aus docs/DESIGN_GUIDE.md als Theme-Konstanten anlegen.
```

**Fertig, wenn:** Der Raum sieht strukturell aus wie dein Spiel, auch wenn alles noch Platzhalter ist.

---

## Block B: Budi lebt

### Session 6: Bedürfnis-Logik

```
PotPou, Session 6: Bedürfnisse.
Baue src/game/needs.ts als reine Logik mit Tests: Balken sinken pro echter Stunde laut config.ts (NEED_DECAY_PER_REAL_HOUR), berechnet aus Zeitstempeln (auch wenn die App tagelang zu war). Phasen-Twists aus KONZEPT.md: Sämling braucht weniger Wasser, Überwässerung bei Gießen über 100, falscher Dünger je Phase (Stickstoff im Wachstum, Phosphor/Kalium in der Blüte). Zustände ableiten: ok, durstig, hungrig, gestresst, krank, Koma (COMA_AFTER_REAL_HOURS). Verbinde es mit dem Store und den Balken im UI.
```

**Fertig, wenn:** Balken sinken nach Zeitraffer sichtbar, Zustand wird als Debug-Text angezeigt.

### Session 7: Pflege-Interaktionen ★

**Deine Aufgabe vorher:** Assets U3 (Gießkanne), U4 (Dünger) als PNG, falls schon da. Sonst Platzhalter.

```
PotPou, Session 7: Pflege-Gesten.
Baue die Interaktionen mit Gesture Handler und Reanimated: Gießkanne aus einem Fach ziehen und über Budi halten (Wasser steigt, Tropfen-Animation), Dünger in Budis Mund ziehen (zwei Sorten: Wachstum und Blüte), Budi streicheln (Laune steigt, kurze Freude-Animation), Lampe antippen. Haptisches Feedback bei jeder Aktion. Jede Aktion geht über Funktionen in src/game/needs.ts, nicht direkt im Component.
```

**Fertig, wenn:** Gießen und Füttern sich gut anfühlen und die Balken reagieren.

### Session 8: Licht-Schalter und Phasenwechsel

```
PotPou, Session 8: Licht und Phasen.
Baue den Licht-Schalter (18/6 zu 12/12) mit Bestätigungsdialog, der erklärt: längeres Wachstum = mehr Ertrag, aber mehr Zeit. Nur aktiv, wenn timeEngine canFlipLight meldet. Tag/Nacht-Zyklus im Raum nach Lichtplan, die Dunkelphase in der Blüte darf nicht gestört werden (Lampe antippen nachts in der Blüte = Stress). Phasenwechsel mit kurzer Animation ("Puff") und Popup "Budi ist jetzt ein Sämling!". Autoflower-Sorten ohne Schalter.
```

**Fertig, wenn:** Du im Zeitraffer alle Phasen inkl. Lichtwechsel durchspielen kannst.

### Session 9: Budi-Grafik einbauen ★

**Deine Aufgabe vorher:** Das ist dein größter Asset-Block. Liefere B1 bis B8 (Pflanzen-Phasen), B10 (Gesichter) und U1 (Topf) laut `ASSETS.md`. Ohne diese Assets lohnt die Session nicht, dann lieber mit Block C weitermachen und Session 9 später nachholen.

```
PotPou, Session 9: Budi-Grafik.
Ich habe die Budi-Assets in assets/budi/ gelegt (Liste in docs/ASSETS.md). Baue src/components/budi/Budi.tsx aus Ebenen: Topf + Pflanze je Phase + Gesicht je Zustand + Accessoire-Slot. Idle-Animation mit Reanimated (leichtes Atmen/Wippen, Blinzeln alle paar Sekunden), Reaktionen bei Gießen, Füttern, Streicheln (Squash-and-Stretch). Gesicht wechselt automatisch nach Zustand aus needs.ts. Sorten-Farbvarianten über Tint oder separate Dateien, je nachdem was ich geliefert habe.
```

**Fertig, wenn:** Budi lebendig wirkt und jede Phase und jedes Gesicht korrekt erscheint.

### Session 10: Schädlinge, Schimmel, Koma

```
PotPou, Session 10: Krankheiten.
Baue src/game/health.ts mit Tests: Schädlinge (Spinnmilben, Trauermücken) erscheinen zufällig, häufiger bei Vernachlässigung, Schimmel beim Trocknen bei zu hoher Feuchte (ohne Entfeuchter-Upgrade). Schädlinge sitzen sichtbar auf Budi und werden weggetippt. Jede Krankheit senkt die Qualität (Sterne) bis behoben. Koma-Zustand nach COMA_AFTER_REAL_HOURS: Budi grau, Wiederbeleben gegen Münzen (Rewarded-Ad-Option erst als deaktivierter Button, kommt in Session 23).
```

**Fertig, wenn:** Vernachlässigung sichtbare Folgen hat, aber nie endgültig frustriert.

---

## Block C: Minigames

### Session 11: Minigame-Framework ★

```
PotPou, Session 11: Minigame-Framework.
Baue ein gemeinsames Gerüst für alle Minigames mit Skia: Start-Countdown, Pause, Punktestand, Spielende-Screen mit Münzen (MINIGAME_REWARDS aus config.ts), Highscore pro Spiel im Spielstand, Laune-Bonus für Budi. Minigame-Auswahl-Screen mit Karten für jedes Spiel. Baue als Test ein Mini-Beispielspiel "Tipp den Kreis", damit das Gerüst geprüft ist. Achte auf 60 fps und darauf, dass Skia in einem Development Build läuft (falls Expo Go nicht reicht, richte den Dev Build ein und erkläre mir die Schritte).
```

**Fertig, wenn:** Das Beispielspiel flüssig läuft und Münzen gutschreibt.

### Session 12: Schädlings-Smash

**Deine Aufgabe vorher:** M1 bis M4 (Spinnmilbe, Trauermücke, Marienkäfer, Hintergrund-Blatt).

```
PotPou, Session 12: Schädlings-Smash.
Whack-a-Mole auf einem großen Blatt: Spinnmilben und Trauermücken tauchen auf, wegtippen = Punkte, Marienkäfer treffen = Minuspunkte. 45 Sekunden, Tempo steigt. Kombo-Zähler bei schnellen Treffern. Belohnung zusätzlich: Schädlingsschutz für 1 Spieltag (in health.ts). Nutzt das Framework aus Session 11.
```

### Session 13: Tropfen-Fang

**Deine Aufgabe vorher:** M5 bis M8.

```
PotPou, Session 13: Tropfen-Fang.
Topf unten per Wischen hin- und herbewegen, Wasser- und Düngertropfen fangen, Salzklumpen meiden (3 Leben). Wasser füllt den Wasserbalken, Dünger den Nährstoffbalken, max. +40 pro Runde. Fallgeschwindigkeit steigt. Framework aus Session 11 nutzen.
```

### Session 14: Budi Jump, Teil 1 ★

**Deine Aufgabe vorher:** M9 bis M11, Budi-Sprungpose (B11).

```
PotPou, Session 14: Budi Jump Grundmechanik.
Endless Jumper nach oben: Budi springt automatisch, Steuerung per Neigen (expo-sensors Accelerometer) mit Tipp-Steuerung als Alternative in den Einstellungen. Blatt-Plattformen werden zufällig erzeugt, Kamera folgt nach oben, Spielende beim Runterfallen. Nur Grundmechanik, saubere Physik, 60 fps.
```

### Session 15: Budi Jump, Teil 2

```
PotPou, Session 15: Budi Jump Feinschliff.
Plattform-Typen: normal, brechend, federnd. Schwierigkeit steigt mit Höhe. Sammelbare Lichtpunkte für Bonus. Höhenmarke für den eigenen Rekord. Belohnung: Lichtbonus für Budi. Spielende-Screen über das Framework.
```

### Session 16: Minigame-Polish

**Deine Aufgabe vorher:** Sounds S3 bis S6, S11, S12.

```
PotPou, Session 16: Minigame-Polish.
Sounds und Haptik in alle drei Minigames einbauen (Assets in assets/sounds/, Liste in ASSETS.md). Soundeinstellungen (Musik/Effekte getrennt an/aus) im Settings-Screen. Balancing: Belohnungen so einstellen, dass 3 Runden am Tag ca. ein Shop-Upgrade pro Zyklus ermöglichen. Kurzes Tagesziel-System vorbereiten (Datenmodell, noch ohne UI).
```

**Fertig, wenn:** Alle drei Spiele Spaß machen und sich "fertig" anfühlen.

---

## Block D: Progression

### Session 17: Ernte und Trocknen ★

**Deine Aufgabe vorher:** B7 (hängende Pflanze), U7 (Lupe), U8 (Schere), H3 (Trockenraum).

```
PotPou, Session 17: Ernte.
Baue src/game/harvest.ts mit Tests: Ertrag aus BASE_YIELD_UNITS, Wachstumsdauer (vegetativeDaysUsed), Pflegequalität, Laune-Bonus, Sorten-Multiplikator. Qualität 1 bis 5 Sterne aus Krankheiten, Trocknung und Trichom-Lupe. UI: Trichom-Lupe als kleines Erkennungsspiel in der Phase "ready", Ernte mit Schere-Geste, Trocknen-Ansicht, Abschluss-Screen mit Sternen, Münzen ("Kräutermarkt"), Samen-Fragmenten. Danach neuer Samen wählbar. Kein Wort zu Konsum oder echtem Verkauf.
```

**Fertig, wenn:** Ein kompletter Zyklus im Zeitraffer von Samen bis neuem Samen funktioniert.

### Session 18: Shop und Upgrades

**Deine Aufgabe vorher:** U1 Topf-Upgrades, U2 Lampen, U5, U6, Dünger-Varianten, U9 Münz-Icon.

```
PotPou, Session 18: Shop.
Shop-Screen mit NativeWind. Upgrades aus KONZEPT.md (Topf, LED-Lampe, Ventilator + Entfeuchter, Bio-Erde/Spezialdünger, Nützlings-Kit), Preise und Effekte in config.ts. Effekte in die Logik einbauen (z. B. langsamerer Wasserabfall). Gekaufte Upgrades sichtbar im Hauptraum. Tab "Kosmetik" als leere Struktur für Session 24.
```

### Session 19: Sorten und Sammlung

**Deine Aufgabe vorher:** U15 Sortenkarten-Artworks (5), Sorten-Farbvarianten von Budi.

```
PotPou, Session 19: Sorten.
Freischalt-Logik nach STRAINS.unlock in config.ts (Start, Anzahl Ernten, Samen-Fragmente, Level). Einfaches Level-System aus Ernten und Sternen. Sammlung im Album-Screen: Karte pro Sorte mit Seltenheit, Blütedauer, Besonderheit, gesperrt/entsperrt. Samenauswahl nach der Ernte. Jede Sorte bekommt eigene Budi-Sprüche (Textdatei src/content/quotes.ts).
```

### Session 20: Fakten-Karten

**Deine Aufgabe vorher:** U14 Kartenrahmen. Texte T2 prüfen (Liste in KONZEPT.md).

```
PotPou, Session 20: Fakten-Karten.
Lege die Karten aus docs/KONZEPT.md (Abschnitt Lernmodul) in src/content/facts.ts an, mit Phase, Text, Quelle und Link. Bei Phasenwechsel schaltet Budi eine Karte frei (Popup in Budis Stimme). Album-Tab "Wissen" mit allen Karten, gesperrte grau. Quellenlink öffnet den Browser. Baue das Fakten-Quiz-Minigame als einfache UI (kein Skia nötig): 3 Fragen aus freigeschalteten Karten, doppelte Münzen bei voller Punktzahl.
```

### Session 21: Benachrichtigungen und Tagesziele

```
PotPou, Session 21: Notifications und Tagesziele.
Lokale Benachrichtigungen mit expo-notifications: Budi hat bald Durst, Phase gewechselt, erntebereit, Koma droht. Max. 3 pro Tag, keine nachts (22 bis 9 Uhr), in Einstellungen abschaltbar. Texte frech in Budis Stimme. Tagesziele-UI: ein Ziel pro Tag (z. B. "Smashe 50 Milben") mit Belohnungskiste. Berechtigungsabfrage erst nach dem ersten Pflege-Erlebnis, nicht beim Start.
```

**Fertig, wenn:** Du bei geschlossener App eine sinnvolle Benachrichtigung bekommst.

---

## Block E: Geld

### Session 22: Turbo-Kauf mit RevenueCat ★

**Deine Aufgabe vorher:** Apple Developer Account und Google Play Console (siehe STORE_LAUNCH.md), RevenueCat-Account, Produkt "turbo" (Non-Consumable, 9,99 €) in beiden Stores angelegt, API-Keys bereit. Kosmetik-Produkte nach Wunsch.

```
PotPou, Session 22: Käufe.
Integriere RevenueCat (react-native-purchases) in src/lib/purchases.ts. Produkt "turbo" (Non-Consumable): schaltet TURBO_TIME_SCALE über applyTurbo() für die aktuelle und alle künftigen Pflanzen frei, entfernt Zwangswerbung, gibt einen zweiten Pflanzplatz (zweiter Platz nur vorbereiten, wenn zu groß, als eigene Mini-Session). "Käufe wiederherstellen"-Button in Einstellungen. Testkäufe in Sandbox. Erkläre mir genau, was ich in App Store Connect, Play Console und RevenueCat einstellen muss.
```

**Fertig, wenn:** Ein Sandbox-Kauf Turbo aktiviert und Wiederherstellen funktioniert.

### Session 23: Rewarded Ads und Consent ★

**Deine Aufgabe vorher:** AdMob-Konto, App angelegt, Rewarded-Ad-Unit-IDs. Vorher prüfen, ob AdMob die App mit diesem Thema akzeptiert (siehe STORE_LAUNCH.md, Punkt Werbung).

```
PotPou, Session 23: Werbung.
Integriere react-native-google-mobile-ads in src/lib/ads.ts mit Google UMP Consent (DSGVO) beim ersten Start und App Tracking Transparency auf iOS. Nur Rewarded Ads, keine Banner. Einsatzorte: Phase beschleunigen (REWARDED_AD.speedUpPlantDays, max. maxSpeedUpsPerDay), Koma-Wiederbelebung, Ernte-Münzen verdoppeln, Extra-Leben im Minigame. Test-Ad-IDs in Dev, echte IDs nur im Release. Wenn keine Werbung geladen werden kann, Buttons ausblenden statt Fehler zeigen.
```

### Session 24: Kosmetik-Shop

**Deine Aufgabe vorher:** U16 Kosmetik-Items (Sonnenbrille, 3 Hüte, 3 Topf-Skins) als Ebenen passend zu Budi.

```
PotPou, Session 24: Kosmetik.
Kosmetik-Tab im Shop: Items gegen Münzen oder Echtgeld (RevenueCat-Produkte). Anprobieren-Vorschau auf Budi, Ausrüsten über den Accessoire-Slot aus Session 9. Saisonpass vorbereiten (Datenmodell + gesperrte Legendär-Sorte), aber noch nicht verkaufen. Nur Optik, kein Spielvorteil.
```

---

## Block F: Launch

### Session 25: Onboarding und Altersabfrage

**Deine Aufgabe vorher:** Onboarding-Texte (3 bis 4 Screens) grob formulieren.

```
PotPou, Session 25: Onboarding.
Beim ersten Start: Altersbestätigung 18+ (bei Nein: freundlicher Abschied, kein Zugang), dann kurzes geführtes Tutorial im Spiel (Samen pflanzen, gießen, Balken erklären, Minigame zeigen). Überspringbar. Danach Consent-Dialog aus Session 23. Einstellungen: Impressum und Datenschutz als Links (URLs kommen von mir).
```

### Session 26: Sound, Musik, Budi-Stimme

**Deine Aufgabe vorher:** S1, S2, S7 bis S10 (inkl. Budi-Gibberish-Stimme).

```
PotPou, Session 26: Audio.
Hintergrundmusik im Hauptraum (leise, loopend), Soundeffekte für alle Pflege-Aktionen und Phasenwechsel, Budi-Stimme (zufällige Laute bei Antippen und Sprüchen, Tonhöhe je Laune leicht variiert). Respektiert Stummschalter und Settings. Audio darf andere Apps (Spotify) nicht ungefragt stoppen.
```

### Session 27: Robustheit und Bugfixing ★

```
PotPou, Session 27: Robustheit.
Prüfe und härte: Zeitumstellung (Sommer/Winterzeit), Gerätezeit zurückgestellt (Alter darf nie sinken, speichere den höchsten gesehenen Zeitstempel), App wochenlang nicht geöffnet, Spielstand-Migration, Speicherplatz voll, Offline-Betrieb, schneller Doppel-Tap bei Käufen. Schreib Tests für alle Zeit-Kantenfälle. Geh dann PROGRESS.md "Bekannte Bugs" durch und behebe sie.
```

### Session 28: Balancing-Durchlauf

```
PotPou, Session 28: Balancing.
Simuliere mit einem Testskript 3 Spielertypen (täglich aktiv, 1x täglich kurz, nur alle 2 Tage) über 30 Tage: Münzen, Ernten, freigeschaltete Sorten, wann Koma eintritt. Zeig mir die Ergebnisse als Tabelle und schlage Änderungen an config.ts vor. Ändere erst nach meinem OK.
```

**Fertig, wenn:** Ein "1x täglich"-Spieler nie frustriert ins Koma rutscht und nach ca. 2 Wochen die erste seltene Sorte hat.

### Session 29: Build, Icons, interner Test ★

**Deine Aufgabe vorher:** A1 bis A3 (Icon, Adaptive Icon, Splash). Bundle-ID festlegen (z. B. `de.deinname.potpou`).

```
PotPou, Session 29: Release-Build.
Richte EAS Build ein (eas.json mit development, preview, production). App-Name, Bundle-ID, Version, Icon, Adaptive Icon, Splash aus assets/icon/. Release-Checks: Debug-Menü aus, Test-Ad-IDs aus, Logs aus. Build für iOS (TestFlight) und Android (interner Test). Erkläre mir jeden Schritt, den ich selbst im Browser machen muss.
```

**Fertig, wenn:** Du die App über TestFlight bzw. den internen Play-Test auf deinem Handy installiert hast.

### Session 30: Store-Einreichung

**Deine Aufgabe vorher:** A4 bis A9 (Screenshots, Feature Graphic, Datenschutz-URL, Support-URL), Store-Texte, alles aus STORE_LAUNCH.md abgehakt.

```
PotPou, Session 30: Einreichung.
Hilf mir beim Einreichen: Prüf mit mir die Checkliste docs/STORE_LAUNCH.md Punkt für Punkt. Formuliere Store-Beschreibung (DE und EN), Keywords, die Review-Notiz für Apple (Vorlage in STORE_LAUNCH.md) und die Angaben zu Datenschutz/Data Safety passend zu den eingebauten SDKs (RevenueCat, AdMob). Bereite eine Antwortvorlage für den Fall einer Ablehnung nach Richtlinie 1.4.3 vor. Starte dann eas submit.
```

**Fertig, wenn:** Beide Apps "In Review" sind. Danach: Ablehnungen in Ruhe nach der Vorlage beantworten, das ist bei diesem Thema normal.

---

## Nach dem Launch (optional)

- Cloud-Spielstand und Serverzeit mit Supabase
- Zweiter Pflanzplatz (falls in Session 22 ausgelagert)
- Englische Sprache, falls nicht schon dabei
- Saisonpass und Events
- Trim-Master, Trichom-Lupe als eigenes Spiel, Sorten-Memory
