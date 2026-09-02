#!/usr/bin/env bash
set -euo pipefail

echo "🚀 Starting Poco Elder Care 1GB Droplet Deployment..."

# 1. Ensure 2GB swapfile exists to safeguard 1GB RAM droplet against burst spikes
if [ ! -f /swapfile ]; then
    echo "⚙️ Creating 2GB swapfile for 1GB RAM droplet..."
    fallocate -l 2G /swapfile
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
    echo "✅ Swapfile enabled."
fi

# 2. Pull latest git changes
echo "📥 Pulling latest git repository updates..."
git pull origin main || git pull origin master

# 3. Build & launch production containers with CPU throttling
echo "🐳 Deploying production Docker Compose stack (CPU throttled & sequential)..."

# Limit Docker and BuildKit concurrency to 1 to avoid CPU spikes and memory exhaustion
export COMPOSE_PARALLEL_LIMIT=1
export DOCKER_BUILDKIT=1
export TURBO_CONCURRENCY=1
export UV_THREADPOOL_SIZE=2

# Build images sequentially with low process priority (nice)
NICE_CMD=""
if command -v nice >/dev/null 2>&1; then
    NICE_CMD="nice -n 19"
fi

echo "🔨 Building backend image..."
$NICE_CMD docker compose -f docker/docker-compose.prod.yml build backend

echo "🔨 Building web image..."
$NICE_CMD docker compose -f docker/docker-compose.prod.yml build web

echo "🔨 Building field-app image..."
$NICE_CMD docker compose -f docker/docker-compose.prod.yml build field-app

echo "🚀 Starting containers..."
docker compose -f docker/docker-compose.prod.yml up -d --remove-orphans

# 4. Wait for database readiness
echo "⏳ Waiting for PostgreSQL container to become healthy..."
until docker exec poco-prod-postgres pg_isready -U "${POSTGRES_USER:-postgres}" -d "${POSTGRES_DB:-poco_eldercare}"; do
    sleep 2
done

# 5. Run Prisma migrations & ensure realistic demo data
echo "🗄️ Executing Prisma migrations in production..."
docker exec poco-prod-api pnpm --filter @poco/database db:migrate

echo "🌱 Ensuring database has realistic records..."
docker exec -e ALLOW_PROD_SEED=true poco-prod-api pnpm --filter @poco/database db:seed:realistic || true

# 6. Restart Nginx to connect to fresh container sockets & clear any stale upstream DNS
echo "🔄 Refreshing Nginx reverse proxy connections..."
docker compose -f docker/docker-compose.prod.yml restart nginx

# 7. Verify all services are healthy and responding
echo "🩺 Verifying endpoint connectivity..."
sleep 3
docker exec poco-prod-nginx wget -qO- http://127.0.0.1/api/health >/dev/null 2>&1 && echo "  ✓ Backend API: OK" || echo "  ⚠️ Backend API not ready yet"
docker exec poco-prod-nginx wget -qO- http://127.0.0.1/field/health >/dev/null 2>&1 && echo "  ✓ Field App: OK" || echo "  ⚠️ Field App not ready yet"
docker exec poco-prod-nginx wget -qO- http://127.0.0.1/ >/dev/null 2>&1 && echo "  ✓ Admin Web Portal: OK" || echo "  ⚠️ Admin Web Portal not ready yet"

echo "🎉 Deployment completed successfully!"
