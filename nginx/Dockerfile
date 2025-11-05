FROM nginx:1.25-alpine

# Install gettext for envsubst
RUN apk add --no-cache gettext

# Remove default site so only our config runs
RUN rm -f /etc/nginx/conf.d/default.conf

# Copy our config template (will be processed by entrypoint)
COPY nginx.conf.template /etc/nginx/nginx.conf.template

# Copy entrypoint script
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Create certs directory (certs will be mounted as volume)
RUN mkdir -p /etc/nginx/certs

# Use custom entrypoint
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
