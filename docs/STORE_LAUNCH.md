# PotPou: Store-Launch-Checkliste

Hinweis: Store-Regeln und Formulare ändern sich laufend. Die Punkte hier sind aus meinem Wissensstand, nicht alle frisch recherchiert. Prüfe jeden Punkt kurz in App Store Connect bzw. Play Console, wenn du dort bist.

## Früh erledigen (spätestens vor Session 22)

Diese Dinge haben Wartezeiten, deshalb früh anfangen.

- [ ] **Apple Developer Program** beitreten (99 USD pro Jahr). Als Einzelperson schnell. Als Firma brauchst du eine D-U-N-S-Nummer, das dauert länger.
- [ ] **Google Play Console** Konto (einmalig 25 USD), Identitätsprüfung abschließen.
- [ ] **Google-Testphase einplanen:** Neue private Entwicklerkonten müssen vor dem Produktions-Release einen geschlossenen Test mit einer Mindestzahl an Testern über mindestens 14 Tage laufen lassen (zuletzt 12 Tester). Aktuelle Zahl in der Play Console prüfen. Tester früh organisieren (Freunde, Familie).
- [ ] **Bankkonto und Steuerformulare** in beiden Stores hinterlegen (sonst keine Auszahlung und keine kostenpflichtigen Produkte).
- [ ] **Steuerlich klären:** Einnahmen aus App-Verkäufen sind oft gewerblich, nicht freiberuflich. Kurz mit Steuerberater oder Finanzamt klären, ob du ein Gewerbe anmelden musst.
- [ ] **RevenueCat-Konto**, mit beiden Stores verbinden.
- [ ] **AdMob-Konto.** Vorher die AdMob/Google-Publisher-Richtlinien zu Drogen-Inhalten lesen. Wenn unklar, App anlegen und Status beobachten. Falls Werbung abgelehnt wird: Rewarded Ads streichen, Turbo und Kosmetik tragen den Umsatz.

## Rechtliches (vor Session 25)

- [ ] **Datenschutzerklärung** als Webseite. Muss nennen: lokal gespeicherter Spielstand, RevenueCat (Kaufabwicklung), AdMob (Werbe-ID, Consent), Benachrichtigungen. Generatoren für den Einstieg: z. B. Datenschutz-Generator von e-recht24 oder ähnliche, danach auf die SDKs anpassen.
- [ ] **Impressum**: In Deutschland brauchen auch Apps ein leicht erreichbares Impressum. Link in den Einstellungen und auf der Support-Seite.
- [ ] **Support-Seite** mit Kontakt-E-Mail.
- [ ] **Altersgrenze 18+** in der App (Session 25) und in den Store-Fragebögen konsistent angeben.

## App Store Connect (iOS)

- [ ] App anlegen, Bundle-ID wie in `app.json`
- [ ] **Altersfreigabe-Fragebogen**: Drogen-Referenzen ehrlich angeben. Apple hat das Altersraster 2025 überarbeitet (u. a. 13+, 16+, 18+). Die höchste passende Stufe wählen.
- [ ] **App Privacy (Datenschutz-Labels)**: Angaben passend zu AdMob und RevenueCat (beide haben Doku, welche Daten sie erheben)
- [ ] **App Tracking Transparency**: Text für die Tracking-Abfrage, falls AdMob personalisierte Werbung nutzt
- [ ] In-App-Kauf "turbo" (Non-Consumable, 9,99 €) mit Screenshot und Beschreibung, zur Prüfung mit der App einreichen
- [ ] Screenshots (A4), Untertitel, Beschreibung, Keywords, Support-URL, Datenschutz-URL
- [ ] TestFlight-Test mit dir selbst und 2 bis 3 Freunden
- [ ] **Review-Notiz** (Vorlage unten)

## Google Play Console (Android)

- [ ] App anlegen, Paketname wie in `app.json`
- [ ] **Inhaltsbewertung (IARC-Fragebogen)**: Drogen-Referenzen ehrlich angeben
- [ ] **Zielgruppe**: Nur 18+ auswählen
- [ ] **Data Safety**: Angaben passend zu AdMob und RevenueCat
- [ ] **Werbe-ID-Deklaration**: "Ja, nutzt Werbe-ID" (wegen AdMob)
- [ ] In-App-Produkt "turbo" anlegen
- [ ] Store-Eintrag: Icon 512 × 512, Feature Graphic (A6), Screenshots (A5), Kurz- und Langbeschreibung
- [ ] Interner Test, dann geschlossener Test (Testerzahl und 14 Tage, siehe oben), dann Produktion beantragen

## Inhalt: letzte Prüfung

- [ ] Nirgends Rauchen, Joints, Bongs, Dosierung, Wirkung, "high"
- [ ] Ernte geht an den fiktiven "Kräutermarkt" gegen Münzen, keine echten Händler, keine Links zu Shops oder Seedbanks
- [ ] Keine echten Sortennamen oder Marken, kein Material aus "Pou"
- [ ] Icon und Screenshots wirken süß, nicht wie Werbung für Konsum
- [ ] Fakten-Karten verlinken auf seriöse Quellen

## Vorlage: Review-Notiz für Apple

> PotPou is a casual virtual-pet game for adults (18+). The player cares for a cartoon plant character through real botanical growth stages (germination, seedling, vegetative, flowering, drying) and unlocks short, sourced facts about plant science. The app does not depict, encourage or reference consumption of any substance, does not facilitate any real-world sale, and contains no links to sellers. Harvests are exchanged only for in-game coins at a fictional market. An age gate (18+) is shown on first launch. Optional in-app purchase "Turbo" doubles growth speed and removes interstitial prompts.

(Englisch, weil die Review-Teams meist englisch arbeiten.)

## Vorlage: Antwort bei Ablehnung nach Richtlinie 1.4.3

> Thank you for the review. We would like to clarify that PotPou does not encourage the consumption of illegal drugs. The game focuses exclusively on plant care and botany: there is no depiction of smoking, consumption, effects or dosage anywhere in the app, and no real-world purchase or sale is possible. Educational content is limited to peer-reviewed plant science (sources linked in-app). The app is restricted to adults via an age gate and an 18+ rating. We are happy to adjust specific screens or wording if you can point us to the content of concern.

Wenn Apple bei der Ablehnung bleibt: Konkret nachfragen, welcher Screen das Problem ist, diesen anpassen, neu einreichen. Im Notfall Begriffe neutralisieren (z. B. "Kräuterpflanze") und die Cannabis-Bezüge in den Store-Texten reduzieren.

## Launch-Woche

- [ ] Freunde um ehrliche Bewertungen bitten (keine gekauften Bewertungen, das verstößt gegen die Regeln)
- [ ] Erste Absturz- und Feedback-Meldungen täglich prüfen
- [ ] Ersten Content-Patch (neue Sprüche, Kosmetik) für Woche 2 bis 3 vorbereiten, damit Spieler zurückkommen
