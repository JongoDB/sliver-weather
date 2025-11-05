#!/bin/sh
set -e

# Check if required environment variables are set
if [ -z "$DOMAIN" ]; then
  echo "ERROR: DOMAIN environment variable is not set"
  echo "Please ensure your .env file is configured with DOMAIN=your-domain-or-ip.com"
  exit 1
fi

if [ -z "$SSL_CERT_NAME" ]; then
  SSL_CERT_NAME="${DOMAIN}.crt"
fi

if [ -z "$SSL_KEY_NAME" ]; then
  SSL_KEY_NAME="${DOMAIN}.key"
fi

# Use envsubst to substitute environment variables in nginx.conf.template
# and output to nginx.conf
envsubst '${DOMAIN} ${SSL_CERT_NAME} ${SSL_KEY_NAME} ${SLIVER_HTTP_PORT} ${SLIVER_C2_PATH}' \
  < /etc/nginx/nginx.conf.template \
  > /etc/nginx/nginx.conf

# Verify nginx configuration syntax
nginx -t

# Execute the main command (nginx)
exec "$@"

