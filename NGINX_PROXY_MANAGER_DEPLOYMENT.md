# Nginx Proxy Manager Deployment Guide for LensLink AI

This guide covers deploying LensLink AI with Nginx Proxy Manager (NPM) as a reverse proxy for SSL/TLS termination and domain management.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation Overview](#installation-overview)
3. [Installing Nginx Proxy Manager](#installing-nginx-proxy-manager)
4. [Deploying LensLink AI](#deploying-lenslink-ai)
5. [Configuring NPM](#configuring-npm)
6. [SSL Certificate Setup](#ssl-certificate-setup)
7. [Troubleshooting](#troubleshooting)
8. [Maintenance](#maintenance)

---

## Prerequisites

- VPS with Ubuntu 20.04+ or similar Linux distribution
- Root or sudo access
- Domain name pointing to your VPS IP
- Basic knowledge of Docker and Linux commands

---

## Installation Overview

The deployment consists of two main components:

1. **Nginx Proxy Manager** - Handles reverse proxy, SSL certificates, and domain routing
2. **LensLink AI** - Your application running in a Docker container

Both run as Docker containers, with NPM managing external access and SSL.

---

## Installing Nginx Proxy Manager

### Step 1: Install Docker and Docker Compose

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add your user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version
```

### Step 2: Create NPM Directory Structure

```bash
# Create directory for NPM
mkdir -p ~/nginx-proxy-manager
cd ~/nginx-proxy-manager

# Create docker-compose file for NPM
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  app:
    image: 'jc21/nginx-proxy-manager:latest'
    container_name: nginx-proxy-manager
    restart: unless-stopped
    ports:
      - '80:80'      # HTTP
      - '443:443'    # HTTPS
      - '81:81'      # Admin Web Port
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

# Start NPM
docker-compose up -d

# Wait for NPM to start (about 30 seconds)
sleep 30
```

### Step 3: Access NPM Admin Interface

1. Open your browser and go to: `http://YOUR_VPS_IP:81`
2. Default login credentials:
   - **Email:** `admin@example.com`
   - **Password:** `changeme`

3. **IMPORTANT:** Change the default password immediately!

---

## Deploying LensLink AI

### Step 1: Clone/Upload Your Project

```bash
# Navigate to your projects directory
cd ~
git clone https://github.com/ussu-1234/lenslink-ai3.git
cd lenslink-ai3

# Or upload your project files via SCP/SFTP
```

### Step 2: Configure Environment

```bash
# Copy example env file
cp env.example .env

# Edit .env file
nano .env
```

Configure these variables in `.env`:

```env
# Server Configuration
PORT=3000
NODE_ENV=production

# API Keys
GEMINI_API_KEY=your_gemini_api_key_here
SEARXNG_URL=https://xng.quest.ac

# Session Secret (generate with: openssl rand -hex 32)
SESSION_SECRET=your_generated_secret_here

# HTTPS (set to false - NPM handles SSL)
HTTPS=false
```

### Step 3: Deploy LensLink AI

```bash
# Make deploy script executable
chmod +x deploy.sh

# Run deployment
./deploy.sh
```

Or manually:

```bash
docker-compose up -d --build
```

### Step 4: Verify LensLink AI is Running

```bash
# Check container status
docker ps | grep lenslink-ai

# Check logs
docker logs lenslink-ai

# Test local access
curl http://localhost:3000
```

You should see the HTML response from your application.

---

## Configuring NPM

### Step 1: Connect NPM to LensLink AI Network

Since LensLink AI runs on a separate network, we need to connect NPM to it:

```bash
# Connect NPM container to LensLink network
docker network connect lenslink-network nginx-proxy-manager

# Verify connection
docker network inspect lenslink-network
```

You should see `nginx-proxy-manager` in the containers list.

### Step 2: Create Proxy Host in NPM

1. **Login to NPM Admin** (`http://YOUR_VPS_IP:81`)

2. **Go to "Proxy Hosts"** → Click **"Add Proxy Host"**

3. **Configure Details Tab:**
   - **Domain Names:** `yourdomain.com` (and `www.yourdomain.com` if needed)
   - **Scheme:** `http`
   - **Forward Hostname/IP:** `lenslink-ai` (container name)
   - **Forward Port:** `3000`
   - **Cache Assets:** ✅ (optional, recommended)
   - **Block Common Exploits:** ✅ (recommended)
   - **Websockets Support:** ✅ (if your app uses WebSockets)

4. **Click "Save"**

### Step 3: Test HTTP Access

1. Open `http://yourdomain.com` in your browser
2. You should see your LensLink AI application

---

## SSL Certificate Setup

### Option 1: Let's Encrypt (Free SSL)

1. **In NPM Admin**, go to **"SSL Certificates"** → **"Add SSL Certificate"**

2. **Select "Let's Encrypt"**

3. **Configure:**
   - **Domain Names:** `yourdomain.com, www.yourdomain.com`
   - **Email Address:** Your email (for certificate expiration notices)
   - **Agree to Terms:** ✅
   - **Use a DNS Challenge:** Leave unchecked (unless using wildcard)

4. **Click "Save"**

5. **Wait for certificate generation** (usually 1-2 minutes)

6. **Go back to Proxy Hosts** → Edit your proxy host

7. **Go to "SSL" tab:**
   - **SSL Certificate:** Select your Let's Encrypt certificate
   - **Force SSL:** ✅ (recommended)
   - **HTTP/2 Support:** ✅ (recommended)
   - **HSTS Enabled:** ✅ (recommended)
   - **HSTS Subdomains:** ✅ (if you have subdomains)

8. **Click "Save"**

9. **Test HTTPS:** Open `https://yourdomain.com`

### Option 2: Custom SSL Certificate

If you have your own SSL certificate:

1. **In NPM Admin**, go to **"SSL Certificates"** → **"Add SSL Certificate"**

2. **Select "Custom"**

3. **Upload:**
   - Certificate (`.crt` file)
   - Private Key (`.key` file)
   - Optional: Certificate Chain (`.pem` file)

4. **Click "Save"**

5. **Attach to Proxy Host** (same as Let's Encrypt steps above)

---

## Advanced Configuration

### Custom Nginx Configuration

If you need custom Nginx directives:

1. In NPM, edit your Proxy Host
2. Go to **"Advanced"** tab
3. Add custom Nginx configuration:

```nginx
# Example: Custom headers
location / {
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header Host $host;
    
    # Increase timeouts for long-running requests
    proxy_read_timeout 300s;
    proxy_connect_timeout 75s;
}
```

### WebSocket Support

If your application uses WebSockets:

1. Edit Proxy Host → **"Details"** tab
2. Enable **"Websockets Support"**
3. In **"Advanced"** tab, add:

```nginx
proxy_http_version 1.1;
proxy_set_header Upgrade $http_upgrade;
proxy_set_header Connection "upgrade";
```

### Rate Limiting

Add rate limiting in **"Advanced"** tab:

```nginx
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;

location /api/ {
    limit_req zone=api_limit burst=20 nodelay;
}
```

---

## Troubleshooting

### Issue: Cannot Access Application

**Check 1: Container Status**
```bash
docker ps | grep lenslink-ai
# Should show container as "Up"
```

**Check 2: Container Logs**
```bash
docker logs lenslink-ai
# Look for errors
```

**Check 3: Network Connectivity**
```bash
# From NPM container, test connection
docker exec nginx-proxy-manager ping -c 3 lenslink-ai
```

**Check 4: Port Binding**
```bash
# Verify port is accessible
curl http://localhost:3000
```

**Check 5: NPM Proxy Host Configuration**
- Verify Forward Hostname is `lenslink-ai` (not IP address)
- Verify Forward Port is `3000`
- Check if domain DNS is pointing to your VPS IP

### Issue: SSL Certificate Not Working

**Check 1: DNS Configuration**
```bash
# Verify DNS is pointing to your VPS
dig yourdomain.com
nslookup yourdomain.com
```

**Check 2: Port 80/443 Open**
```bash
# Check firewall
sudo ufw status
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

**Check 3: Let's Encrypt Rate Limits**
- Let's Encrypt has rate limits (50/week per domain)
- If you hit the limit, wait or use staging environment

### Issue: 502 Bad Gateway

This usually means NPM can't reach the LensLink AI container.

**Solution:**
```bash
# Ensure NPM is connected to LensLink network
docker network connect lenslink-network nginx-proxy-manager

# Or use IP address instead of container name
# In NPM, set Forward Hostname/IP to: 172.18.0.2
# (Get IP with: docker inspect lenslink-ai | grep IPAddress)
```

### Issue: Session/Cookie Issues

If sessions aren't working, add to NPM **"Advanced"** tab:

```nginx
proxy_cookie_path / "/; Secure; SameSite=None" if $scheme = "https";
proxy_cookie_path / "/; SameSite=Lax" if $scheme = "http";
```

---

## Maintenance

### Updating LensLink AI

```bash
cd ~/lenslink-ai3

# Pull latest code
git pull

# Rebuild and restart
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Check logs
docker logs -f lenslink-ai
```

### Updating Nginx Proxy Manager

```bash
cd ~/nginx-proxy-manager

# Pull latest image
docker-compose pull

# Restart
docker-compose up -d
```

### Backup

**Backup LensLink AI Data:**
```bash
# Create backup directory
mkdir -p ~/backups/lenslink-ai

# Backup JSON files
cp ~/lenslink-ai3/*.json ~/backups/lenslink-ai/

# Backup with date
tar -czf ~/backups/lenslink-ai-$(date +%Y%m%d).tar.gz ~/lenslink-ai3/*.json
```

**Backup NPM Configuration:**
```bash
# Backup NPM data
tar -czf ~/backups/npm-$(date +%Y%m%d).tar.gz ~/nginx-proxy-manager/data
```

### Monitoring

**Check Container Health:**
```bash
# LensLink AI
docker ps | grep lenslink-ai
docker stats lenslink-ai

# NPM
docker ps | grep nginx-proxy-manager
docker stats nginx-proxy-manager
```

**View Logs:**
```bash
# LensLink AI logs
docker logs -f lenslink-ai

# NPM logs
docker logs -f nginx-proxy-manager
```

---

## Security Best Practices

1. **Change Default NPM Password** - Immediately after first login
2. **Use Strong Session Secret** - Generate with `openssl rand -hex 32`
3. **Enable Firewall** - Only open necessary ports (80, 443, 22, 81)
4. **Keep Updated** - Regularly update Docker images
5. **Use HTTPS** - Always use SSL in production
6. **Enable Security Headers** - In NPM Advanced tab
7. **Regular Backups** - Automate backups of data files
8. **Monitor Logs** - Check logs regularly for issues

---

## Quick Reference

### Essential Commands

```bash
# Start LensLink AI
cd ~/lenslink-ai3 && docker-compose up -d

# Stop LensLink AI
cd ~/lenslink-ai3 && docker-compose down

# View LensLink AI logs
docker logs -f lenslink-ai

# Restart NPM
cd ~/nginx-proxy-manager && docker-compose restart

# Connect NPM to LensLink network
docker network connect lenslink-network nginx-proxy-manager

# Check network connections
docker network inspect lenslink-network
```

### Ports

- **80** - HTTP (NPM)
- **443** - HTTPS (NPM)
- **81** - NPM Admin Interface
- **3000** - LensLink AI (internal, not exposed externally)

### Default Credentials

- **NPM Admin:** `admin@example.com` / `changeme` (CHANGE IMMEDIATELY!)

---

## Support

For issues:
1. Check container logs: `docker logs lenslink-ai`
2. Check NPM logs: `docker logs nginx-proxy-manager`
3. Verify network connectivity
4. Review this documentation
5. Check GitHub issues

---

## Additional Resources

- [Nginx Proxy Manager Documentation](https://nginxproxymanager.com/guide/)
- [Docker Documentation](https://docs.docker.com/)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)

