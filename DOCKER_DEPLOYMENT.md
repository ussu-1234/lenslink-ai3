# Docker Deployment Guide for LensLink AI

This guide will help you deploy LensLink AI on a VPS using Docker and Docker Compose.

## Prerequisites

- VPS with Ubuntu 20.04+ or similar Linux distribution
- Docker installed (version 20.10+)
- Docker Compose installed (version 2.0+)
- Git installed
- Basic knowledge of Linux commands

## Quick Start

### 1. Install Docker and Docker Compose

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add your user to docker group (optional, to run without sudo)
sudo usermod -aG docker $USER
newgrp docker

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version
```

### 2. Clone or Upload Your Project

```bash
# If using Git
git clone https://github.com/ussu-1234/lenslink-ai3.git
cd lenslink-ai3

# Or upload your project files via SCP/SFTP
```

### 3. Configure Environment Variables

```bash
# Copy example env file
cp env.example .env

# Edit .env file with your settings
nano .env
```

Required environment variables:
```env
PORT=3000
NODE_ENV=production
GEMINI_API_KEY=your_gemini_api_key_here
SEARXNG_URL=https://xng.quest.ac
SESSION_SECRET=your_random_secret_key_here
```

Generate a secure session secret:
```bash
openssl rand -hex 32
```

### 4. Deploy Using the Script

```bash
# Make deploy script executable
chmod +x deploy.sh

# Run deployment
./deploy.sh
```

The script will:
- Check Docker installation
- Create necessary directories
- Build the Docker image
- Start the container
- Verify the deployment

### 5. Manual Deployment (Alternative)

If you prefer to deploy manually:

```bash
# Build the image
docker-compose build

# Start the services
docker-compose up -d

# View logs
docker-compose logs -f

# Check status
docker-compose ps
```

## Configuration

### Port Configuration

By default, the application runs on port 3000. To change it:

1. Edit `.env` file:
   ```env
   PORT=8080
   ```

2. Update `docker-compose.yml`:
   ```yaml
   ports:
     - "8080:3000"
   ```

3. Restart:
   ```bash
   docker-compose down
   docker-compose up -d
   ```

### Data Persistence

Data files are persisted using volumes:
- `cameras.json` - Camera database
- `users.json` - User accounts
- `reviews.json` - Camera reviews
- `price-history.json` - Price tracking

These files are mounted from the host, so data persists across container restarts.

### SSL/HTTPS Setup (Production)

For production, use a reverse proxy like Nginx with Let's Encrypt:

1. Install Nginx:
   ```bash
   sudo apt install nginx certbot python3-certbot-nginx
   ```

2. Configure Nginx:
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

3. Get SSL certificate:
   ```bash
   sudo certbot --nginx -d yourdomain.com
   ```

## Management Commands

### View Logs
```bash
docker-compose logs -f
```

### Stop Application
```bash
docker-compose down
```

### Restart Application
```bash
docker-compose restart
```

### Update Application
```bash
# Pull latest code
git pull

# Rebuild and restart
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Access Container Shell
```bash
docker exec -it lenslink-ai sh
```

### View Container Status
```bash
docker-compose ps
docker ps
```

### Backup Data
```bash
# Create backup directory
mkdir -p backups

# Backup JSON files
cp cameras.json backups/cameras-$(date +%Y%m%d).json
cp users.json backups/users-$(date +%Y%m%d).json
cp reviews.json backups/reviews-$(date +%Y%m%d).json
cp price-history.json backups/price-history-$(date +%Y%m%d).json
```

### Restore Data
```bash
# Stop container
docker-compose down

# Restore files
cp backups/cameras-YYYYMMDD.json cameras.json
cp backups/users-YYYYMMDD.json users.json
# ... etc

# Start container
docker-compose up -d
```

## Troubleshooting

### Container Won't Start

1. Check logs:
   ```bash
   docker-compose logs
   ```

2. Check if port is in use:
   ```bash
   sudo netstat -tulpn | grep :3000
   ```

3. Verify .env file:
   ```bash
   cat .env
   ```

### Application Not Accessible

1. Check firewall:
   ```bash
   sudo ufw status
   sudo ufw allow 3000/tcp
   ```

2. Check container status:
   ```bash
   docker-compose ps
   ```

3. Test locally:
   ```bash
   curl http://localhost:3000
   ```

### Permission Issues

If you encounter permission issues with data files:

```bash
# Fix ownership
sudo chown -R $USER:$USER cameras.json users.json reviews.json price-history.json

# Fix permissions
chmod 644 *.json
```

## Security Recommendations

1. **Change Session Secret**: Use a strong random secret in `.env`
2. **Use HTTPS**: Set up SSL/TLS with Nginx and Let's Encrypt
3. **Firewall**: Only expose necessary ports
4. **Regular Updates**: Keep Docker and system updated
5. **Backup**: Regularly backup your data files
6. **Environment Variables**: Never commit `.env` file to Git

## Monitoring

### Health Check

The container includes a health check. View health status:

```bash
docker ps
# Look for "healthy" status
```

### Resource Usage

```bash
# View resource usage
docker stats lenslink-ai
```

## Production Checklist

- [ ] Changed default session secret
- [ ] Set up SSL/HTTPS
- [ ] Configured firewall
- [ ] Set up automated backups
- [ ] Configured monitoring
- [ ] Set up log rotation
- [ ] Updated all API keys
- [ ] Tested deployment
- [ ] Documented custom configurations

## Support

For issues or questions:
1. Check logs: `docker-compose logs -f`
2. Review this documentation
3. Check GitHub issues

