#!/usr/bin/env bash
set -euo pipefail

BACKUP_DIR="/var/backups/poco_postgres"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
FILENAME="poco_backup_${TIMESTAMP}.sql.gz"
RETENTION_DAYS=7

mkdir -p "${BACKUP_DIR}"

echo "📦 Creating compressed PostgreSQL database dump..."
docker exec poco-prod-postgres pg_dump -U "${POSTGRES_USER:-postgres}" "${POSTGRES_DB:-poco_eldercare}" | gzip > "${BACKUP_DIR}/${FILENAME}"

echo "✅ Backup created at ${BACKUP_DIR}/${FILENAME}"

# Cleanup backups older than retention policy
echo "🧹 Removing backups older than ${RETENTION_DAYS} days..."
find "${BACKUP_DIR}" -type f -name "poco_backup_*.sql.gz" -mtime +${RETENTION_DAYS} -exec rm -f {} \;

echo "🎉 Database backup process finished successfully."
