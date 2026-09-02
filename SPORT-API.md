# Odysstream: live sport via TheSportsDB

De sectie "Live sport" op de site (`#sport`) laat zich automatisch bijwerken met echte, actuele wedstrijden en het bijpassende teamlogo, via [TheSportsDB](https://www.thesportsdb.com/documentation). Dit staat helemaal los van de statische Meta-advertenties: die blijven vaste beelden, dat kan niet anders in Ads Manager.

## Hoe het werkt

`app.js` haalt bij het laden van de pagina de eerstvolgende wedstrijden op voor vijf competities: Eredivisie, Belgische Pro League, Champions League, UFC en Formule 1. De zes eerstkomende worden in de bestaande kaarten gezet (dezelfde stijl, dezelfde lay-out), en de eerstvolgende vier in de agenda-strook eronder. Resultaat wordt een uur lang lokaal gecached (`localStorage`), zodat de pagina niet bij elke bezoeker opnieuw de API belast.

**Belangrijk vangnet:** lukt het ophalen niet (geen internet, limiet bereikt, competitie niet beschikbaar), dan blijven gewoon de huidige, met de hand geschreven kaarten in `index.html` staan. De site laat nooit een lege sectie zien.

## De sleutel: waarom je eigen sleutel nodig hebt

In `index.html`, bovenin, staat:

```js
sportsApiKey: "123"
```

`123` is de gratis, gedeelde testsleutel van TheSportsDB. Die werkt, maar is expliciet beperkt tot hun demodata (Premier League e.d.); voor de competities die voor Odysstream ertoe doen (Eredivisie, Belgische competitie, Champions League, UFC, Formule 1) geeft die sleutel geen bruikbare data terug. Dat heb ik zelf getest: met sleutel 123 kwam er voor elke competitie hetzelfde Premier League-voorbeeld terug.

Om echte data te krijgen:

1. Ga naar [thesportsdb.com/pricing](https://www.thesportsdb.com/pricing) en registreer een account via de "Single Developer"-optie, $9/maand. (De "Small Business"-optie op $20/maand is alleen nodig als je ooit meer dan 100 aanvragen per minuut nodig hebt; voor deze site is dat niet aan de orde.)
2. Na het registreren en upgraden staat je persoonlijke API-key in je profiel op thesportsdb.com.
3. Vervang in `index.html` `sportsApiKey: "123"` door jouw eigen sleutel.

Zonder die stap blijft de sectie gewoon werken zoals nu: met de handmatig ingevulde wedstrijden.

## Welke wedstrijden bovenaan komen: de kijkerstrekkers

De site toont niet de eerstvolgende wedstrijden uit de lijst, maar de wedstrijden waar mensen voor inschakelen. Elke wedstrijd krijgt in `app.js` een score:

- Elk team telt mee met gewicht 3 (Ajax, PSV, Feyenoord, Real Madrid, Barcelona, City, Liverpool, United, Arsenal, Chelsea, Bayern, PSG, Inter, Juventus, Milan, Club Brugge, Anderlecht), 2 (subtop: AZ, Twente, Utrecht, Atlético, Dortmund, Leverkusen, Tottenham, Newcastle, Aston Villa, Napoli, Roma, Atalanta, Sevilla, Marseille, Genk, Antwerp, Standard, Union) of 1 (alle andere).
- Twee clubs met gewicht 3 tegenover elkaar: +2 en het label "Topper" op de kaart. Twee clubs met minstens gewicht 2: +1.
- Competitie: Champions League +2, Eredivisie +2 (thuispubliek), Europa League +1, Belgische competitie +1.
- UFC: een genummerd event (UFC 3xx) telt 6, een Fight Night 3. Formule 1: een Grand Prix 5, de Dutch GP 7; trainingen en kwalificaties 1. Valt het event in de komende zeven dagen, dan +2.
- Meer dan twee weken vooruit: -2. Meer dan vier weken: -4.

De zes hoogste scores komen in de kaarten (hooguit twee per competitie, de hoogste als grote kaart), de vier daarna in de agenda-strook, die wel op datum staat. Bij gelijke score wint de eerstvolgende wedstrijd.

Een club toevoegen of zwaarder laten wegen: pas de lijst `TOP` bovenin het sportblok in `app.js` aan. De sleutel is een stukje van de teamnaam zoals TheSportsDB die schrijft, in kleine letters en zonder accenten ("psv" vangt "PSV Eindhoven", "atletico" vangt "Atlético Madrid").

## Competities aanpassen

In `app.js`, bovenaan het sportblok:

```js
var LEAGUES=[4337,4338,4328,4335,4332,4331,4480,4481,4443,4370];
```

Dit zijn de TheSportsDB-ID's voor Eredivisie, Belgische Pro League, Premier League, La Liga, Serie A, Bundesliga, Champions League, Europa League, UFC en Formule 1. Een competitie toevoegen of verwijderen kan door een ID toe te voegen of weg te halen. ID's van andere competities vind je door op thesportsdb.com naar de competitiepagina te gaan; het nummer staat in de URL.

## "Live" is geen seconde-voor-seconde livescore

Echte live standen (doelpunten in real-time) zitten in de V2 API van TheSportsDB en vereisen sowieso een betaalde sleutel. Wat deze koppeling wel doet: als het huidige moment binnen de wedstrijdduur van de aftrap valt, krijgt de kaart het rode "Nu live"-label. Dat is een benadering op basis van de starttijd, geen echte live-feed. Voor de meeste doeleinden (bezoekers laten zien wat er vanavond te zien is) is dat voldoende; voor een seconde-nauwkeurige live-stand is meer werk en een duurdere sleutel nodig.

## Tijdzone en betrouwbaarheid van tijden

De datum/tijd van TheSportsDB wordt hier als UTC geïnterpreteerd en omgerekend naar de tijd van de bezoeker. Bij sommige bronnen (vooral kleinere competities) kan de ingevoerde tijd afwijken. Vandaar staat er in de footer van de site al: "Wedstrijdtijden onder voorbehoud" — laat die zin gewoon staan.
