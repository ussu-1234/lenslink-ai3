#!/bin/bash

# LensLink AI Docker Deployment Script
# This script automates the deployment process on a VPS

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="lenslink-ai"
COMPOSE_FILE="docker-compose.yml"
ENV_FILE=".env"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}LensLink AI Docker Deployment${NC}"
echo -e "${GREEN}========================================${NC}"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo -e "${RED}Error: Docker Compose is not installed. Please install Docker Compose first.${NC}"
    exit 1
fi

# Use 'docker compose' if available, otherwise 'docker-compose'
if docker compose version &> /dev/null; then
    DOCKER_COMPOSE="docker compose"
else
    DOCKER_COMPOSE="docker-compose"
fi

echo -e "${YELLOW}Using: $DOCKER_COMPOSE${NC}"

# Check if .env file exists
if [ ! -f "$ENV_FILE" ]; then
    echo -e "${YELLOW}Warning: .env file not found. Creating from env.example...${NC}"
    if [ -f "env.example" ]; then
        cp env.example "$ENV_FILE"
        echo -e "${YELLOW}Please edit .env file with your configuration before continuing.${NC}"
        echo -e "${YELLOW}Press Enter to continue after editing, or Ctrl+C to cancel...${NC}"
        read
    else
        echo -e "${YELLOW}Creating basic .env file...${NC}"
        cat > "$ENV_FILE" << EOF
# Server Configuration
PORT=3000
NODE_ENV=production

# API Keys
GEMINI_API_KEY=
SEARXNG_URL=https://xng.quest.ac

# Session Secret (CHANGE THIS IN PRODUCTION!)
SESSION_SECRET=$(openssl rand -hex 32)
EOF
        echo -e "${YELLOW}Created .env file. Please review and update it.${NC}"
        echo -e "${YELLOW}Press Enter to continue after reviewing, or Ctrl+C to cancel...${NC}"
        read
    fi
fi

# Create data directory if it doesn't exist
if [ ! -d "data" ]; then
    echo -e "${YELLOW}Creating data directory...${NC}"
    mkdir -p data
fi

# Ensure JSON data files exist
echo -e "${YELLOW}Checking data files...${NC}"
[ -f "cameras.json" ] || echo '[]' > cameras.json
[ -f "users.json" ] || echo '[]' > users.json
[ -f "reviews.json" ] || echo '[]' > reviews.json
[ -f "price-history.json" ] || echo '[]' > price-history.json

# Stop existing containers
echo -e "${YELLOW}Stopping existing containers...${NC}"
$DOCKER_COMPOSE -f "$COMPOSE_FILE" down 2>/dev/null || true

# Remove old images (optional, uncomment if you want to force rebuild)
# echo -e "${YELLOW}Removing old images...${NC}"
# docker rmi ${PROJECT_NAME}_lenslink-ai 2>/dev/null || true

# Build and start containers
echo -e "${YELLOW}Building Docker image...${NC}"
$DOCKER_COMPOSE -f "$COMPOSE_FILE" build --no-cache

echo -e "${YELLOW}Starting containers...${NC}"
$DOCKER_COMPOSE -f "$COMPOSE_FILE" up -d

# Wait for container to be healthy
echo -e "${YELLOW}Waiting for application to start...${NC}"
sleep 5

# Check if container is running
if docker ps | grep -q "$PROJECT_NAME"; then
    echo -e "${GREEN}✓ Container is running${NC}"
else
    echo -e "${RED}✗ Container failed to start${NC}"
    echo -e "${YELLOW}Checking logs...${NC}"
    $DOCKER_COMPOSE -f "$COMPOSE_FILE" logs
    exit 1
fi

# Get container port
CONTAINER_PORT=$(grep -E "^\s*-\s*\"\${PORT" "$COMPOSE_FILE" | head -1 | sed 's/.*:\([0-9]*\):.*/\1/' || echo "3000")
ACTUAL_PORT=$(grep "^PORT=" "$ENV_FILE" 2>/dev/null | cut -d'=' -f2 || echo "3000")

# Check if Nginx Proxy Manager is running
NPM_CONTAINER=$(docker ps --format "{{.Names}}" | grep -i "nginx-proxy-manager\|npm" | head -1)
if [ ! -z "$NPM_CONTAINER" ]; then
    echo -e "${YELLOW}Nginx Proxy Manager detected: ${GREEN}$NPM_CONTAINER${NC}"
    
    # Find NPM network
    NPM_NETWORK=$(docker inspect "$NPM_CONTAINER" 2>/dev/null | grep -A 5 "Networks" | grep -oP '(?<=")[^"]+network[^"]*' | head -1)
    
    if [ ! -z "$NPM_NETWORK" ]; then
        echo -e "${YELLOW}Connecting LensLink AI to NPM network: ${GREEN}$NPM_NETWORK${NC}"
        docker network connect "$NPM_NETWORK" lenslink-ai 2>/dev/null && \
            echo -e "${GREEN}✓ Connected to NPM network${NC}" || \
            echo -e "${YELLOW}Already connected or using different network${NC}"
    else
        # Try connecting NPM to LensLink network
        echo -e "${YELLOW}Connecting NPM to LensLink network...${NC}"
        docker network connect lenslink-network "$NPM_CONTAINER" 2>/dev/null && \
            echo -e "${GREEN}✓ Connected NPM to LensLink network${NC}" || \
            echo -e "${YELLOW}Network connection may need manual setup${NC}"
    fi
    
    echo -e ""
    echo -e "${YELLOW}Next steps:${NC}"
    echo -e "  1. Access NPM Admin: ${GREEN}http://YOUR_VPS_IP:81${NC}"
    echo -e "  2. Add Proxy Host:"
    echo -e "     - Domain: yourdomain.com"
    echo -e "     - Forward Hostname/IP: ${GREEN}lenslink-ai${NC} (or ${GREEN}127.0.0.1${NC} if using host network)"
    echo -e "     - Forward Port: ${GREEN}3000${NC}"
    echo -e "  3. Add SSL certificate (Let's Encrypt)"
    echo -e "  4. See ${GREEN}DEPLOYMENT_WITH_EXISTING_NPM.md${NC} for detailed instructions"
    echo -e ""
else
    echo -e "${YELLOW}Nginx Proxy Manager not detected.${NC}"
    echo -e "${YELLOW}If you have NPM installed, see ${GREEN}DEPLOYMENT_WITH_EXISTING_NPM.md${NC} for setup${NC}"
    echo -e ""
fi

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "Application is running on: ${GREEN}http://localhost:${ACTUAL_PORT}${NC}"
echo -e ""
echo -e "Useful commands:"
echo -e "  View logs:        ${YELLOW}$DOCKER_COMPOSE -f $COMPOSE_FILE logs -f${NC}"
echo -e "  Stop:             ${YELLOW}$DOCKER_COMPOSE -f $COMPOSE_FILE down${NC}"
echo -e "  Restart:          ${YELLOW}$DOCKER_COMPOSE -f $COMPOSE_FILE restart${NC}"
echo -e "  View status:      ${YELLOW}$DOCKER_COMPOSE -f $COMPOSE_FILE ps${NC}"
echo -e "  Shell access:     ${YELLOW}docker exec -it ${PROJECT_NAME} sh${NC}"
echo -e ""
echo -e "Documentation:"
echo -e "  NPM Setup:        ${YELLOW}DEPLOYMENT_WITH_NPM.md${NC}"
echo -e "  Full Guide:       ${YELLOW}NGINX_PROXY_MANAGER_DEPLOYMENT.md${NC}"
echo -e ""

