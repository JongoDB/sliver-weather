FROM nginx:1.27-alpine

# tools for templating + self-signed certs
RUN apk add --no-cache openssl gettext

# Put templates in /etc/nginx where the entrypoint expects them
COPY nginx.conf.template /etc/nginx/nginx.conf.template
COPY nginx.http.conf.template /etc/nginx/nginx.http.conf.template

# Custom entrypoint that selects template based on USE_TLS
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Nginx runs in foreground; our script renders then execs nginx
ENTRYPOINT ["/docker-entrypoint.sh"]
