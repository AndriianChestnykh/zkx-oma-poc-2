# ZKX OMA POC - Claude Code Project Configuration

## Project Overview

This is a Proof of Concept for the ZKX Order Management Account (OMA) system. The project demonstrates a complete workflow for trade intent management with embedded policy enforcement and blockchain execution.

### Core Workflow
```
Intent Submission → Policy Validation → On-chain Execution → Audit Evidence
```

### Purpose
- Demonstrate trade intent lifecycle management
- Enforce compliance policies before execution
- Execute trades on-chain with full auditability
- Generate immutable audit trails for regulatory compliance

### Scope
This is a POC focused on enforceability and traceability rather than full venue integration. It uses local development infrastructure (Anvil, PostgreSQL) and mock venue adapters.

---

## Architecture

### High-Level System Diagram
```
┌─────────────────────────────────────────────────────────────┐
│                        Next.js App                          │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  UI Pages    │  │  API Routes  │  │  Components  │     │
│  │              │  │              │  │              │     │
│  │ • Dashboard  │  │ • Intents    │  │ • IntentForm │     │
│  │ • Intents    │  │ • Policies   │  │ • PolicyList │     │
│  │ • Policies   │  │ • Audit      │  │ • Timeline   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Business Logic Layer                    │  │
│  │                                                      │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │  │
│  │  │ Policy      │  │ Blockchain  │  │ Database    │ │  │
│  │  │ Engine      │  │ Executor    │  │ Access      │ │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘ │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                           │                    │
                           │                    │
                           ▼                    ▼
                  ┌─────────────────┐   ┌──────────────┐
                  │  Smart Contracts│   │  PostgreSQL  │
                  │                 │   │              │
                  │ • OMAAccount    │   │ • intents    │
                  │ • PolicyModule  │   │ • policies   │
                  │ • VenueAdapter  │   │ • executions │
                  │                 │   │ • audit      │
                  └─────────────────┘   └──────────────┘
                   Foundry (Anvil)
```

### Data Flow

**1. Intent Creation (Client-Side Signing)**
```
User Connects Wallet (MetaMask)
  ↓
Auto-fill User Address + Fetch Nonce (GET /api/intents/nonce?address=0x...)
  ↓
User Fills Form (Token Dropdowns, ETH Amounts)
  ↓
User Clicks "Create & Sign Intent"
  ↓
Wallet Popup → User Approves EIP-712 Signature
  ↓
API POST /api/intents (with signature)
  ↓
Validation (Zod Schema) → DB INSERT → Return Intent ID
  ↓
Nonce Refetched for Next Intent
```

**2. Policy Validation**
```
API POST /api/intents/:id/validate
  → Fetch Intent + Active Policies
  → Evaluate Each Policy (priority order)
  → Log Audit Artifacts
  → Update Intent Status (validated/rejected)
```

**3. On-chain Execution**
```
API POST /api/intents/:id/execute
  → Generate EIP-712 Signature
  → Call OMAAccount.executeIntent()
  → Wait for Transaction Receipt
  → Decode Events
  → Store Execution Record + Audit Artifacts
  → Update Intent Status (executed/failed)
```

---

## Technology Stack

### Frontend
- **Next.js 14+** - React framework with App Router
- **TypeScript** - Strict mode enabled for type safety
- **TailwindCSS** - Utility-first CSS framework
- **React Components** - Functional components with hooks
- **Wagmi** - React hooks for Ethereum (wallet connection, signing)
- **RainbowKit** - Wallet connection UI library
- **@tanstack/react-query** - Data fetching and caching (required by Wagmi)

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **PostgreSQL** - Relational database for all persistent data
- **Raw SQL** - No ORM, direct SQL queries with parameterization

### Blockchain
- **Foundry** - Ethereum development toolkit
  - Anvil - Local Ethereum node
  - Forge - Smart contract testing
  - Cast - Chain interaction CLI
- **Solidity ^0.8.20** - Smart contract language
- **viem** - TypeScript Ethereum library (modern alternative to ethers.js)

### Testing
- **Vitest** - Unit and integration testing for Next.js
- **Foundry Test** - Smart contract testing with Solidity

### Infrastructure
- **Docker Compose** - Local development environment
- **PostgreSQL 16** - Database container
- **Foundry Anvil** - Local blockchain container

---

## Code Conventions

### TypeScript

**Strict Mode Configuration**
```typescript
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true
  }
}
```

