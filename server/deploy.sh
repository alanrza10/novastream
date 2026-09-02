#!/usr/bin/env bash
# Nieuwe versie van de sites ophalen van GitHub en live zetten. Draai op de VPS:  sudo /var/www/novastream/server/deploy.sh
set -euo pipefail
cd /var/www/novastream
git fetch -q origin main
git reset -q --hard origin/main
chown -R www-data:www-data /var/www/novastream
systemctl restart novastream-admin
nginx -t -q && systemctl reload nginx
echo "Live: $(git log -1 --format='%h %s')"
