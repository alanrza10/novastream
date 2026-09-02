# Odysstream, Thuisplay en SpitsTV

Drie merken, één repo. Zelfde teksten en werking, eigen naam, kleuren en beeldmerk.

- Root: Odysstream (cyaan). Live via GitHub Pages: https://alanrza10.github.io/novastream/
- `thuisplay/`: Thuisplay (goud). Live via GitHub Pages: https://alanrza10.github.io/novastream/thuisplay/
- `spitstv/`: SpitsTV (limoengroen, prijzen 25 euro hoger). Live via GitHub Pages: https://alanrza10.github.io/novastream/spitstv/

Per site:

- `index.html`, `style.css`, `app.js`, `logos.svg`: de site
- `instellingen.js`: haalt de instellingen uit het beheerportaal op (WhatsApp, IBAN, pixels, films en series)
- `betalen.html`: betaalpagina
- `voorwaarden.html`, `privacy.html`: juridische pagina's

Beheer en hosting:

- `admin/`: het beheerprogramma; elk merk heeft op zijn eigen domein een eigen portaal op `/admin/` met een eigen wachtwoord
- `server/`: Nginx-configuratie, systemd-service en deploy-script voor de VPS
- `INSTALLATIE.md`: stap voor stap de VPS inrichten

Documentatie (geldt voor alle merken):

- `HUISSTIJL.md`: kleuren, fonts, regels
- `KOPPELING.md`: HubSpot en WhatsApp instellen
- `SPORT-API.md`: live sport via TheSportsDB
- `thuisplay/README.md`: wat er bij Thuisplay anders is
- `spitstv/README.md`: wat er bij SpitsTV anders is, met de vergelijking van alle drie
