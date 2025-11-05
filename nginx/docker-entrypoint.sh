#!/bin/sh
set -e

# Use envsubst to substitute environment variables in nginx.conf.template
# and output to nginx.conf
envsubst '${DOMAIN} ${SSL_CERT_NAME} ${SSL_KEY_NAME} ${SLIVER_HTTP_PORT} ${SLIVER_C2_PATH}' \
  < /etc/nginx/nginx.conf.template \
  > /etc/nginx/nginx.conf

# Verify nginx configuration syntax
nginx -t

# Execute the main command (nginx)
exec "$@"

