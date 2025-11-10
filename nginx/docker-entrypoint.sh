#!/bin/sh
set -e

: "${DOMAIN:?ERROR: DOMAIN environment variable is required}"

USE_TLS="${USE_TLS:-false}"
SSL_CERT_NAME="${SSL_CERT_NAME:-${DOMAIN}.crt}"
SSL_KEY_NAME="${SSL_KEY_NAME:-${DOMAIN}.key}"
CERT_DIR="/etc/nginx/certs"

# Optional vars for upstreams/paths
SLIVER_HTTP_PORT="${SLIVER_HTTP_PORT:-8080}"
SLIVER_C2_PATH="${SLIVER_C2_PATH:-/api/news/}"

export DOMAIN SSL_CERT_NAME SSL_KEY_NAME SLIVER_HTTP_PORT SLIVER_C2_PATH

echo "[entrypoint] DOMAIN=${DOMAIN} USE_TLS=${USE_TLS}"
echo "[entrypoint] CERT_DIR=${CERT_DIR} CERT=${SSL_CERT_NAME} KEY=${SSL_KEY_NAME}"

TEMPLATE="/etc/nginx/nginx.conf.template"

if [ "${USE_TLS}" = "true" ]; then
  mkdir -p "${CERT_DIR}"
  CRT="${CERT_DIR}/${SSL_CERT_NAME}"
  KEY="${CERT_DIR}/${SSL_KEY_NAME}"

  if [ ! -f "${CRT}" ] || [ ! -f "${KEY}" ]; then
    echo "[entrypoint] No certs found at ${CRT}/${KEY}. Generating self-signed..."
    cat > /tmp/openssl.cnf <<EOF
[req]
distinguished_name=req_distinguished_name
x509_extensions = v3_req
prompt = no

[req_distinguished_name]
CN = ${DOMAIN}

[v3_req]
subjectAltName = @alt_names

[alt_names]
DNS.1 = ${DOMAIN}
EOF
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
      -keyout "${KEY}" -out "${CRT}" -config /tmp/openssl.cnf >/dev/null 2>&1
    chmod 600 "${KEY}"
    echo "[entrypoint] Self-signed cert created."
  else
    echo "[entrypoint] Using existing certs."
  fi
else
  TEMPLATE="/etc/nginx/nginx.http.conf.template"
  echo "[entrypoint] TLS disabled; using HTTP template."
fi

# Render template -> /etc/nginx/nginx.conf
envsubst '${DOMAIN} ${SSL_CERT_NAME} ${SSL_KEY_NAME} ${SLIVER_HTTP_PORT} ${SLIVER_C2_PATH}' \
  < "${TEMPLATE}" > /etc/nginx/nginx.conf

nginx -t
exec nginx -g 'daemon off;'
