# Quick Deploy Guide

## One-Command Deployment

```bash
chmod +x deploy.sh && ./deploy.sh
```

## Manual Deployment

```bash
# 1. Configure environment
cp env.example .env
nano .env  # Edit with your settings

# 2. Deploy
docker-compose up -d --build

# 3. Check status
docker-compose ps
docker-compose logs -f
```

## Essential Commands

```bash
# View logs
docker-compose logs -f

# Stop
docker-compose down

# Restart
docker-compose restart

# Update
git pull && docker-compose down && docker-compose up -d --build
```

## Files Created

- `Dockerfile` - Container definition
- `docker-compose.yml` - Service orchestration
- `deploy.sh` - Automated deployment script
- `.dockerignore` - Files to exclude from build
- `DOCKER_DEPLOYMENT.md` - Full deployment guide

## Environment Variables

Required in `.env`:
- `PORT` - Server port (default: 3000)
- `GEMINI_API_KEY` - Google Gemini API key
- `SESSION_SECRET` - Random secret (generate with `openssl rand -hex 32`)

Optional:
- `SEARXNG_URL` - Search engine URL
- `HTTPS` - Set to `true` if using SSL

