# PotPou: Design-Leitfaden

Dieser Leitfaden führt dich der Reihe nach durch alle Design-Entscheidungen. Jede Entscheidung hat eine Empfehlung, damit du nicht bei null anfängst. Triff D1 bis D4 vor Session 1, den Rest kurz vor der jeweiligen Session.

Trag deine Entscheidungen direkt hier ein (Feld "Meine Wahl"), dann weiß auch Claude Code Bescheid.

---

## D1: Name (vor Session 1)

**Wichtig:** "PotPou" ist sehr nah an "Pou", einem bekannten Spiel mit eingetragener Marke. Das kann zu Markenproblemen oder einer Store-Ablehnung als Nachahmung führen. Behandle "PotPou" deshalb als Arbeitstitel.

So gehst du vor:

1. 5 bis 10 Namen sammeln. Kriterien: kurz, aussprechbar auf Deutsch und Englisch, nicht direkt "Weed" oder "Kush" im Namen (Store-Review), lustig.
2. Ideen zum Weiterspinnen: Budi Grow, Knospi, Grünling, Leafy Buddy, Bud Buddy, Sprouty.
3. Jeden Kandidaten prüfen: App Store und Play Store durchsuchen, Markenregister (DPMAregister, EUIPO eSearch, für USA TESS/USPTO), Domain und Social-Handles.
4. Im Zweifel einmal kurz anwaltlich prüfen lassen, bevor Icon und Store-Texte entstehen.

Meine Wahl: ________

## D2: Grafikstil (vor Session 1)

| Option | Wirkung | Aufwand | Empfehlung |
| --- | --- | --- | --- |
| Flat Vector Kawaii (dicke runde Konturen, flache Farben, leichte Schatten) | Süß, modern, Store-freundlich | Gering bis mittel, gut mit Figma und KI | **Empfohlen** |
| Pixel Art | Retro, Nische | Mittel, schwer konsistent per KI | Nur wenn du Pixel Art liebst |
| Weiche 3D-Optik (Clay-Look) | Sehr hochwertig | Hoch, braucht 3D-Tools oder starke KI-Nacharbeit | Später für Updates |

Regeln für Flat Vector Kawaii: Konturen 6 bis 8 px auf der 1024er-Leinwand, Konturfarbe dunkelgrün statt schwarz, maximal 2 Schattierungsstufen, alles rund, keine spitzen Ecken.

Meine Wahl: ________

## D3: Farbpalette (vor Session 1)

Startvorschlag, den Claude Code in Session 5 als Theme anlegt:

| Rolle | Farbe | Hex |
| --- | --- | --- |
| Pflanze hell | Frisches Grün | #7BC96F |
| Pflanze dunkel / Konturen | Waldgrün | #2F5D3A |
| Hintergrund | Warmes Creme | #FFF4E0 |
| Lampenlicht | Sonnengelb | #FFD45C |
| Erde / Topf | Terrakotta | #C9734A |
| Akzent 1 (Buttons, Münzen) | Korallenpink | #FF7A8A |
| Akzent 2 (Seltenheit, Blüte) | Lavendel | #A98BE8 |
| Text | Fast Schwarz | #2B2B2B |
| Nacht | Tiefblau | #2A3157 |

Prüfe Kontraste für Text mit einem Kontrast-Checker (z. B. WebAIM Contrast Checker).

Meine Wahl: ________

## D4: Budi als Charakter (vor Session 9, Skizzen ab sofort)

**Empfehlung: Gesicht auf dem Topf.** Die Pflanze wächst oben heraus und wechselt je Phase, das Gesicht bleibt immer an derselben Stelle. Vorteile: ein Gesichter-Set für alle Phasen, Hüte sitzen immer gleich, Budi ist schon als Keimling erkennbar.

Charakterblatt erstellen (eine Figma-Seite):

1. Budi neutral von vorne, Phase "Wachstum groß"
2. Proportionen festhalten: Topf ca. 40 % der Höhe, Augen groß (je ca. 15 % der Topfbreite), weit auseinander
3. Alle 12 Gesichter nebeneinander (B10)
4. Alle Phasen nebeneinander (B1 bis B6) mit Größenvergleich
5. 1 Satz zur Persönlichkeit, z. B. "frech, leicht dramatisch, liebt Licht, hasst nasse Füße"

Persönlichkeit hilft bei allem: Sprüche, Sounds, Animationen.

Meine Wahl: ________

