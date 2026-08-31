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
git pull origin master

# 3. Build & launch production containers
echo "🐳 Deploying production Docker Compose stack..."
docker compose -f docker/docker-compose.prod.yml down --remove-orphans || true
docker compose -f docker/docker-compose.prod.yml build --pull
docker compose -f docker/docker-compose.prod.yml up -d

# 4. Wait for database readiness
echo "⏳ Waiting for PostgreSQL container to become healthy..."
until docker exec poco-prod-postgres pg_isready -U "${POSTGRES_USER:-postgres}" -d "${POSTGRES_DB:-poco_eldercare}"; do
    sleep 2
done

# 5. Run Prisma migrations
echo "🗄️ Executing Prisma migrations in production..."
docker exec poco-prod-api pnpm --filter @poco/database db:migrate

echo "🎉 Deployment completed successfully!"