**Type Definitions**
- Define types in `src/types/` directory
- Use interfaces for object shapes
- Export all public types
- Match database schema exactly for data models

**Example:**
```typescript
// src/types/intent.ts
export interface Intent {
  id: string;
  user_address: string;
  asset_in: string;
  asset_out: string;
  amount_in: string;
  amount_out_min: string;
  venue: string;
  deadline: number;
  status: IntentStatus;
  nonce: number;
  signature: string | null;
  created_at: Date;
  updated_at: Date;
}

export type IntentStatus = 'created' | 'validated' | 'executing' | 'executed' | 'rejected' | 'failed';
```

### Database Access

**ALWAYS use raw SQL with parameterized queries**

**Pattern:**
```typescript
// src/lib/db/intents.ts
import { query } from './connection';

export async function createIntent(data: IntentInput): Promise<Intent> {
  const sql = `
    INSERT INTO intents (
      user_address, asset_in, asset_out, amount_in,
      amount_out_min, venue, deadline, nonce
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *
  `;

  const values = [
    data.user_address,
    data.asset_in,
    data.asset_out,
    data.amount_in,
    data.amount_out_min,
    data.venue,
    data.deadline,
    data.nonce
  ];

  const result = await query(sql, values);
  return result.rows[0];
}
```

**Never use:**
- String interpolation for SQL queries
- ORM abstractions (Prisma, TypeORM, etc.)
- Dynamic table/column names without validation

### Validation

**Use Zod for all input validation**

**Pattern:**
```typescript
// src/lib/security/validation.ts
import { z } from 'zod';

export const intentSchema = z.object({
  user_address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address'),
  asset_in: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid token address'),
  asset_out: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid token address'),
  amount_in: z.string().regex(/^\d+$/, 'Amount must be positive integer'),
  amount_out_min: z.string().regex(/^\d+$/, 'Amount must be positive integer'),
  venue: z.string().min(1).max(100),
  deadline: z.number().int().positive(),
  nonce: z.number().int().nonnegative()
});

export type IntentInput = z.infer<typeof intentSchema>;
```

**Validation Locations:**
1. **API Routes** - Validate all incoming requests
2. **Form Components** - Client-side validation for UX
3. **Database Layer** - Final validation before persistence

### Blockchain Interactions

**Use viem for all blockchain operations**

**Pattern:**
```typescript
// src/lib/blockchain/client.ts
import { createPublicClient, createWalletClient, http } from 'viem';
import { foundry } from 'viem/chains';

export const publicClient = createPublicClient({
  chain: foundry,
  transport: http(process.env.ANVIL_RPC_URL)
});

export const walletClient = createWalletClient({
  chain: foundry,
  transport: http(process.env.ANVIL_RPC_URL)
});
```

**Contract Interaction:**
```typescript
// src/lib/blockchain/executor.ts
import { walletClient } from './client';
import { omaAccountAbi, omaAccountAddress } from './contracts';

export async function executeIntentOnChain(intent: Intent, signature: string) {
  const hash = await walletClient.writeContract({
    address: omaAccountAddress,
    abi: omaAccountAbi,
    functionName: 'executeIntent',
    args: [intent, signature]
  });

  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  return { hash, receipt };
}
```

### Error Handling

**Custom Error Classes**

```typescript
// src/lib/utils/errors.ts
export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class DatabaseError extends Error {
  constructor(message: string, public originalError?: Error) {
    super(message);
    this.name = 'DatabaseError';
  }
}

export class NotFoundError extends Error {
  constructor(resource: string, id: string) {
    super(`${resource} with id ${id} not found`);
    this.name = 'NotFoundError';
  }
}
```

**API Error Responses**

```typescript
// src/app/api/intents/route.ts
import { NextResponse } from 'next/server';
import { ValidationError, NotFoundError } from '@/lib/utils/errors';

export async function POST(request: Request) {
  try {
    // ... handle request
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { error: error.message, field: error.field },
        { status: 400 }
      );
    }
    if (error instanceof NotFoundError) {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Styling

**TailwindCSS Utility Classes**

- Use utility classes directly in JSX
- Group related utilities (layout, spacing, colors)
- Extract common patterns to components, not custom CSS

**Pattern:**
```typescript
// src/components/intents/IntentCard.tsx
export function IntentCard({ intent }: { intent: Intent }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Intent #{intent.id.slice(0, 8)}
        </h3>
        <IntentStatusBadge status={intent.status} />
      </div>
      {/* ... */}
    </div>
  );
}
```

---

## Directory Organization

### `/src/app` - Next.js App Router
- **Pages** - File-based routing
- **API Routes** - Serverless endpoints
- **Layout** - Shared layouts

### `/src/components` - React Components
- **`/ui`** - Reusable primitives (Button, Card, Input)
- **`/intents`** - Intent-specific components
- **`/policies`** - Policy-specific components
- **`/audit`** - Audit-specific components

### `/src/lib` - Business Logic
- **`/db`** - Database access layer (one file per table)
- **`/blockchain`** - Blockchain interaction logic
- **`/policy`** - Policy evaluation engine
- **`/security`** - Security utilities (validation, auth)
- **`/utils`** - General utilities

### `/src/types` - TypeScript Definitions
- One file per domain model
- Match database schema exactly

### `/contracts` - Foundry Project
- **`/src`** - Smart contracts
- **`/test`** - Contract tests
- **`/script`** - Deployment scripts

### `/database` - SQL Files
- `schema.sql` - Complete database schema
- `seed.sql` - Initial data
- `queries.sql` - Common queries (reference)

### `/docker` - Infrastructure
- `docker-compose.yml` - Service definitions

### `/tests` - Application Tests
- **`/unit`** - Unit tests for business logic
- **`/integration`** - Integration tests for API routes

---

## Wallet Integration

### Overview

The application uses **client-side signing** for intent creation. Users connect their MetaMask (or other injected wallet) to sign intents using EIP-712 typed data signatures. This ensures users maintain full control of their private keys while providing cryptographic proof of intent authorship.

**Key Components:**
- **Wagmi** - React hooks for wallet connection and signing
- **RainbowKit** - Pre-built wallet connection UI
- **viem** - Ethereum library for type-safe contract interactions

### Wallet Connection Flow

```typescript
// 1. Wrap app with WalletProvider (in layout.tsx)
import { WalletProvider } from '@/components/wallet/WalletProvider';

