FROM nginx:1.25-alpine

# Remove default site so only our config runs
RUN rm -f /etc/nginx/conf.d/default.conf

# Copy our config as the main nginx.conf
COPY nginx.conf /etc/nginx/nginx.conf

# Copy certs (must exist in build context)
RUN mkdir -p /etc/nginx/certs
COPY ubu.jon.devs.crt /etc/nginx/certs/ubu.jon.devs.crt
COPY ubu.jon.devs.key /etc/nginx/certs/ubu.jon.devs.key
RUN chmod 600 /etc/nginx/certs/ubu.jon.devs.key
