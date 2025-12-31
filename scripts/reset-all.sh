#!/bin/bash
set -e

echo "=== ZKX OMA POC - Full Infrastructure Reset ==="
echo ""
echo "WARNING: This will destroy all data and redeploy contracts!"
read -p "Are you sure? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Reset cancelled."
    exit 0
fi

# 1. Stop and remove containers + volumes
echo ""
echo "[1/5] Stopping containers and removing volumes..."
docker compose -f docker/docker-compose.yml down -v

# 2. Start containers
echo ""
echo "[2/5] Starting containers..."
docker compose -f docker/docker-compose.yml up -d

# 3. Wait for PostgreSQL
echo ""
echo "[3/5] Waiting for PostgreSQL to be ready..."
sleep 3
until docker exec oma-postgres pg_isready -U oma_user 2>/dev/null; do
    echo "  Waiting for PostgreSQL..."
    sleep 2
done
echo "  ✅ PostgreSQL is ready!"

# 4. Wait for Anvil
echo ""
echo "[4/5] Waiting for Anvil to be ready..."
sleep 3
until curl -s -X POST -H "Content-Type: application/json" \
    --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
    http://localhost:8545 >/dev/null 2>&1; do
    echo "  Waiting for Anvil..."
    sleep 2
done
echo "  ✅ Anvil is ready!"

# 5. Deploy contracts
echo ""
echo "[5/5] Deploying smart contracts..."
./scripts/deploy-contracts.sh

echo ""
echo "=== Reset Complete! ==="
echo ""
echo "Infrastructure is ready for development."
echo ""
echo "Next steps:"
echo "  1. Update contract addresses in .env.local (when Step 4 is implemented)"
echo "  2. Start Next.js: npm run dev"
echo "  3. Run tests: npm test"
