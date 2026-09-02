# Thuisplay

Tweede merk naast Odysstream. Zelfde teksten en werking, eigen naam, eigen kleuren en eigen beeldmerk.

## Wat er verschilt met Odysstream

| | Odysstream (site 1, root) | Thuisplay (site 2, deze map) |
|---|---|---|
| Accentkleur | cyaan `#1FD8FF` | warm goud `#E8B54A` |
| Achtergrond | koel zwartblauw `#0B0D12` | diep nachtblauw `#0A0E1A` |
| Beeldmerk | cirkel met felle punt rechtsboven | afgerond vierkant met play-driehoek |
| Referentiereeks | vanaf 51204 | vanaf 63418 |
| Configvariabele | `window.ODYSSTREAM_CONFIG` | `window.THUISPLAY_CONFIG` |

De referentiereeksen lopen bewust niet door elkaar, zodat je aan het nummer meteen ziet van welk merk een bestelling komt.

## Instellen

Alle koppelingen staan in één blok bovenin `index.html`. Zet in elk geval `whatsapp` op het nummer dat je voor Thuisplay gebruikt.

Het veld `merk` gaat mee in elke lead en staat in het berichtveld in HubSpot. Daardoor kun je hetzelfde HubSpot-formulier voor beide merken gebruiken en toch zien waar een lead vandaan komt. Wil je ze echt gescheiden, maak dan een tweede formulier aan en vul dat `hubspotFormId` hier in.

`verkoopStart` zet je op het moment dat je live gaat: het referentienummer telt vanaf dat moment op, dus je eerste bestelling krijgt dan 63418.

Zie verder `SPORT-API.md` en `KOPPELING.md` in de root van de repo; die uitleg geldt hier één op één.

Live via GitHub Pages: https://alanrza10.github.io/novastream/thuisplay/
