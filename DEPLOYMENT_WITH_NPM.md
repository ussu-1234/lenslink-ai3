# Quick Deployment Guide: LensLink AI with Nginx Proxy Manager

> **Already have NPM installed?** See [`DEPLOYMENT_WITH_EXISTING_NPM.md`](DEPLOYMENT_WITH_EXISTING_NPM.md) instead!

## Overview

This guide provides a streamlined deployment process for LensLink AI using Nginx Proxy Manager (NPM) for reverse proxy and SSL management. This guide includes NPM installation.

## Architecture

```
Internet → NPM (Port 80/443) → LensLink AI Container (Port 3000)
```

- **NPM** handles SSL/TLS, domain routing, and external access
- **LensLink AI** runs internally, accessible only through NPM

---

## Step-by-Step Deployment

### 1. Install Docker & Docker Compose

```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
newgrp docker

sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 2. Install Nginx Proxy Manager

```bash
mkdir -p ~/nginx-proxy-manager && cd ~/nginx-proxy-manager

cat > docker-compose.yml << 'EOF'
version: '3.8'
services:
  app:
    image: 'jc21/nginx-proxy-manager:latest'
    container_name: nginx-proxy-manager
    restart: unless-stopped
    ports:
      - '80:80'
      - '443:443'
      - '81:81'
    volumes:
      - ./data:/data
      - ./letsencrypt:/etc/letsencrypt
    networks:
      - npm-network
networks:
  npm-network:
    driver: bridge
    name: npm-network
EOF

docker-compose up -d
```

**Access NPM:** `http://YOUR_VPS_IP:81`
- Email: `admin@example.com`
- Password: `changeme` (change immediately!)

### 3. Deploy LensLink AI

```bash
cd ~
git clone https://github.com/ussu-1234/lenslink-ai3.git
cd lenslink-ai3

# Configure environment
cp env.example .env
nano .env  # Add GEMINI_API_KEY and generate SESSION_SECRET

# Deploy
chmod +x deploy.sh
./deploy.sh
```

### 4. Connect NPM to LensLink Network

```bash
docker network connect lenslink-network nginx-proxy-manager
```

### 5. Configure Proxy Host in NPM

1. Login to NPM: `http://YOUR_VPS_IP:81`
2. Go to **"Proxy Hosts"** → **"Add Proxy Host"**
3. **Details Tab:**
   - Domain Names: `yourdomain.com`
   - Scheme: `http`
   - Forward Hostname/IP: `lenslink-ai`
   - Forward Port: `3000`
   - ✅ Cache Assets
   - ✅ Block Common Exploits
   - ✅ Websockets Support
4. Click **"Save"**

### 6. Add SSL Certificate

1. Go to **"SSL Certificates"** → **"Add SSL Certificate"**
2. Select **"Let's Encrypt"**
3. Domain Names: `yourdomain.com, www.yourdomain.com`
4. Email: Your email
5. ✅ Agree to Terms
6. Click **"Save"** (wait 1-2 minutes)
7. Edit your Proxy Host → **"SSL"** tab
8. Select your certificate
9. ✅ Force SSL
10. ✅ HTTP/2 Support
11. ✅ HSTS Enabled
12. Click **"Save"**

### 7. Test

Visit `https://yourdomain.com` - Your app should be live!

---

## Troubleshooting

### 502 Bad Gateway

```bash
# Ensure NPM is connected to LensLink network
docker network connect lenslink-network nginx-proxy-manager

# Verify container is running
docker ps | grep lenslink-ai
```

### Cannot Access Application

```bash
# Check logs
docker logs lenslink-ai

# Test local access
curl http://localhost:3000

# Verify network
docker network inspect lenslink-network
```

### SSL Not Working

```bash
# Check DNS
dig yourdomain.com

# Check firewall
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

---

## Maintenance

### Update LensLink AI

```bash
cd ~/lenslink-ai3
git pull
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Update NPM

```bash
cd ~/nginx-proxy-manager
docker-compose pull
docker-compose up -d
```

### Backup

```bash
# Backup LensLink data
tar -czf backup-$(date +%Y%m%d).tar.gz ~/lenslink-ai3/*.json

# Backup NPM config
tar -czf npm-backup-$(date +%Y%m%d).tar.gz ~/nginx-proxy-manager/data
```

---

## Quick Commands

```bash
# Start LensLink AI
cd ~/lenslink-ai3 && docker-compose up -d

# View logs
docker logs -f lenslink-ai

# Restart NPM
cd ~/nginx-proxy-manager && docker-compose restart

# Connect networks
docker network connect lenslink-network nginx-proxy-manager
```

---

For detailed documentation, see `NGINX_PROXY_MANAGER_DEPLOYMENT.md`

