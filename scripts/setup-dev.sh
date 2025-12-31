#!/bin/bash
set -e

echo "=== ZKX OMA POC - Development Setup ==="
echo ""

# Check prerequisites
echo "[1/6] Checking prerequisites..."

if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v forge &> /dev/null; then
    echo "❌ Foundry is not installed. Please install Foundry first."
    echo "   Run: curl -L https://foundry.paradigm.xyz | bash && foundryup"
    exit 1
fi

echo "✅ All prerequisites found!"

# Install npm dependencies
echo ""
echo "[2/6] Installing npm dependencies..."
npm install

# Setup environment file
echo ""
echo "[3/6] Setting up environment file..."
if [ ! -f .env.local ]; then
    cp .env.local.example .env.local
    echo "✅ Created .env.local from template"
else
    echo "ℹ️  .env.local already exists, skipping..."
fi

# Start Docker containers
echo ""
echo "[4/6] Starting Docker containers..."
docker compose -f docker/docker-compose.yml up -d

# Wait for PostgreSQL
echo ""
echo "[5/6] Waiting for PostgreSQL to be ready..."
sleep 3
until docker exec oma-postgres pg_isready -U oma_user 2>/dev/null; do
    echo "  Waiting for PostgreSQL..."
    sleep 2
done
echo "✅ PostgreSQL is ready!"

# Wait for Anvil
echo ""
echo "[6/6] Waiting for Anvil to be ready..."
sleep 3
until curl -s -X POST -H "Content-Type: application/json" \
    --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
    http://localhost:8545 >/dev/null 2>&1; do
    echo "  Waiting for Anvil..."
    sleep 2
done
echo "✅ Anvil is ready!"

# Build contracts
echo ""
echo "Building smart contracts..."
cd contracts
forge build
cd ..
echo "✅ Contracts compiled successfully!"

echo ""
echo "=== Setup Complete! ==="
echo ""
echo "Next steps:"
echo "  1. Deploy contracts: ./scripts/deploy-contracts.sh"
echo "  2. Update contract addresses in .env.local"
echo "  3. Start Next.js dev server: npm run dev"
echo ""
echo "For a quick reset: make reset"
echo "For help: make help"
