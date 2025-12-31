#!/bin/bash
set -e

echo "=== Deploying Smart Contracts to Anvil ==="
echo ""

cd contracts

# Check if Anvil is running
if ! curl -s -X POST -H "Content-Type: application/json" \
    --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
    http://localhost:8545 >/dev/null 2>&1; then
    echo "❌ Anvil is not running on localhost:8545"
    echo "   Start it with: docker compose up -d anvil"
    exit 1
fi

echo "✅ Anvil is running"
echo ""

# Build contracts first
echo "[1/3] Building contracts..."
forge build

echo ""
echo "[2/3] Deploying contracts to Anvil..."

# Use Anvil's default first account
# Private key for account[0]: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
# Address: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266

forge script script/Deploy.s.sol:DeployScript \
  --rpc-url http://localhost:8545 \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
  --broadcast \
  -vvv

echo ""
echo "[3/3] Extracting deployed addresses..."

# Extract addresses from broadcast files
BROADCAST_DIR="broadcast/Deploy.s.sol/31337"
if [ -d "$BROADCAST_DIR" ]; then
    LATEST_RUN=$(ls -t "$BROADCAST_DIR"/run-latest.json 2>/dev/null || echo "")

    if [ -f "$LATEST_RUN" ]; then
        echo ""
        echo "=== Deployment Complete! ==="
        echo ""
        echo "📝 To use these contracts in your Next.js app, add to .env.local:"
        echo ""

        # Extract contract addresses from the broadcast file
        # This is a simple extraction - you may need to adjust based on actual output
        echo "NEXT_PUBLIC_OMA_ACCOUNT_ADDRESS="
        echo "NEXT_PUBLIC_POLICY_MODULE_ADDRESS="
        echo "NEXT_PUBLIC_VENUE_ADAPTER_ADDRESS="
        echo ""
        echo "Check contracts/broadcast/Deploy.s.sol/31337/run-latest.json for deployed addresses"
    fi
fi

echo ""
echo "✅ Deployment successful!"

cd ..