## D5: Schriften (vor Session 5)

Empfehlung: **Fredoka** (Überschriften, rund und frech) + **Nunito** (Text, gut lesbar). Beide über Google Fonts, frei kommerziell nutzbar. Maximal 2 Schriften.

Meine Wahl: ________

## D6: Animation (vor Session 9)

| Option | Aufwand | Empfehlung |
| --- | --- | --- |
| PNG-Ebenen + Reanimated (Wippen, Squash-and-Stretch, Blinzeln durch Bildwechsel) | Gering | **Empfohlen für das MVP** |
| Rive (eine Datei mit State Machine) | Mittel, 1 bis 2 Tage Einarbeitung | Gutes Upgrade nach dem Launch |
| Lottie (aus After Effects) | Hoch ohne AE-Kenntnisse | Nicht empfohlen |

Meine Wahl: ________

## D7: Sound-Stil (vor Session 16)

Empfehlung: Weich und organisch (Holz, Wasser, Ukulele, Lo-Fi), keine schrillen Arcade-Sounds. Budi-Stimme als Gibberish, selbst eingesprochen und hochgepitcht.

Meine Wahl: ________

## D8: Sprache (vor Session 5)

Empfehlung: Alle Texte von Anfang an in einer Datei (`src/content/strings.ts`), Launch auf Deutsch, Englisch als erstes Update. Das kostet jetzt kaum Zeit und spart später viel.

Meine Wahl: ________

---

## Inspiration: Wo du nachsehen solltest

**Ähnliche Spiele zum Anschauen (Mechanik und Gefühl, nicht kopieren)**

- **Pou**: Struktur des Hauptraums, Balken, Minigame-Auswahl, Shop
- **Tamagotchi (Apps und Original)**: Wie wenig nötig ist, damit man sich kümmert
- **Neko Atsume**: Gemütlicher Stil, Sammeln, Benachrichtigungen ohne Druck
- **Finch (Self-Care-Pet)**: Modernes, sanftes Haustier-Design und Tagesziele
- **Plant Nanny**: Pflanzen mit Gesichtern, Gießen als Kernmechanik
- **Pikmin Bloom**: Pflanzen-Thema, sanfte Echtzeit-Mechanik
- **Alto's Adventure** und **Doodle Jump**: Gefühl für Budi Jump

**UI und Screens**

- **Mobbin** (mobbin.com): Echte App-Screens zum Durchsuchen, z. B. Shops, Onboarding, Einstellungen
- **Game UI Database** (gameuidatabase.com): Spiele-UIs nach Screen-Typ sortiert
- **Dribbble** und **Behance**: Suche nach "kawaii game ui", "mobile pet game", "cute game shop ui"
- **Pinterest**: Gut für ein Moodboard, Suche "kawaii plant character", "cute game background room"

**Charakter und Illustration**

- **ArtStation**: Suche "cute plant character", "chibi plant"
- **Rive Community** (rive.app/community): Animierte Charaktere als Beispiel für spätere Animation
- **LottieFiles**: Kleine Animationsideen (Herzen, Münzen, Puff-Effekte)

**Store-Auftritt**

- Schau dir die Store-Seiten der Spiele oben an: Wie sind die ersten 3 Screenshots aufgebaut? Meist großer Text oben, Spielszene darunter.
- Tools für Screenshot-Rahmen: Figma-Community-Vorlagen ("App Store screenshots template"), AppLaunchpad, Previewed

## So baust du dein Moodboard (1 bis 2 Stunden)

1. Neue Figma-Datei oder Pinterest-Board "Budi Moodboard"
2. 10 Bilder zu Charakterstil, 5 zu Räumen, 5 zu UI, 5 zu Farben sammeln
3. Unter jedes Bild ein Wort, was dir daran gefällt ("runde Augen", "warmes Licht")
4. Das Board ist ab jetzt die Referenz für dich, KI-Tools und einen Designer
5. Bei KI-Tools: 2 bis 3 Moodboard-Bilder als Stilreferenz hochladen, nicht nur Text

## Qualitätscheck vor jeder Asset-Lieferung

- Passt es neben den bisherigen Assets (gleiche Kontur, gleiche Farben)?
- Auf dem Handy in echter Größe angesehen, nicht nur am Bildschirm vergrößert?
- Kein Rauch, keine Konsumutensilien, keine echten Marken?
- Transparenter Hintergrund, richtige Leinwandgröße, Dateiname mit ID?