export default function RootLayout({ children }) {
  return (
    <WalletProvider>
      {children}
    </WalletProvider>
  );
}

// 2. Add WalletButton to UI
import { WalletButton } from '@/components/wallet/WalletButton';

<WalletButton /> // Renders RainbowKit's ConnectButton
```

### Client-Side Intent Signing

**Pattern:**
```typescript
import { useAccount, useSignTypedData } from 'wagmi';
import { EIP712_DOMAIN, INTENT_TYPES, formDataToTypedMessage } from '@/lib/wallet/eip712';

function IntentForm() {
  const { address, isConnected } = useAccount();
  const { signTypedDataAsync } = useSignTypedData();

  const handleSubmit = async (formData) => {
    // 1. Fetch nonce from API
    const nonceRes = await fetch(`/api/intents/nonce?address=${address}`);
    const { nonce } = await nonceRes.json();

    // 2. Prepare typed data message
    const message = formDataToTypedMessage(formData, address, nonce);

    // 3. Request signature from wallet
    const signature = await signTypedDataAsync({
      domain: EIP712_DOMAIN,
      types: INTENT_TYPES,
      primaryType: 'Intent',
      message,
    });

    // 4. Submit intent with signature
    const response = await fetch('/api/intents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...formData,
        user_address: address,
        nonce,
        signature,
      }),
    });
  };
}
```

### EIP-712 Type Definitions

**Shared types for client and server** (defined in `src/lib/wallet/eip712.ts`):

```typescript
export const EIP712_DOMAIN = {
  name: 'OMAAccount',
  version: '1',
  chainId: 31337, // Foundry/Anvil local chain
  verifyingContract: CONTRACT_ADDRESSES.OMAAccount as Hex,
} as const;

export const INTENT_TYPES = {
  Intent: [
    { name: 'user', type: 'address' },
    { name: 'assetIn', type: 'address' },
    { name: 'assetOut', type: 'address' },
    { name: 'amountIn', type: 'uint256' },
    { name: 'amountOutMin', type: 'uint256' },
    { name: 'venue', type: 'string' },
    { name: 'deadline', type: 'uint256' },
    { name: 'nonce', type: 'uint256' },
  ],
} as const;
```

### Nonce Management

**API Endpoint:** `GET /api/intents/nonce?address=0x...`

**Purpose:** Fetch the next available nonce for a user address to prevent replay attacks.

**Implementation:**
```typescript
// src/lib/db/intents.ts
export async function getNextNonce(userAddress: string): Promise<number> {
  const sql = `
    SELECT COALESCE(MAX(nonce), -1) + 1 as next_nonce
    FROM intents
    WHERE user_address = $1
  `;

  const result = await query<{ next_nonce: number }>(sql, [userAddress]);
  return result.rows[0]?.next_nonce || 0;
}
```

**Usage Pattern:**
```typescript
// Fetch nonce when wallet connects
useEffect(() => {
  if (address) {
    fetchNonce(); // Load current nonce
  }
}, [address]);

