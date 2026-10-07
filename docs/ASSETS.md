# PotPou: Asset-Liste

Alles, was du (oder ein Designer, oder ein KI-Tool mit deiner Nacharbeit) erstellen musst. Jede Zeile hat eine ID, damit Claude Code und du dieselbe Sprache sprechen. Die Spalte "Session" sagt, bis wann du es spätestens brauchst. Bis dahin arbeitet Claude Code mit Platzhaltern.

Priorität: **MVP** = nötig für den Launch, **Später** = Update nach Launch.

## Grundregeln für alle Grafiken

- **Ein Stil für alles.** Erst `DESIGN_GUIDE.md` (D2 bis D4) entscheiden, dann produzieren. Gemischte Stile wirken billig.
- **Format:** PNG mit transparentem Hintergrund, sRGB. Vektor-Quelle (SVG/Figma) immer aufheben.
- **Budi-Ebenen:** Alle auf derselben Leinwand 1024 × 1024 px, Topfboden immer exakt an derselben Stelle (unten mittig, z. B. y = 960). Nur so passen Topf, Pflanze, Gesicht und Hut übereinander.
- **Icons:** 256 × 256 px, genug Rand, gleiche Strichstärke.
- **Hintergründe:** 1290 × 2796 px (Hochformat, deckt große iPhones ab), wichtige Inhalte mittig, oben und unten 15 % Puffer für Notch und Navigation.
- **Dateinamen:** klein, Unterstriche, mit ID-Präfix. Beispiel: `b03_vegetative_small.png`, `b10_face_thirsty.png`.
- **Ablage:** `assets/budi/`, `assets/images/`, `assets/minigames/`, `assets/sounds/`, `assets/icon/`.

## Budi (B)

Tipp, der dir 70 % Arbeit spart: Budis Gesicht sitzt auf dem Topf, nicht auf der Pflanze (Entscheidung D4 im Design Guide). Dann brauchst du nur ein Gesichter-Set für alle Phasen.

| ID | Asset | Details | Prio | Session |
| --- | --- | --- | --- | --- |
| B1 | Keimling | Erdhügel mit kleinem Spross und zwei runden Keimblättern | MVP | 9 |
| B2 | Sämling | 2 bis 3 kleine gezackte Blätter, dünner Stiel | MVP | 9 |
| B3 | Wachstum klein | Buschig, ca. halbe Endgröße, typische gefingerte Blätter | MVP | 9 |
| B4 | Wachstum groß | Volle Größe, dicht, sattgrün | MVP | 9 |
| B5 | Blüte früh | Wie B4 plus kleine weiße Härchen (Blütenansätze) an den Spitzen | MVP | 9 |
| B6 | Blüte voll | Dicke Blütenstände, leicht glitzernd (Harz), etwas gelbliche Blätter unten | MVP | 9 |
| B7 | Trocknen | Abgeschnittene Zweige hängen kopfüber an einer Leine | MVP | 17 |
| B8 | Ernte fertig | Holzkiste mit Ernte und Stern-Schleife (kein Glas, keine Konsumutensilien) | MVP | 17 |
| B9 | Sorten-Varianten | Lila Lotte: lila Blüten (B5, B6). Kölsche Knospe: goldene Blätter. Sativa Sascha: höher und schmaler. Auto-Anton: kleiner und kompakter | MVP für 2, Rest später | 19 |
| B10 | Gesichter-Set | Augen + Mund als eigene Ebene, ca. 12 Stück: neutral, glücklich, sehr glücklich, durstig (Zunge raus), hungrig, müde, schnarcht, gestresst, krank (grünlich), beleidigt, Koma (X-Augen, freundlich nicht gruselig), überrascht | MVP | 9 |
| B11 | Budi Jump | Vereinfachter Budi für das Minigame, 3 Posen: hocken, springen, fallen | MVP | 14 |
| B12 | Blinzeln | 1 Zwischenbild halb geschlossene Augen (für Idle-Animation) | MVP | 9 |

## Hintergründe (H)

| ID | Asset | Details | Prio | Session |
| --- | --- | --- | --- | --- |
| H1 | Grow-Raum Tag | Gemütliche kleine Ecke, Regal, Fenster mit Vorhang, Steckdose für die Lampe | MVP | 5 |
| H2 | Grow-Raum Nacht | Dieselbe Szene abgedunkelt, bläulich, Mond im Fenster | MVP | 8 |
| H3 | Trockenraum | Dunkler Schrank mit Leine | MVP | 17 |

## Gegenstände und UI (U)

