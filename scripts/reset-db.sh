#!/bin/bash
set -e

echo "=== Resetting Database ==="
echo ""

# Check if postgres container is running
if ! docker ps | grep -q oma-postgres; then
    echo "❌ PostgreSQL container is not running."
    echo "   Start it with: docker compose -f docker/docker-compose.yml up -d postgres"
    exit 1
fi

echo "This will drop all data and recreate the schema."
read -p "Are you sure? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Reset cancelled."
    exit 0
fi

echo ""
echo "[1/3] Dropping all tables..."
docker exec oma-postgres psql -U oma_user -d oma_poc -c "
DROP TABLE IF EXISTS audit_artifacts CASCADE;
DROP TABLE IF EXISTS executions CASCADE;
DROP TABLE IF EXISTS policies CASCADE;
DROP TABLE IF EXISTS intents CASCADE;
DROP FUNCTION IF EXISTS generate_artifact_hash() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
" 2>/dev/null || true

echo "[2/3] Recreating schema..."
docker exec -i oma-postgres psql -U oma_user -d oma_poc < database/schema.sql

echo "[3/3] Seeding initial data..."
docker exec -i oma-postgres psql -U oma_user -d oma_poc < database/seed.sql

echo ""
echo "=== Database Reset Complete! ==="
echo ""
echo "Database has been reset with fresh schema and seed data."