// Refetch after successful submission
const handleSubmit = async () => {
  // ... submit intent
  await fetchNonce(); // Get next nonce for subsequent intents
};
```

**Critical:** Always refetch nonce after successful intent creation to prevent race conditions when creating multiple intents in quick succession.

### Token Configuration

**Hardcoded token list** (in `src/components/intents/IntentForm.tsx`):

```typescript
const TOKENS = [
  {
    symbol: 'USDT',
    name: 'Tether USD',
    address: '0x94373a4919B3240D86eA41593D5eBa789FEF3848',
  },
  {
    symbol: 'WBTC',
    name: 'Wrapped Bitcoin',
    address: '0x1613beB3B2C4f22Ee086B2b38C1476A3cE7f78E8',
  },
  {
    symbol: 'WETH',
    name: 'Wrapped Ether',
    address: '0xD31a59c85aE9D8edEFeC411D448f90841571b89c',
  },
] as const;
```

**Token dropdown component:**
```typescript
<select
  value={formData.asset_in}
  onChange={(e) => setFormData({ ...formData, asset_in: e.target.value })}
>
  <option value="">Select token</option>
  {TOKENS.map((token) => (
    <option key={token.address} value={token.address}>
      {token.symbol} - {token.name}
    </option>
  ))}
</select>
```

### Amount Input (ETH ↔ Wei Conversion)

**Use viem utilities for conversion:**

```typescript
import { parseEther, formatEther } from 'viem';

// User input in ETH (human-readable)
const [amountInEth, setAmountInEth] = useState('');

// Convert to wei for blockchain
const handleSubmit = () => {
  const amountInWei = parseEther(amountInEth); // "1.5" → "1500000000000000000"

  // Submit wei value to API
  await createIntent({ amount_in: amountInWei.toString() });
};

// Display wei as ETH
const displayAmount = formatEther(BigInt(intent.amount_in)); // "1500000000000000000" → "1.5"
```

**Form input pattern:**
```typescript
<input
  type="number"
  step="0.000000000000000001"
  min="0"
  placeholder="Amount in ETH"
  value={amountInEth}
  onChange={(e) => setAmountInEth(e.target.value)}
/>
```

### Common Wagmi Hooks

**useAccount** - Get connected wallet info
```typescript
const { address, isConnected, isConnecting } = useAccount();

// Auto-fill user address in form
useEffect(() => {
  if (address) {
    setFormData({ ...formData, user_address: address });
  }
}, [address]);
```

**useSignTypedData** - Request EIP-712 signature
```typescript
const { signTypedDataAsync, isPending, error } = useSignTypedData();

const signature = await signTypedDataAsync({
  domain: EIP712_DOMAIN,
  types: INTENT_TYPES,
  primaryType: 'Intent',
  message: intentMessage,
});
```

**useWaitForTransactionReceipt** - Wait for transaction confirmation
```typescript
import { useWaitForTransactionReceipt } from 'wagmi';

const { data: receipt, isLoading } = useWaitForTransactionReceipt({
  hash: txHash,
});
```

### Error Handling

**Wallet Connection Errors:**
```typescript
if (!isConnected) {
  return (
    <div className="text-center py-8">
      <p className="text-gray-600 mb-4">Please connect your wallet to create intents</p>
      <WalletButton />
    </div>
  );
}
```

**Signature Rejection:**
```typescript
try {
  const signature = await signTypedDataAsync({ ... });
} catch (error: any) {
  if (error.message.includes('User rejected')) {
    setError('Signature rejected. Please approve in your wallet to continue.');
  } else {
    setError('Failed to sign intent: ' + error.message);
  }
}
```

**Nonce Fetch Failures:**
```typescript
const fetchNonce = async () => {
  try {
    const res = await fetch(`/api/intents/nonce?address=${address}`);
    const data = await res.json();

    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch nonce');
    }

    setNonce(data.nonce);
  } catch (error: any) {
    console.error('Failed to fetch nonce:', error);
    setError('Failed to load nonce. Please refresh the page and try again.');
    setNonce(null); // Keep as null to block form submission
  }
};
```

**Critical:** Never silently fallback to `nonce=0` on error, as this can cause transaction conflicts for users with existing intents.

### Wagmi Configuration

**Setup for Foundry/Anvil** (`src/lib/wallet/config.ts`):

```typescript
import { http, createConfig } from 'wagmi';
import { foundry } from 'wagmi/chains';
import { QueryClient } from '@tanstack/react-query';

