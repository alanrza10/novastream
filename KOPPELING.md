# Odysstream: koppeling gratis proef, CRM en WhatsApp

De flow op de site: elke "Probeer gratis"-knop opent het formulier, "Probeer nu gratis" slaat de lead op in het CRM en stuurt de klant door naar WhatsApp met een voorgevuld bericht.

Alle instellingen staan in één blok bovenin `index.html`:

```js
window.NOVA_CONFIG = {
  whatsapp: "31600000000",   // zakelijk WhatsApp-nummer, internationaal, zonder + of spaties
  crm: "hubspot",            // "hubspot" of "none"
  hubspotRegion: "eu1",      // Europees account (app-eu1.hubspot.com)
  hubspotPortalId: "149180645", // HubSpot Portal ID (staat er al in)
  hubspotFormId: "049f154e-e25c-4e6c-b2eb-407860ebda93", // formulier "Gratis proef" (staat er al in)
  leadWebhook: ""            // optioneel: Zapier, Make of eigen backend
};
```

## Stap 1: WhatsApp

Vul bij `whatsapp` het nummer in waar de leads op moeten binnenkomen. Nederlands nummer 06 12345678 wordt `31612345678`.

## Stap 2: HubSpot (gratis)

1. Maak een gratis HubSpot-account aan op hubspot.com (dat doe je zelf, met je eigen e-mailadres).
2. Ga naar Marketing, Formulieren, en maak een nieuw formulier "Gratis proef" met deze velden: Voornaam (firstname), E-mail (email), Telefoonnummer (phone), Bericht (message). Dit zijn standaardvelden, je hoeft niets aan te maken.
3. Portal ID: 149180645 (staat al ingevuld). Je account draait in de EU-regio, daarom staat `hubspotRegion` op `eu1`.
4. Form GUID: open het formulier, kies Delen of Embed, en kopieer de `formId` uit de code.
5. Zet beide in `NOVA_CONFIG`.

Elke inzending komt binnen als contact in HubSpot, met in het bericht-veld: bron (website gratis proef), gekozen plan en apparaat. Zet in HubSpot een pijplijn op met de fases: Nieuw, Code gestuurd, Proef actief, Betaald, Verlopen.

## Zonder CRM

Staat er nog niets ingevuld, dan werkt de site gewoon: de klant gaat naar WhatsApp en de lead wordt tijdelijk in de browser bewaard (`localStorage`, sleutel `nova_leads`) en in de console gelogd. Dat is alleen voor testen.

## Later wisselen van CRM

De functie `lead()` in `index.html` is de enige plek die met het CRM praat. Ander systeem? Alleen die functie aanpassen, of `leadWebhook` gebruiken en via Zapier of Make doorsturen.

## Wat de klant in WhatsApp ziet

```
Hoi Odysstream! Ik wil graag de 24 uur gratis proef starten.
Naam: Alan
Apparaat: Smart-tv
E-mail: alan@voorbeeld.nl
```

Bij een abonnementsknop (3, 6 of 12 maanden) staat er "het abonnement 6 maanden" in plaats van de gratis proef.
