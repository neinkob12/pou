# Claude Code Instructions: PotPou

PotPou ist ein Pou-artiges Handyspiel (iOS + Android): Der Spieler pflegt eine Cannabispflanze mit Gesicht ("Budi") in Echtzeit vom Samen bis zur Ernte. Das vollständige Konzept steht in `docs/KONZEPT.md`.

## Vor jeder Session

1. Lies `TECH_STACK.md`. Halte dich daran.
2. Lies `docs/SESSIONS.md` nur für die Session, die ich nenne. Arbeite nicht an späteren Sessions vor.
3. Lies `docs/PROGRESS.md` (falls vorhanden), um zu wissen, was schon steht.

## Feste Regeln des Spiels (nicht ändern ohne Rückfrage)

- Alle Balancing-Werte (Phasendauern, Abfallraten, Preise, Sorten) leben ausschließlich in `src/game/config.ts`. Keine Magic Numbers in Komponenten.
- Zeit wird nie per Timer hochgezählt. Der Pflanzenzustand wird immer aus Zeitstempeln berechnet (`src/game/timeEngine.ts`). Die App muss nach Tagen im Hintergrund korrekt weiterlaufen.
- `TIME_SCALE = 10` (1 echter Tag = 10 Pflanzentage), mit Turbo-Kauf `20`.
- Spiellogik ist reines TypeScript ohne React-Import (`src/game/`), damit sie testbar bleibt. Jede neue Logikfunktion bekommt einen Test.
- Inhalt: Keine Darstellung von Konsum, Rauchen, High-Sein, Dosierung oder echtem Verkauf. Budi ist eine Pflanze. Das ist eine harte App-Store-Anforderung (Apple 1.4.3, Google Play Marijuana Policy).
- Keine echten Sortennamen, keine echten Marken, kein Material aus dem Spiel "Pou".

## Code-Konventionen

- TypeScript strict. Keine `any` ohne Kommentar, warum.
- Geteilte Logik in `src/lib/` (technisch) oder `src/game/` (Spielregeln). Keine `/utils`- oder `/services`-Ordner.
- Route-Dateien in `app/` nur für Komposition. Logik gehört in Hooks oder `src/game/`.
- Kleine Komponenten. Wird eine Datei länger als ca. 200 Zeilen, aufteilen.
- Assets nur über `src/lib/assets.ts` referenzieren, nie direkt mit Pfad in Komponenten.
- Fehlt ein Asset, nutze einen klar erkennbaren Platzhalter (farbige Form + Text) und trage es in `docs/PROGRESS.md` unter "Fehlende Assets" ein.

## Am Ende jeder Session

- Aktualisiere `docs/PROGRESS.md`: was fertig ist, was offen ist, fehlende Assets, bekannte Bugs.
- Sag mir in 3 bis 5 Punkten, was ich auf dem Handy testen soll.

## Kommunikation

- Antworte auf Deutsch.
- Sei direkt. Widersprich, wenn etwas keinen Sinn ergibt.
- Benutze keine Gedankenstriche (em dashes).
- Bei Unklarheit: eine konkrete Rückfrage statt raten.
- Neue Libraries sind ok, aber trag sie mit Begründung in `TECH_STACK.md` ein. Größere Architekturwechsel vorher ankündigen.
- Ich habe ADHS: Halte Zusammenfassungen kurz, mit klaren nächsten Schritten.