export const wagmiConfig = createConfig({
  chains: [foundry],
  transports: {
    [foundry.id]: http('http://localhost:8545'),
  },
});

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});
```

**Environment Variables:**
```bash
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=<your-project-id> # Optional, for WalletConnect
ANVIL_RPC_URL=http://localhost:8545
```

### Testing Wallet Integration

**Mock wallet connection in tests:**
```typescript
import { vi } from 'vitest';

vi.mock('wagmi', () => ({
  useAccount: () => ({
    address: '0x1234567890123456789012345678901234567890',
    isConnected: true,
  }),
  useSignTypedData: () => ({
    signTypedDataAsync: vi.fn().mockResolvedValue('0xmocksignature...'),
    isPending: false,
  }),
}));
```

**Test nonce API endpoint:**
```typescript
describe('GET /api/intents/nonce', () => {
  it('should return next available nonce', async () => {
    const response = await fetch('/api/intents/nonce?address=0x123...');
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.nonce).toBe(0); // First nonce for new user
  });

  it('should return incremented nonce for existing user', async () => {
    // Create intent with nonce 0
    await createIntent({ user_address: '0x123...', nonce: 0 });

    const response = await fetch('/api/intents/nonce?address=0x123...');
    const data = await response.json();

    expect(data.nonce).toBe(1); // Next available nonce
  });
});
```

---

## Security Guidelines

### 1. SQL Injection Prevention

**ALWAYS use parameterized queries**

```typescript
// ✅ CORRECT
const sql = 'SELECT * FROM intents WHERE user_address = $1';
const result = await query(sql, [userAddress]);

// ❌ WRONG
const sql = `SELECT * FROM intents WHERE user_address = '${userAddress}'`;
const result = await query(sql);
```

### 2. Input Validation

**Validate all user input with Zod**

```typescript
// API route
export async function POST(request: Request) {
  const body = await request.json();

  // Validate with Zod
  const validatedData = intentSchema.parse(body);

  // Now safe to use validatedData
  await createIntent(validatedData);
}
```

### 3. Replay Protection

**Enforce unique nonce per user**

- Database constraint: `UNIQUE(user_address, nonce)`
- Check nonce before processing
- Store used nonces in database

```typescript
// Check if nonce already used
const exists = await checkNonceUsed(intent.user_address, intent.nonce);
if (exists) {
  throw new ValidationError('Nonce already used');
}
```

### 4. Authorization

**Verify EIP-712 signatures**

```typescript
// Generate signature (client-side or testing)
const signature = await signIntent(intent, privateKey);

// Verify signature (on-chain in smart contract)
// OMAAccount.sol verifies signature matches intent.user
```

### 5. Audit Logging

**Log all critical actions to audit_artifacts**

```typescript
await createAuditArtifact(
  intentId,
  'policy_evaluation',
  {
    policy_id: policy.id,
    policy_name: policy.name,
    result: passed ? 'pass' : 'fail',
    reason: reason || null
  }
);
```

**Audit Artifact Types:**
- `policy_evaluation` - Policy check results
- `transaction_submitted` - Blockchain tx submitted
- `event_decoded` - On-chain event processed
- `error_logged` - Error occurred
- `state_change` - Intent status changed

---

## Testing Guidelines

### Test File Naming

```
src/lib/policy/engine.ts
tests/unit/policy/engine.test.ts
```

### Required Coverage

**Every feature must have:**
1. **1 success path** - Happy path test
2. **2+ failure paths** - Error cases

**Example:**
```typescript
// tests/unit/policy/rules/allowDenyList.test.ts
import { describe, it, expect } from 'vitest';
import { checkAllowDenyList } from '@/lib/policy/rules/allowDenyList';

