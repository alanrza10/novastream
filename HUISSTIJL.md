# Nova Stream: huisstijl

Dit document ligt vast voordat er een regel CSS wordt geschreven. Alles wat er gebouwd wordt, wordt hiertegen afgezet. Wijk je af: zeg in één zin waarom.

## 1. Wat, voor wie, welke emotie

Wat: conversie-landingspagina voor een IPTV-abonnement met een gratis 24-uurs proefperiode.
Voor wie: mensen die nu betalen voor drie of vier losse streamingdiensten en sport missen. Ze scannen op hun telefoon, twijfelen of het betrouwbaar is, en willen vanavond nog kijken.
Emotionele opdracht: energie en vertrouwen tegelijk. Cinematisch groot, maar niet schreeuwerig. Eén ding moet elke keer opvallen: gratis proberen.

## 2. Register

Retail met een redactionele kop. Structuur is donker en neutraal, de kleur komt uit de content (posters, sport, events) en uit precies één accent dat bijna alleen op de proef-CTA staat. Dat is de Nike-les: het merk dat het meest met kleur geassocieerd wordt, kleurt zijn interface niet.

## 3. Kleur

Basis is bijna-zwart met een blauwe ondertoon, geen puur zwart. De referentiesite gebruikt #0B0D12 als theme-color; die toon nemen we over als vertrekpunt omdat hij cinematisch leest zonder dood te zijn.

| Token | Waarde | Gebruik |
|---|---|---|
| bg | #0B0D12 | paginabasis |
| surface | #12151C | kaarten, secties die iets omhoog komen |
| surface-2 | #1A1E27 | hover, inputs, tweede laag |
| border | #262B36 | 1px randen, overal dezelfde |
| text | #F2F4F8 | koppen en body |
| text-soft | #9AA3B2 | ondersteunende tekst, labels |
| text-mute | #5F6878 | meta, footer |
| accent | #1FD8FF | proef-CTA, actieve staat, één lijn of glow per scherm |
| accent-hover | #5CE4FF | hover op accent |
| on-accent | #06121A | tekst op een accentvlak |

Regel: accent op maximaal 1 op de 10 elementen. Als een scherm meer cyaan heeft dan dat, is het geen accent meer. Geen tweede accent. Rood, oranje en groen komen alleen voor in posters en in semantische staten (live-badge, fout, gelukt), gedempt.

Live-badge: #FF3B5C op 12px, uitsluitend voor "LIVE" en "vanavond". Dat is een semantische kleur, geen merkkleur.

Gradient: alleen als betekenis, nooit als decoratie. Eén toegestaan gebruik: een radiale glow van accent naar transparant achter de hero-titel, maximaal 20% opaciteit. Geen paars-naar-roze.

## 4. Typografie

Eén familie: Archivo (Omnibus-Type, Google Fonts, variable met breedte-as 62 tot 125).

| Rol | Snede | Grootte | Tracking | Regelhoogte |
|---|---|---|---|---|
| Display hero | Archivo, wdth 125, wght 800 | 88 desktop / 48 mobiel | -0.03em | 0.95 |
| Sectiekop | Archivo, wdth 125, wght 700 | 48 | -0.025em | 1.05 |
| Kaartkop | Archivo, wdth 100, wght 600 | 20 / 24 | -0.02em | 1.2 |
| Body | Archivo, wdth 100, wght 400 | 16 / 18 | 0 | 1.5 |
| UI, knop | Archivo, wdth 100, wght 600 | 14 / 16 | 0 | 1 |
| Label, eyebrow | Archivo, wdth 110, wght 600, caps | 12 | +0.08em | 1 |
| Prijs | Archivo, wdth 100, wght 700, tabular-nums | 48 | -0.03em | 1 |

Schaal: 12, 14, 16, 18, 20, 24, dan een gat, dan 48, 64, 88. Niets in het gat.
Gewichten: 400, 600, 700, 800 voor display. Meer niet.

Waarom Archivo: één familie die van compact tot breed loopt, dus koppen kunnen breed en cinematisch zonder een tweede font. Het is geen AI-default (geen Space Grotesk, Poppins, Montserrat) en heeft een herkomst.

## 5. Ruimte, vorm, diepte

Spacing: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128 (sectiepadding). Buiten deze schaal heb je een reden nodig.
Container: 1200px, zijmarge 24 mobiel / 48 desktop.

Radii, een schaal van drie:
- 6px: badges, inputs, kleine chips
- 12px: kaarten, posters, prijsblokken
- 999px: knoppen (pill)

Randen: 1px, altijd border-kleur. Randen doen het werk, niet schaduwen.

Schaduw, twee niveaus:
- rust: geen
- verheven: 0 0 32px rgba(0,0,0,.45) (zacht, geen offset)
- accent-glow: 0 0 32px rgba(31,216,255,.35), uitsluitend op de primaire proef-CTA

## 6. Componenten

Primaire knop (de proef-CTA): accentvlak, on-accent tekst, pill, 16px 600, padding 16 op 28, accent-glow. Tekstvarianten: "Probeer 24 uur gratis", "Gratis uitproberen", "Start je gratis dag". Altijd zonder creditcard-eis in de subregel.
Secundaire knop: transparant, 1px border, text-kleur, pill. Hover: surface-2.
Kaart: surface, 1px border, radius 12, padding 24.
Poster: 2:3, radius 12, titel eronder in 14 600, jaar in text-soft 12.
Eventkaart: 16:9 beeld, live-badge linksboven, datum en tijd in eyebrow-stijl, titel 20 600.
Eyebrow boven elke sectiekop: 12px caps, accentkleur is hier toegestaan als het de enige accentplek in die sectie is.

## 7. Logo

Woordmerk: NOVA in Archivo wdth 125 wght 800, STREAM ernaast in wdth 100 wght 400 in text-soft. Beeldmerk: een cirkel met een enkele felle punt rechtsboven (de nova), in accentkleur. Werkt monochroom op donker en op licht, en als favicon op 16px.

## 8. Nooit

Em-dashes in interfacetekst. Emoji als icoon. Een tweede accentkleur. Glassmorphism. Aftelklokken en nep-schaarste. Paars-roze gradients. Font-groottes tussen 24 en 48. Puur #000 of puur #fff.

## 9. Wat we van de referentie overnemen en wat niet

Overnemen: de donkere basis, 24-uur-gratis als rode draad, drie prijsblokken met prijs per maand erbij, vooraf betaald en geen automatische verlenging, WhatsApp als support, iDEAL en Bancontact zichtbaar, een sectie die de cowboys in de markt afzet tegen ons.
Niet overnemen: de rustige toon. Nova Stream is groter, meer cinema, meer sport, meer bewegend beeld. En geen kloon van de structuur: zelfde discipline, eigen ontwerp.