| ID | Asset | Details | Prio | Session |
| --- | --- | --- | --- | --- |
| U1 | Töpfe | Standard-Topf (mit Platz fürs Gesicht) + 3 Upgrade-Stufen | MVP | 9, 18 |
| U2 | Lampen | Standard-Lampe (an/aus) + LED-Upgrade (an/aus) | MVP | 5, 18 |
| U3 | Gießkanne | Normal + beim Gießen geneigt | MVP | 7 |
| U4 | Dünger | 2 Flaschen: Wachstum (grünes Etikett), Blüte (lila Etikett) + Spezialdünger | MVP | 7 |
| U5 | Ventilator | Klein, Clip-Ventilator, 2 Frames für Drehen | MVP | 18 |
| U6 | Entfeuchter | Kleine Box mit Wassertank | MVP | 18 |
| U7 | Lupe | Für Trichom-Check | MVP | 17 |
| U8 | Schere | Erntegeste | MVP | 17 |
| U9 | Münze | Spielwährung, eigenes Symbol (z. B. Blatt-Münze) | MVP | 5 |
| U10 | Samen-Fragment | Viertel eines leuchtenden Samens | MVP | 17 |
| U11 | Balken-Icons | Wassertropfen, Nährstoff (Flasche), Licht (Sonne), Laune (Herz) | MVP | 5 |
| U12 | Navigations-Icons | Spiele, Shop, Album, Einstellungen. Alternative: Icon-Set aus @expo/vector-icons, dann nur Farben anpassen | MVP | 5 |
| U13 | Belohnungskiste | Geschlossen + offen | MVP | 21 |
| U14 | Kartenrahmen | Fakten-Karte, 1 Rahmen, oder je Seltenheit eine Farbe | MVP | 20 |
| U15 | Sortenkarten-Bilder | Porträt jeder Sorte (5), kann aus B6-Variante + Hintergrund gebaut werden | MVP für 2 | 19 |
| U16 | Kosmetik | Sonnenbrille, 3 Hüte (Strohhut, Kappe, Krone), 3 Topf-Skins (Gestreift, Gold, Köln-Dom). Ebenen passend zur Budi-Leinwand | MVP: 4 Stück | 24 |
| U17 | Schädlinge auf Budi | Spinnmilbe und Trauermücke klein, Schimmelfleck | MVP | 10 |

## Minigames (M)

| ID | Asset | Details | Prio | Session |
| --- | --- | --- | --- | --- |
| M1 | Spinnmilbe | 2 Frames Krabbeln + "getroffen" | MVP | 12 |
| M2 | Trauermücke | 2 Frames Flattern + "getroffen" | MVP | 12 |
| M3 | Marienkäfer | Freundlich, deutlich anders als Schädlinge | MVP | 12 |
| M4 | Blatt-Hintergrund | Großes Blatt formatfüllend | MVP | 12 |
| M5 | Wassertropfen | | MVP | 13 |
| M6 | Dünger-Kugel | | MVP | 13 |
| M7 | Salzklumpen | Gut unterscheidbar von M6 (Form + Farbe) | MVP | 13 |
| M8 | Hintergrund Tropfen-Fang | Himmel/Gewächshausdach | MVP | 13 |
| M9 | Blatt-Plattformen | Normal, brechend (Risse), federnd (eingerollt) | MVP | 14 |
| M10 | Lichtpunkt | Sammelbares Leuchtteilchen | MVP | 15 |
| M11 | Hintergrund Budi Jump | Vertikal kachelbar (oben und unten nahtlos) | MVP | 14 |

## Sound (S)

| ID | Asset | Details | Prio | Session |
| --- | --- | --- | --- | --- |
| S1 | Gießen | Plätschern, 1 bis 2 s | MVP | 26 |
| S2 | Füttern | "Nom nom" | MVP | 26 |
| S3 | Button-Tap | Weich, kurz | MVP | 16 |
| S4 | Münzen | Klimpern | MVP | 16 |
| S5 | Smash-Treffer | Plopp | MVP | 16 |
| S6 | Sprung | Boing | MVP | 16 |
| S7 | Phasenwechsel | Kleine Fanfare | MVP | 26 |
| S8 | Ernte | Schnipp + Jubel | MVP | 26 |
| S9 | Budi-Stimme | 6 bis 10 kurze Gibberish-Laute (wie bei Pou oder Animal Crossing), fröhlich, fragend, beleidigt | MVP | 26 |
| S10 | Musik Hauptraum | Ruhiger Loop, 1 bis 2 min, lo-fi oder Ukulele | MVP | 26 |
| S11 | Musik Minigames | Schnellerer Loop | MVP | 16 |
| S12 | Fehler/Aua | Kurzer Dämpfer-Sound | MVP | 16 |

Format: `.m4a` oder `.mp3`, Effekte unter 100 KB, Musik unter 2 MB, Lautstärke angeglichen.

## Schriften (F)

| ID | Asset | Vorschlag |
| --- | --- | --- |
| F1 | Überschriften | Fredoka oder Baloo 2 (Google Fonts, frei nutzbar) |
| F2 | Fließtext | Nunito (Google Fonts) |

## App und Store (A)