describe('checkAllowDenyList', () => {
  it('should pass when asset is in allowlist', () => {
    const result = checkAllowDenyList(intent, {
      mode: 'allowlist',
      addresses: ['0x123...']
    });
    expect(result.passed).toBe(true);
  });

  it('should fail when asset is not in allowlist', () => {
    const result = checkAllowDenyList(intent, {
      mode: 'allowlist',
      addresses: ['0x456...']
    });
    expect(result.passed).toBe(false);
    expect(result.reason).toContain('not in allowlist');
  });

  it('should fail when asset is in denylist', () => {
    const result = checkAllowDenyList(intent, {
      mode: 'denylist',
      addresses: ['0x123...']
    });
    expect(result.passed).toBe(false);
    expect(result.reason).toContain('in denylist');
  });
});
```

### Mock Patterns

**Mock blockchain interactions**

```typescript
import { vi } from 'vitest';

vi.mock('@/lib/blockchain/client', () => ({
  publicClient: {
    waitForTransactionReceipt: vi.fn().mockResolvedValue({ /* mock receipt */ })
  },
  walletClient: {
    writeContract: vi.fn().mockResolvedValue('0x123...')
  }
}));
```

**Database test isolation**

```typescript
// tests/setup.ts
import { beforeEach, afterEach } from 'vitest';

beforeEach(async () => {
  await query('BEGIN');
});

afterEach(async () => {
  await query('ROLLBACK');
});
```

### Foundry Contract Tests

**Pattern:**
```solidity
// contracts/test/OMAAccount.t.sol
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/OMAAccount.sol";

contract OMAAccountTest is Test {
    OMAAccount account;

    function setUp() public {
        account = new OMAAccount();
    }

    function test_ExecuteIntent_Success() public {
        // Arrange
        Intent memory intent = Intent({...});
        bytes memory signature = "...";

        // Act
        uint256 amountOut = account.executeIntent(intent, signature);

        // Assert
        assertGt(amountOut, 0);
    }

    function test_ExecuteIntent_FailsWhenAssetNotAllowed() public {
        Intent memory intent = Intent({...});

        // Expect revert with specific reason
        vm.expectRevert("Asset not in allowlist");
        account.executeIntent(intent, signature);
    }
}
```

---

## Development Workflow

### Initial Setup

```bash
# Clone repository
git clone <repo-url>
cd zkx-oma-poc-2

# Copy environment variables
cp .env.local.example .env.local

# Install dependencies
npm install

# Start Docker infrastructure
docker compose up -d

# Install Foundry dependencies
cd contracts && forge install && cd ..

# Deploy contracts to Anvil
./scripts/deploy-contracts.sh

# Start Next.js dev server
npm run dev
```

### Quick Commands (via Makefile)

**Recommended workflow using Makefile:**
```bash
make help          # Show all available commands
make reset         # Full reset (DB + contracts + volumes)
make start         # Start infrastructure
make stop          # Stop infrastructure
make deploy        # Deploy contracts only
make test          # Run all tests
make logs          # Follow container logs
make dev           # Start Next.js dev server
make status        # Show container status
```

**Common workflows:**
```bash
# Fresh start (when things are broken)
make reset && make dev

# Normal development
make start          # Start infrastructure
make dev            # Start Next.js

# Run tests
make test           # All tests
make test-watch     # Watch mode

# Infrastructure management
make logs           # View container logs
make status         # Check container health
make restart        # Restart containers (keeps data)
make db-reset       # Reset database only
```

### Manual Commands (Without Makefile)

If you prefer not to use Makefile:
```bash
# Start infrastructure (if not running)
docker compose up -d

# Start dev server
npm run dev

# In another terminal, watch tests
npm run test:watch

# Make changes...

# Run all tests
npm test
cd contracts && forge test && cd ..

# Reset database if needed
./scripts/reset-db.sh

# Full infrastructure reset
./scripts/reset-all.sh
```

### Running Tests

```bash
# Vitest (Next.js tests)
npm test                    # Run all tests
npm run test:watch          # Watch mode
npm run test:coverage       # Coverage report

# Foundry (contract tests)
cd contracts
forge test                  # Run all tests
forge test -vvv             # Verbose output
forge test --match-test testName  # Run specific test
```

### Database Management

```bash
# Access PostgreSQL
docker exec -it oma-postgres psql -U oma_user -d oma_poc

# View intents
docker exec -it oma-postgres psql -U oma_user -d oma_poc -c "SELECT * FROM intents;"

# Reset database
./scripts/reset-db.sh
```

### Contract Deployment

```bash
# Deploy to Anvil
./scripts/deploy-contracts.sh

