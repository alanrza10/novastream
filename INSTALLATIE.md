# Installatie op de VPS

Drie sites (Odysstream, Thuisplay, SpitsTV) op één VPS, elk op een eigen domein, elk met een eigen beheerportaal op `/admin/`. Nginx serveert de sites; een klein Node-programma (`admin/server.js`, geen externe pakketten) draait de portalen en levert per domein `instellingen.json` aan de site.

Getest uitgangspunt: Ubuntu 22.04 of 24.04, VPS 15 (1 core, 1,5 GB) is ruim voldoende.

## 0. Vooraf: DNS

Zet bij je domeinregistrar voor elk domein een A-record (en AAAA als de VPS IPv6 heeft) naar het IP-adres van de VPS, voor zowel `domein.nl` als `www.domein.nl`. Doe dit eerst; certbot (stap 5) kan pas een certificaat maken als de domeinen naar de server wijzen.

## 1. Server klaarmaken

Log in als root (of met sudo) en draai:

```bash
apt update && apt upgrade -y
apt install -y nginx git curl ufw
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt install -y nodejs
node -v      # 22.x
ufw allow OpenSSH && ufw allow 'Nginx Full' && ufw --force enable
```

## 2. De sites ophalen

```bash
git clone https://github.com/alanrza10/novastream.git /var/www/novastream
chown -R www-data:www-data /var/www/novastream
```

Later bijwerken gaat met `sudo bash /var/www/novastream/server/deploy.sh` (haalt de nieuwste versie van GitHub, herstart het beheerprogramma en herlaadt Nginx).

## 3. Beheerportalen: wachtwoorden en service

Per merk een eigen wachtwoord (minimaal 10 tekens). Je wordt om het wachtwoord gevraagd:

```bash
cd /var/www/novastream/admin
sudo -u www-data node server.js wachtwoord odysstream
sudo -u www-data node server.js wachtwoord thuisplay
sudo -u www-data node server.js wachtwoord spitstv
```

Dit maakt `admin/config.json` (met de wachtwoord-hashes en een geheim voor de inlogsessies). Dat bestand en de map `admin/data/` (de instellingen) staan bewust niet in de repo.

Dan het programma als service, zodat het altijd draait en na een herstart terugkomt:

```bash
cp /var/www/novastream/server/novastream-admin.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable --now novastream-admin
systemctl status novastream-admin --no-pager     # moet "active (running)" zeggen
```

## 4. Nginx

Vervang in `server/nginx-sites.conf` de voorbeelddomeinen (`odysstream.nl`, `thuisplay.nl`, `spitstv.nl`) door je echte domeinen, zowel in het `map`-blok bovenin als in de drie `server_name`-regels. Dan:

```bash
cp /var/www/novastream/server/novastream-gedeeld.conf /etc/nginx/snippets/
cp /var/www/novastream/server/nginx-sites.conf /etc/nginx/sites-available/novastream
ln -s /etc/nginx/sites-available/novastream /etc/nginx/sites-enabled/novastream
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
```

Nu werken de drie sites op http. Controleer: open `http://jouwdomein.nl/` en `http://jouwdomein.nl/admin/`.

## 5. SSL (https) met Let's Encrypt

```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d odysstream.nl -d www.odysstream.nl -d thuisplay.nl -d www.thuisplay.nl -d spitstv.nl -d www.spitstv.nl
```

Kies bij de vraag voor doorsturen naar https (redirect). Certbot past de Nginx-blokken zelf aan en verlengt de certificaten automatisch.

## 6. Instellingen invullen

Ga per domein naar `https://jouwdomein.nl/admin/`, log in met het wachtwoord van dat merk, en vul in:

- WhatsApp-nummer (internationaal, zonder + of spaties)
- Tenaamstelling en IBAN (komen op de betaalpagina)
- Facebook-pixel en TikTok-pixel (alleen het ID; leeg = uit)
- Films en series (titel, ondertitel, posterlink, label)

Alles staat direct live na Opslaan; de site haalt bij elk bezoek `instellingen.json` op. Elk portaal ziet en wijzigt alleen zijn eigen merk.

## Wat waar staat

| Wat | Waar |
|---|---|
| Sites | `/var/www/novastream` (Odysstream), `/thuisplay`, `/spitstv` |
| Beheerprogramma | `/var/www/novastream/admin/server.js`, service `novastream-admin`, poort 3000 (alleen lokaal) |
| Wachtwoorden en geheim | `/var/www/novastream/admin/config.json` |
| Instellingen per merk | `/var/www/novastream/admin/data/<merk>.json` |
| Nginx | `/etc/nginx/sites-available/novastream` en `/etc/nginx/snippets/novastream-gedeeld.conf` |
| Logboek beheerprogramma | `journalctl -u novastream-admin -f` |

## Veelvoorkomende vragen

**Wachtwoord vergeten?** Draai stap 3 opnieuw voor dat merk en herstart: `systemctl restart novastream-admin`.

**Een back-up van de instellingen?** Kopieer de map `admin/data/`. Dat zijn gewone JSON-bestanden.

**Site bijwerken na een wijziging op GitHub?** `sudo bash /var/www/novastream/server/deploy.sh`. De instellingen in `admin/data/` en `config.json` blijven staan.

**Werkt het portaal niet?** `systemctl status novastream-admin` en `journalctl -u novastream-admin -n 50`. Meestal: geen wachtwoord ingesteld, of de map `admin/data` is niet schrijfbaar voor `www-data` (`chown -R www-data:www-data /var/www/novastream`).
