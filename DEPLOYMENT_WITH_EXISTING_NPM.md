# Deploy LensLink AI with Existing Nginx Proxy Manager

This guide is for users who already have Nginx Proxy Manager (NPM) running on their VPS.

## Prerequisites

- ✅ Nginx Proxy Manager already installed and running
- ✅ Docker and Docker Compose installed
- ✅ Domain name pointing to your VPS IP

## Quick Deployment

### Step 1: Deploy LensLink AI

```bash
# Clone or upload your project
cd ~
git clone https://github.com/ussu-1234/lenslink-ai3.git
cd lenslink-ai3

# Configure environment
cp env.example .env
nano .env  # Add your GEMINI_API_KEY and generate SESSION_SECRET
```

**Required in `.env`:**
```env
PORT=3000
NODE_ENV=production
GEMINI_API_KEY=your_gemini_api_key_here
SESSION_SECRET=$(openssl rand -hex 32)  # Generate this
HTTPS=false  # NPM handles SSL
```

### Step 2: Deploy with Docker

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

### Step 3: Connect to NPM Network

Find your NPM container name and network:

```bash
# Find NPM container name
docker ps | grep nginx-proxy-manager

# Find NPM network name
docker inspect <npm-container-name> | grep -A 10 Networks
```

**Option A: Connect LensLink to NPM's network**

```bash
# If NPM uses default bridge network
docker network connect bridge lenslink-ai

# Or if NPM uses a custom network (e.g., npm-network)
docker network connect npm-network lenslink-ai
```

**Option B: Connect NPM to LensLink's network**

```bash
# Connect NPM container to LensLink network
docker network connect lenslink-network <npm-container-name>
```

**Option C: Use host network (simplest)**

If you prefer, you can modify `docker-compose.yml` to use host network:

```yaml
services:
  lenslink-ai:
    # ... other config ...
    network_mode: "host"
    # Remove the networks section
```

Then NPM can access it via `localhost:3000` or `127.0.0.1:3000`.

### Step 4: Verify Connection

```bash
# Check if containers can communicate
docker exec <npm-container-name> ping -c 3 lenslink-ai

# Or test from host
curl http://localhost:3000
```

### Step 5: Configure Proxy Host in NPM

1. **Access NPM Admin**: `http://YOUR_VPS_IP:81`

2. **Go to "Proxy Hosts"** → **"Add Proxy Host"**

3. **Details Tab:**
   - **Domain Names:** `yourdomain.com` (and `www.yourdomain.com` if needed)
   - **Scheme:** `http`
   - **Forward Hostname/IP:** 
     - If using Docker network: `lenslink-ai`
     - If using host network: `127.0.0.1` or `localhost`
   - **Forward Port:** `3000`
   - ✅ **Cache Assets**
   - ✅ **Block Common Exploits**
   - ✅ **Websockets Support** (if your app uses WebSockets)

4. **Click "Save"**

5. **Test HTTP**: Visit `http://yourdomain.com`

### Step 6: Add SSL Certificate

1. **In NPM**, go to **"SSL Certificates"** → **"Add SSL Certificate"**

2. **Select "Let's Encrypt"**

3. **Configure:**
   - **Domain Names:** `yourdomain.com, www.yourdomain.com`
   - **Email Address:** Your email
   - ✅ **Agree to Terms**

4. **Click "Save"** (wait 1-2 minutes for certificate generation)

5. **Edit your Proxy Host** → **"SSL" tab:**
   - **SSL Certificate:** Select your Let's Encrypt certificate
   - ✅ **Force SSL**
   - ✅ **HTTP/2 Support**
   - ✅ **HSTS Enabled**

6. **Click "Save"**

7. **Test HTTPS**: Visit `https://yourdomain.com`

## Troubleshooting

### 502 Bad Gateway

**Problem:** NPM can't reach LensLink AI container.

**Solution 1: Check network connection**
```bash
# Verify containers are on same network
docker network inspect <network-name>

# Test connectivity
docker exec <npm-container-name> ping lenslink-ai
```

**Solution 2: Use IP address instead**
```bash
# Get LensLink container IP
docker inspect lenslink-ai | grep IPAddress

# In NPM, use this IP instead of container name
```

**Solution 3: Use host network**
Modify `docker-compose.yml` to use `network_mode: "host"` and use `127.0.0.1:3000` in NPM.

### Container Name Not Resolving

If NPM can't resolve `lenslink-ai`:

1. **Use container IP:**
   ```bash
   docker inspect lenslink-ai | grep IPAddress
   # Use this IP in NPM Forward Hostname/IP field
   ```

2. **Or use host network mode** (see Option C above)

### Port Already in Use

If port 3000 is already in use:

1. **Change port in `.env`:**
   ```env
   PORT=3001
   ```

2. **Update `docker-compose.yml` ports:**
   ```yaml
   ports:
     - "127.0.0.1:3001:3000"
   ```

3. **Update NPM Forward Port** to match

## Quick Commands

```bash
# View LensLink AI logs
docker logs -f lenslink-ai

# Restart LensLink AI
docker-compose restart

# Update LensLink AI
cd ~/lenslink-ai3
git pull
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Check network connections
docker network inspect lenslink-network
docker network inspect <npm-network-name>

# Connect networks
docker network connect <npm-network-name> lenslink-ai
```

## Network Configuration Options

### Option 1: Connect to NPM's Network (Recommended)

```bash
# Find NPM network
docker inspect <npm-container-name> | grep NetworkMode
# or
docker network ls

# Connect LensLink to NPM network
docker network connect <npm-network-name> lenslink-ai
```

### Option 2: Connect NPM to LensLink's Network

```bash
# Connect NPM to LensLink network
docker network connect lenslink-network <npm-container-name>
```

### Option 3: Use Host Network (Simplest)

Edit `docker-compose.yml`:
```yaml
services:
  lenslink-ai:
    # ... existing config ...
    network_mode: "host"
    # Remove or comment out:
    # networks:
    #   - lenslink-network
```

Then in NPM, use:
- Forward Hostname/IP: `127.0.0.1` or `localhost`
- Forward Port: `3000`

## Verification Checklist

- [ ] LensLink AI container is running: `docker ps | grep lenslink-ai`
- [ ] Container is accessible: `curl http://localhost:3000`
- [ ] NPM can reach container (check network connection)
- [ ] Proxy host configured in NPM
- [ ] Domain DNS points to VPS IP
- [ ] SSL certificate added and enabled
- [ ] HTTPS redirect working
- [ ] Application accessible via domain

## Next Steps

- Set up automated backups
- Configure monitoring
- Set up log rotation
- Review security settings

For detailed troubleshooting, see `NGINX_PROXY_MANAGER_DEPLOYMENT.md`