| ID | Asset | Größe / Format | Session |
| --- | --- | --- | --- |
| A1 | App-Icon | 1024 × 1024 PNG, ohne Transparenz, ohne abgerundete Ecken (macht das System) | 29 |
| A2 | Android Adaptive Icon | Vordergrund 1024 × 1024 mit transparentem Rand (Motiv im inneren ca. 66 %), Hintergrund einfarbig oder Bild | 29 |
| A3 | Splash-Screen | Logo/Budi mittig auf Hintergrundfarbe, ca. 1284 × 2778 | 29 |
| A4 | iPhone-Screenshots | 3 bis 6 Stück, Größe nach aktueller Vorgabe in App Store Connect (große iPhones, z. B. 1320 × 2868) | 30 |
| A5 | Android-Screenshots | 4 bis 8 Stück, Hochformat, z. B. 1080 × 1920 | 30 |
| A6 | Google Feature Graphic | 1024 × 500 PNG/JPG | 30 |
| A7 | App-Vorschau-Video | Optional, 15 bis 30 s | Später |
| A8 | Datenschutzerklärung | Als Webseite, URL nötig | 25, 30 |
| A9 | Support-Seite + Impressum | Webseite oder Notion-Seite, URL nötig | 25, 30 |

Store-Größen ändern sich gelegentlich. Vor dem Export immer kurz in App Store Connect und Play Console nachsehen.

## Texte (T)

| ID | Asset | Details | Session |
| --- | --- | --- | --- |
| T1 | Budi-Sprüche | Ca. 60 kurze Sprüche: Begrüßung, Durst, Hunger, gestreichelt, Phasenwechsel, nachts gestört, je Sorte 3 eigene | 19 |
| T2 | Fakten-Karten | Stehen in KONZEPT.md, nur gegenlesen | 20 |
| T3 | Store-Texte | Untertitel, Beschreibung, Keywords, DE und EN | 30 |

## Wo du was herbekommst

**Selber zeichnen / bauen**

- **Figma** (kostenlos): Vektoren, Ebenen, Export in allen Größen. Ideal für Budi-Ebenen, Icons, Store-Screenshots.
- **Procreate** (iPad) oder **Krita** (kostenlos, Desktop): Wenn du lieber von Hand zeichnest.
- **Rive** (rive.app): Später, falls Budi richtig animiert werden soll. Für das MVP reichen PNG-Ebenen + Reanimated.

**Mit KI erzeugen (dann in Figma nachbearbeiten)**

- **Recraft**: Stark für einheitliche Vektor-Illustrationen und Icon-Sets, exportiert SVG. Gut für konsistenten Stil.
- **Midjourney** oder **ChatGPT-Bildgenerierung**: Gut für Moodboards und erste Charakterentwürfe. Für Konsistenz immer dasselbe Referenzbild und denselben Stil-Prompt verwenden.
- Prompt-Bausteine: "cute kawaii mobile game character, flat vector, thick rounded outline, soft shading, transparent background, centered, consistent style". Gesichter separat generieren lassen ist meist schwer, also eher selbst in Figma zeichnen (Augen + Mund sind einfache Formen).
- Lizenz: Prüfe bei jedem Tool, ob kommerzielle Nutzung im Plan erlaubt ist.

**Fertige freie Assets**

- **Kenney.nl**: Riesige Sammlung kostenloser Game-Assets (CC0), super für UI, Partikel, Platzhalter.
- **itch.io (Game Assets)**: Viele günstige Packs. Immer Lizenz lesen.
- **Google Fonts**: Schriften, frei auch kommerziell.

**Sound**

- **Pixabay Sound Effects und Music**: Kostenlos, kommerziell nutzbar (Lizenz prüfen).
- **freesound.org**: Riesig, aber Lizenzen unterschiedlich (CC0 bevorzugen, CC-BY braucht Namensnennung im Spiel).
- **ElevenLabs Sound Effects**: Effekte per Textbeschreibung, gut für Budi-Laute.
- **jsfxr** (sfxr.me): Kostenlos, für kurze Retro-Sounds wie Sprung und Münzen.
- Budi-Stimme selbst aufnehmen: Ein paar Silben einsprechen, Tonhöhe hochziehen, fertig. Wirkt am persönlichsten.

**Jemanden beauftragen**

- **Fiverr** oder **Upwork**: Suche nach "kawaii mobile game character" oder "2D game asset artist". Ein Budi-Set (B1 bis B12) kostet grob einige hundert Euro, je nach Qualität (Schätzung, Preise schwanken stark).
- Gib einem Designer immer: diese Liste, die Leinwand-Regeln oben, dein Moodboard und die Palette aus dem Design Guide.

## Reihenfolge, die Sinn ergibt

1. Moodboard und Stil festlegen (DESIGN_GUIDE.md)
2. Budi: erst B4 + B10 neutral als Probe, Stil prüfen, dann den Rest
3. H1, U1, U2, U9, U11 (Hauptraum steht)
4. Minigame-Assets pro Spiel, kurz vor der jeweiligen Session
5. Sounds gesammelt vor Session 16 und 26
6. Icon, Splash, Screenshots ganz am Ende, wenn das Spiel final aussieht
