# Sliver v1.7.1 + builder deps + autostart HTTP listener (stable)
FROM golang:1.22-bookworm

ARG SLIVER_VERSION=v1.7.1
ARG SLIVER_URL_BASE=https://github.com/BishopFox/sliver/releases/download
ARG SLIVER_UID=999
ARG SLIVER_GID=999

RUN apt-get update \
 && apt-get install -y --no-install-recommends \
      ca-certificates curl openssl \
      libpcap0.8 libsqlite3-0 libxml2 libxslt1.1 \
      build-essential pkg-config zip unzip nasm protobuf-compiler \
      mingw-w64 binutils-mingw-w64 g++-mingw-w64 \
      gosu \
 && rm -rf /var/lib/apt/lists/*

RUN groupadd -g ${SLIVER_GID} sliver \
 && useradd -r -u ${SLIVER_UID} -g sliver -m -d /home/sliver sliver

# Prebuilt server
RUN set -eux; \
    ARCH="$(dpkg --print-architecture)"; \
    case "$ARCH" in amd64) SARCH=amd64 ;; arm64|aarch64) SARCH=arm64 ;; *) echo "unsupported: $ARCH" && exit 1 ;; esac; \
    curl -L "${SLIVER_URL_BASE}/${SLIVER_VERSION}/sliver-server_linux-${SARCH}" -o /opt/sliver-server; \
    chmod +x /opt/sliver-server

RUN mkdir -p /home/sliver/.sliver /home/sliver/builds \
 && chown -R sliver:sliver /home/sliver

# ENTRYPOINT:
# - fix ownership (for bind mounts)
# - start a background helper that waits a moment and brings up the HTTP listener
# - exec sliver-server in the foreground (PID 1), so the container stays up
RUN printf '%s\n' \
'#!/bin/sh' \
'set -e' \
'SLIVER_HOME="/home/sliver"' \
': "${SLIVER_HTTP_PORT:=8080}"' \
': "${SLIVER_AUTOSTART_HTTP:=1}"' \
'mkdir -p "$SLIVER_HOME/.sliver" "$SLIVER_HOME/builds" || true' \
'chown -R sliver:sliver "$SLIVER_HOME" || true' \
'' \
'if [ "$SLIVER_AUTOSTART_HTTP" = "1" ]; then' \
'  ( sleep 3; gosu sliver /opt/sliver-server http --lhost 0.0.0.0 --lport "$SLIVER_HTTP_PORT" || true ) & ' \
'fi' \
'' \
'echo "[entrypoint] launching sliver-server (foreground) ..."' \
'exec gosu sliver /opt/sliver-server' \
> /usr/local/bin/entrypoint.sh \
 && chmod +x /usr/local/bin/entrypoint.sh

WORKDIR /home/sliver
EXPOSE 80 443
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD []
