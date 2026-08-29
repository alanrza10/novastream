# Odysstream

Tweede merk naast Thuisplay. Zelfde teksten en werking, eigen naam, eigen kleuren en eigen beeldmerk.

## Wat er verschilt met Odysstream

| | Thuisplay (site 1) | Odysstream (site 2) |
|---|---|---|
| Accentkleur | cyaan `#1FD8FF` | warm goud `#E8B54A` |
| Achtergrond | koel zwartblauw `#0B0D12` | diep nachtblauw `#0A0E1A` |
| Beeldmerk | cirkel met stip | afgerond vierkant met play-driehoek |
| Factuurreeks | vanaf 33761 | vanaf 51204 |
| Configvariabele | `window.NOVA_CONFIG` | `window.THUISPLAY_CONFIG` |

De factuurreeksen lopen bewust niet door elkaar, zodat je aan het nummer meteen ziet van welk merk een bestelling komt.

## Instellen

Alle koppelingen staan in één blok bovenin `index.html`. Zet in elk geval `whatsapp` op het nummer dat je voor Odysstream gebruikt.

Het veld `merk` gaat mee in elke lead en staat in het berichtveld in HubSpot. Daardoor kun je hetzelfde HubSpot-formulier voor beide merken gebruiken en toch zien waar een lead vandaan komt. Wil je ze echt gescheiden, maak dan een tweede formulier aan en vul dat `hubspotFormId` hier in.

`verkoopStart` zet je op het moment dat je live gaat: het factuurnummer telt vanaf dat moment op, dus je eerste bestelling krijgt dan 51204.

Zie verder `SPORT-API.md` en `KOPPELING.md` in de Thuisplay-repo; die uitleg geldt hier één op één.
