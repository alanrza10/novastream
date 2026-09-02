# SpitsTV

Derde merk naast Odysstream en Thuisplay. Exact dezelfde site en werking als Odysstream, met eigen naam, eigen kleuren, eigen beeldmerk en een prijs die per pakket 25 euro hoger ligt.

## Wat er verschilt

| | Odysstream (root) | Thuisplay (`thuisplay/`) | SpitsTV (`spitstv/`) |
|---|---|---|---|
| Accentkleur | cyaan `#1FD8FF` | warm goud `#E8B54A` | limoengroen `#A6FF3F` |
| Achtergrond | koel zwartblauw `#0B0D12` | diep nachtblauw `#0A0E1A` | groenzwart `#0A0F0C` |
| Beeldmerk | cirkel met felle punt | afgerond vierkant met play-driehoek | gekantelde ruit met kern |
| 3 maanden | € 39,99 | € 39,99 | € 64,99 |
| 6 maanden | € 59,99 | € 59,99 | € 84,99 |
| 12 maanden | € 99,99 | € 99,99 | € 124,99 |
| Referentiereeks | vanaf 51204 | vanaf 63418 | vanaf 42017 |
| Configvariabele | `window.ODYSSTREAM_CONFIG` | `window.THUISPLAY_CONFIG` | `window.SPITSTV_CONFIG` |

De referentiereeksen lopen bewust niet door elkaar, zodat je aan het nummer meteen ziet van welk merk een bestelling komt.

## Instellen

Alle koppelingen staan in één blok bovenin `index.html` (en gespiegeld in `betalen.html`). Zet in elk geval `whatsapp` op het nummer dat je voor SpitsTV gebruikt.

Het veld `merk` gaat mee in elke lead en staat in het berichtveld in HubSpot, dus hetzelfde HubSpot-formulier werkt voor alle drie de merken. Wil je ze gescheiden, maak dan een apart formulier aan en vul dat `hubspotFormId` hier in.

`verkoopStart` zet je op het moment dat je live gaat: het referentienummer telt vanaf dat moment op, dus je eerste bestelling krijgt dan 42017.

Prijzen aanpassen: `index.html` (banner, hero, rekentool, prijskaarten, sticky balk), `app.js` (`JAARPRIJS` en `PRIJZEN`), `betalen.html` (`PRIJZEN` en standaardbedrag) en `voorwaarden.html` (prijstabel).

Zie verder `SPORT-API.md` en `KOPPELING.md` in de root van de repo; die uitleg geldt hier één op één.

Live via GitHub Pages: https://alanrza10.github.io/novastream/spitstv/
