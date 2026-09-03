#!/usr/bin/env bash
# Installeert één merk op één verse Ubuntu 24.04-server. Draai als root:
#   bash installeer.sh odysstream      (of thuisplay / spitstv)
# Daarna: wachtwoord voor het portaal kiezen en certbot draaien (zie INSTALLATIE.md, stap 3 en 5).
set -euo pipefail
MERK="${1:-}"
case "$MERK" in odysstream|thuisplay|spitstv) ;; *) echo "Gebruik: bash installeer.sh odysstream|thuisplay|spitstv"; exit 1;; esac

echo "== 1/5 pakketten"
apt-get update -q && apt-get upgrade -y -q
apt-get install -y -q nginx git curl ufw
if ! command -v node >/dev/null || [ "$(node -v | cut -c2-3)" -lt 18 ]; then
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && apt-get install -y -q nodejs
fi
ufw allow OpenSSH >/dev/null && ufw allow 'Nginx Full' >/dev/null && ufw --force enable >/dev/null

echo "== 2/5 sites ophalen"
if [ -d /var/www/novastream/.git ]; then git -C /var/www/novastream fetch -q origin main && git -C /var/www/novastream reset -q --hard origin/main
else git clone -q https://github.com/alanrza10/novastream.git /var/www/novastream; fi
chown -R www-data:www-data /var/www/novastream

echo "== 3/5 beheerprogramma als service"
cp /var/www/novastream/server/novastream-admin.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable novastream-admin >/dev/null 2>&1 || true

echo "== 4/5 nginx"
cp /var/www/novastream/server/novastream-gedeeld.conf /etc/nginx/snippets/
cp "/var/www/novastream/server/per-server/nginx-$MERK.conf" "/etc/nginx/sites-available/$MERK"
ln -sf "/etc/nginx/sites-available/$MERK" "/etc/nginx/sites-enabled/$MERK"
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

echo "== 5/5 klaar"
echo
echo "Nu nog twee dingen:"
echo "  1) wachtwoord voor het beheerportaal:"
echo "       cd /var/www/novastream/admin && sudo -u www-data node server.js wachtwoord $MERK && systemctl restart novastream-admin"
echo "  2) https zodra het domein naar deze server wijst:"
echo "       apt install -y certbot python3-certbot-nginx && certbot --nginx -d $MERK.com -d www.$MERK.com"
