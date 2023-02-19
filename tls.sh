#!/bin/bash

YELLOW="\033[1;33m"

SETUP_DIR=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )
CACHE_FILE=".cache.marzboard"

if [ ! -x "$(command -v curl)" ] || [ ! -x "$(command -v socat)" ] || [ ! -x "$(command -v cron)" ]; then
  sudo apt update
  sudo apt install -y curl socat cron
fi

if [ -f "$CACHE_FILE" ]; then
  source .cache.marzboard
fi

if [ -z "$EMAIL" ] && [ -z "$DOMAIN" ]; then
  echo "${YELLOW}Your ✉️  ️Email and 🌐 Domain will be stored in $CACHE_FILE file"
fi

if [ -z "$EMAIL" ]; then
  echo '✉️  Enter your email: '
  read EMAIL
  echo $EMAIL >>"$CACHE_FILE"
else
  echo "   ${YELLOW}reusing your cached email: $EMAIL"
fi

if [ -z "$DOMAIN" ]; then
  echo '🌐 Enter the domain: '
  read DOMAIN
  echo $DOMAIN >>"$CACHE_FILE"
else
  echo "   ${YELLOW}reusing your cached domain: $DOMAIN"
fi

if [ ! -x "$(command -v docker)" ]; then
  echo "${YELLOW}[INFO] Installing docker ..."
  curl -fsSL https://get.docker.com | sh
fi

if [ ! -f "~/.acme.sh/acme.sh" ]; then
  curl https://get.acme.sh | sh -s email="$EMAIL"
fi

mkdir -p "$SETUP_DIR/webserver/certs"
~/.acme.sh/acme.sh --issue --standalone -d "$DOMAIN" \
  --key-file "$SETUP_DIR/webserver/certs/key.pem" \
  --fullchain-file "$SETUP_DIR/webserver/certs/fullchain.pem"