# Manually deploy
cd contracts
forge script script/Deploy.s.sol:DeployScript \
  --rpc-url $ANVIL_RPC_URL \
  --private-key $PRIVATE_KEY \
  --broadcast
```

---

## Common Patterns

### API Route Structure

```typescript
// src/app/api/intents/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { intentSchema } from '@/lib/security/validation';
import { createIntent, listIntents } from '@/lib/db/intents';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');

    const intents = await listIntents({ status });
    return NextResponse.json({ intents });
  } catch (error) {
    console.error('Error fetching intents:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = intentSchema.parse(body);

    const intent = await createIntent(validatedData);
    return NextResponse.json({ intent }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error creating intent:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Database Query Pattern

```typescript
// src/lib/db/intents.ts
import { query } from './connection';
import type { Intent, IntentInput } from '@/types/intent';

export async function getIntentById(id: string): Promise<Intent | null> {
  const sql = 'SELECT * FROM intents WHERE id = $1';
  const result = await query(sql, [id]);
  return result.rows[0] || null;
}

export async function listIntents(filters?: {
  status?: string;
  userAddress?: string;
}): Promise<Intent[]> {
  let sql = 'SELECT * FROM intents WHERE 1=1';
  const values: any[] = [];
  let paramCount = 1;

  if (filters?.status) {
    sql += ` AND status = $${paramCount}`;
    values.push(filters.status);
    paramCount++;
  }

  if (filters?.userAddress) {
    sql += ` AND user_address = $${paramCount}`;
    values.push(filters.userAddress);
    paramCount++;
  }

  sql += ' ORDER BY created_at DESC';

  const result = await query(sql, values);
  return result.rows;
}
```

### Policy Evaluation Flow

```typescript
// src/lib/policy/engine.ts
import { getActivePolicies } from '@/lib/db/policies';
import { checkAllowDenyList } from './rules/allowDenyList';
import { checkTradeLimit } from './rules/tradeLimits';
import { checkVenueAllowlist } from './rules/venueAllowlist';
import { createAuditArtifact } from '@/lib/db/audit';

export async function evaluateIntent(intent: Intent): Promise<PolicyEvaluationResult[]> {
  const policies = await getActivePolicies();
  const results: PolicyEvaluationResult[] = [];

  for (const policy of policies) {
    let result: { passed: boolean; reason?: string };

    // Route to appropriate rule handler
    switch (policy.policy_type) {
      case 'allow_deny_list':
        result = await checkAllowDenyList(intent, policy.config);
        break;
      case 'trade_limit':
        result = await checkTradeLimit(intent, policy.config);
        break;
      case 'venue_allowlist':
        result = await checkVenueAllowlist(intent, policy.config);
        break;
      default:
        throw new Error(`Unknown policy type: ${policy.policy_type}`);
    }

    // Log audit artifact
    await createAuditArtifact(intent.id, 'policy_evaluation', {
      policy_id: policy.id,
      policy_name: policy.name,
      result: result.passed ? 'pass' : 'fail',
      reason: result.reason || null
    });

    results.push({
      policy_id: policy.id,
      policy_name: policy.name,
      passed: result.passed,
      reason: result.reason
    });

    // Short-circuit on first failure
    if (!result.passed) {
      break;
    }
  }

  return results;
}
```

### Event Decoding Pattern

```typescript
// src/lib/blockchain/eventDecoder.ts
import { publicClient } from './client';
import { omaAccountAbi } from './contracts';
import { decodeEventLog } from 'viem';

export async function decodeTransactionEvents(txHash: string) {
  const receipt = await publicClient.getTransactionReceipt({ hash: txHash });

  const decodedEvents = receipt.logs.map(log => {
    try {
      const decoded = decodeEventLog({
        abi: omaAccountAbi,
        data: log.data,
        topics: log.topics
      });
      return decoded;
    } catch {
      return null;
    }
  }).filter(Boolean);

  return decodedEvents;
}
```

---

## Troubleshooting

### Docker Container Issues

**PostgreSQL not starting**
```bash
# Check logs
docker logs oma-postgres

# Remove volume and restart
docker compose down -v
docker compose up -d
```

**Anvil not responding**
```bash
# Check if port 8545 is in use
lsof -i :8545

# Restart Anvil
docker restart oma-anvil
```

### Database Connection Errors

**Connection refused**
- Ensure Docker containers are running: `docker compose ps`
- Check `DATABASE_URL` in `.env.local`
- Verify PostgreSQL is healthy: `docker exec oma-postgres pg_isready`

**Schema not found**
- Reset database: `./scripts/reset-db.sh`
- Manually run schema: `docker exec -i oma-postgres psql -U oma_user -d oma_poc < database/schema.sql`

### Contract Deployment Failures

**Deployment script fails**
- Ensure Anvil is running: `docker ps | grep anvil`
- Check `ANVIL_RPC_URL` in `.env.local`
- Verify private key: `echo $PRIVATE_KEY`

**Contract not found**
- Update `.env.local` with deployed addresses
- Redeploy: `./scripts/deploy-contracts.sh`

### Common Test Failures

**Database tests fail**
- Ensure test database isolation (BEGIN/ROLLBACK)
- Check database connection in test setup
- Reset database: `./scripts/reset-db.sh`

**Contract tests fail**
- Clean build: `cd contracts && forge clean && forge build`
- Check Solidity version in `foundry.toml`
- Verbose output: `forge test -vvv`

### Infrastructure Out of Sync

**Symptom**: Contracts not responding, database state incorrect, weird errors, or general instability

**Solution - Nuclear Option (Recommended)**:
```bash
# Complete infrastructure reset
make reset

# Then start development
make dev
```

**What this does**:
1. Stops and removes all containers
2. Deletes all volumes (database data + Anvil state)
3. Restarts containers with fresh state
4. Redeploys contracts to Anvil
5. Reinitializes database with schema and seed data

**Manual alternative** (without Makefile):
```bash
./scripts/reset-all.sh
npm run dev
```

**When to use**:
- After pulling major changes from git
- When contract addresses are stale
- When database schema is out of sync
- When "nothing works" and you need a fresh start
- Before reporting a bug (to rule out local state issues)

**Recovery time**: Under 2 minutes from broken state to working application

---

## Quick Reference

### Infrastructure Commands (Makefile)

| Command | Description |
|---------|-------------|
| `make help` | Show all available commands |
| `make reset` | Complete reset (destroys all data, redeploys contracts) |
| `make start` | Start all containers |
| `make stop` | Stop all containers |
| `make restart` | Restart containers (keeps data) |
| `make deploy` | Deploy smart contracts to Anvil |
| `make status` | Show container status |
| `make logs` | Follow container logs |
| `make db-reset` | Reset database only (keep blockchain state) |
| `make clean` | Remove all containers, volumes, and build artifacts |
| `make setup` | Initial project setup |

### Development Commands (Makefile)

| Command | Description |
|---------|-------------|
| `make dev` | Start Next.js dev server |
| `make test` | Run all tests (Next.js + Foundry) |
| `make test-watch` | Run tests in watch mode |

### Manual Commands (Without Makefile)

```bash
# Infrastructure
./scripts/reset-all.sh       # Complete infrastructure reset
./scripts/reset-db.sh        # Reset database only
./scripts/deploy-contracts.sh # Deploy contracts to Anvil
docker compose up -d         # Start infrastructure
docker compose down          # Stop infrastructure

# Development
npm run dev                  # Start Next.js dev server

# Testing
npm test                     # Run Vitest tests
npm run test:watch           # Watch mode
cd contracts && forge test   # Run contract tests
cd contracts && forge test -vvv # Verbose test output

# Database
docker exec -it oma-postgres psql -U oma_user -d oma_poc

# Contracts
cd contracts && forge build  # Compile contracts

# Utilities
docker compose ps            # Check container status
docker logs oma-postgres     # View Postgres logs
docker logs oma-anvil        # View Anvil logs
```

### File Path Patterns

```
API Route:     src/app/api/[resource]/route.ts
Page:          src/app/[resource]/page.tsx
Component:     src/components/[feature]/[Component].tsx
Type:          src/types/[model].ts
DB Layer:      src/lib/db/[table].ts
Business Logic: src/lib/[domain]/[module].ts
Test:          tests/[unit|integration]/[module].test.ts
```

---

## Additional Resources

- **DevExecutionPlan.md** - Complete 4-step implementation guide
- **TechSpec.md** - Original technical requirements
- **Foundry Book** - https://book.getfoundry.sh/
- **viem Documentation** - https://viem.sh/
- **Next.js Documentation** - https://nextjs.org/docs
- **PostgreSQL Documentation** - https://www.postgresql.org/docs/
