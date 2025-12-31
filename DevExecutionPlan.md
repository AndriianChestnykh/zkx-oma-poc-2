# ZKX OMA POC - Development Execution Plan

## Project Overview

A proof-of-concept trade intent management system with embedded policy enforcement and blockchain execution. The system demonstrates: **Intent Submission → Policy Validation → On-chain Execution → Audit Evidence**.

### Technical Stack
- **Frontend/Backend**: Next.js 14+ (App Router) with TypeScript
- **Database**: PostgreSQL with raw SQL queries
- **Blockchain**: Foundry (Anvil local network) + Solidity
- **Ethereum Library**: viem
- **Testing**: Vitest for Next.js, Foundry tests for smart contracts
- **Infrastructure**: Docker Compose (Postgres + Anvil containers)

---

## Complete Directory Structure

```
zkx-oma-poc-claude/
├── README.md
├── TechSpec.md
├── DevExecutionPlan.md
├── CLAUDE.md
├── .gitignore
├── .env.local.example
├── .env.local
│
├── docker/
│   ├── docker-compose.yml
│   ├── postgres/
│   │   └── init.sql
│   └── anvil/
│       └── Dockerfile
│
├── database/
│   ├── schema.sql              # Complete database schema
│   ├── seed.sql                # Initial policy data
│   └── queries.sql             # Common queries for reference
│
├── contracts/                  # Foundry project
│   ├── foundry.toml
│   ├── script/
│   │   └── Deploy.s.sol
│   ├── src/
│   │   ├── OMAAccount.sol
│   │   ├── PolicyModule.sol
│   │   ├── VenueAdapterMock.sol
│   │   └── interfaces/
│   │       ├── IOMAAccount.sol
│   │       ├── IPolicyModule.sol
│   │       └── IVenueAdapter.sol
│   ├── test/
│   │   ├── OMAAccount.t.sol
│   │   ├── PolicyModule.t.sol
│   │   └── IntegrationTest.t.sol
│   └── lib/                    # Forge dependencies
│
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx            # Landing page / dashboard
│   │   ├── intents/
│   │   │   ├── page.tsx        # Intent list
│   │   │   ├── new/
│   │   │   │   └── page.tsx    # Intent creation form
│   │   │   └── [id]/
│   │   │       └── page.tsx    # Intent detail + audit timeline
│   │   ├── policies/
│   │   │   └── page.tsx        # Policy management view
│   │   └── api/
│   │       ├── intents/
│   │       │   ├── route.ts    # GET (list), POST (create)
│   │       │   ├── [id]/
│   │       │   │   ├── route.ts        # GET (detail), PATCH (update)
│   │       │   │   ├── validate/
│   │       │   │   │   └── route.ts    # POST (validate policies)
│   │       │   │   └── execute/
│   │       │   │       └── route.ts    # POST (execute on-chain)
│   │       ├── policies/
│   │       │   ├── route.ts    # GET (list), POST (create)
│   │       │   └── [id]/
│   │       │       └── route.ts        # GET, PATCH, DELETE
│   │       └── audit/
│   │           └── [intentId]/
│   │               └── route.ts        # GET (audit trail)
│   │
│   ├── components/
│   │   ├── ui/                 # Reusable UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Badge.tsx
│   │   │   └── Timeline.tsx
│   │   ├── intents/
│   │   │   ├── IntentForm.tsx
│   │   │   ├── IntentList.tsx
│   │   │   ├── IntentCard.tsx
│   │   │   └── IntentStatusBadge.tsx
│   │   ├── policies/
│   │   │   ├── PolicyList.tsx
│   │   │   ├── PolicyEvaluationResult.tsx
│   │   │   └── PolicyForm.tsx
│   │   └── audit/
│   │       ├── AuditTimeline.tsx
│   │       ├── EventDecoder.tsx
│   │       └── TransactionLink.tsx
│   │
│   ├── lib/
│   │   ├── db/
│   │   │   ├── connection.ts   # PostgreSQL connection pool
│   │   │   ├── intents.ts      # Intent queries
│   │   │   ├── policies.ts     # Policy queries
│   │   │   ├── executions.ts   # Execution queries
│   │   │   └── audit.ts        # Audit artifact queries
│   │   ├── blockchain/
│   │   │   ├── client.ts       # viem public/wallet clients
│   │   │   ├── contracts.ts    # Contract instances & ABIs
│   │   │   ├── executor.ts     # Intent execution logic
│   │   │   └── eventDecoder.ts # Event decoding utilities
│   │   ├── policy/
│   │   │   ├── engine.ts       # Main policy evaluation engine
│   │   │   ├── rules/
│   │   │   │   ├── allowDenyList.ts
│   │   │   │   ├── tradeLimits.ts
│   │   │   │   └── venueAllowlist.ts
│   │   │   └── types.ts        # Policy types & interfaces
│   │   ├── security/
│   │   │   ├── replayProtection.ts
│   │   │   ├── validation.ts   # Input validation
│   │   │   └── authorization.ts
│   │   └── utils/
│   │       ├── errors.ts       # Custom error classes
│   │       ├── logger.ts       # Logging utility
│   │       └── formatters.ts   # Data formatters
│   │
│   └── types/
│       ├── intent.ts           # Intent types
│       ├── policy.ts           # Policy types
│       ├── execution.ts        # Execution types
│       └── audit.ts            # Audit types
│
├── tests/
│   ├── unit/
│   │   ├── policy/
│   │   │   └── engine.test.ts
│   │   └── security/
│   │       └── validation.test.ts
│   ├── integration/
│   │   ├── intent-flow.test.ts
│   │   └── policy-execution.test.ts
│   └── setup.ts
│
├── scripts/
│   ├── setup-dev.sh            # Initial dev environment setup
│   ├── reset-db.sh             # Reset database to clean state
│   ├── deploy-contracts.sh     # Deploy contracts to Anvil
│   └── seed-policies.sh        # Seed initial policy data
│
├── package.json
├── tsconfig.json
├── next.config.js
├── vitest.config.ts
└── tailwind.config.ts
```

---

## Database Schema

### File: `database/schema.sql`

```sql
-- =============================================
-- ZKX OMA POC Database Schema
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- Table: intents
-- =============================================
CREATE TABLE intents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Intent parameters
    user_address VARCHAR(42) NOT NULL,          -- Ethereum address (0x...)
    asset_in VARCHAR(42) NOT NULL,              -- Token address
    asset_out VARCHAR(42) NOT NULL,             -- Token address
    amount_in NUMERIC(78, 0) NOT NULL,          -- Wei/smallest unit (supports uint256)
    amount_out_min NUMERIC(78, 0) NOT NULL,     -- Minimum acceptable output
    venue VARCHAR(100) NOT NULL,                -- e.g., "uniswap-v3", "curve"
    deadline BIGINT NOT NULL,                   -- Unix timestamp

    -- Lifecycle tracking
    status VARCHAR(20) NOT NULL DEFAULT 'created',
        CHECK (status IN ('created', 'validated', 'executing', 'executed', 'rejected', 'failed')),

    -- Replay protection
    nonce BIGINT NOT NULL,
    signature TEXT,                             -- EIP-712 signature (hex)

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Indexes for common queries
    CONSTRAINT unique_user_nonce UNIQUE (user_address, nonce)
);

CREATE INDEX idx_intents_user_address ON intents(user_address);
CREATE INDEX idx_intents_status ON intents(status);
CREATE INDEX idx_intents_created_at ON intents(created_at DESC);

-- =============================================
-- Table: policies
-- =============================================
CREATE TABLE policies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Policy identification
    name VARCHAR(255) NOT NULL,
    description TEXT,
    policy_type VARCHAR(50) NOT NULL,
        CHECK (policy_type IN ('allow_deny_list', 'trade_limit', 'venue_allowlist', 'custom')),

    -- Policy configuration (JSON)
    config JSONB NOT NULL,
    -- Examples:
    -- allow_deny_list: {"mode": "allowlist", "addresses": ["0x123...", "0x456..."]}
    -- trade_limit: {"asset": "0x123...", "max_amount": "1000000000000000000", "period_seconds": 86400}
    -- venue_allowlist: {"allowed_venues": ["uniswap-v3", "curve"]}

    -- State
    enabled BOOLEAN NOT NULL DEFAULT true,
    priority INTEGER NOT NULL DEFAULT 0,        -- Lower = evaluated first

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_policies_type ON policies(policy_type);
CREATE INDEX idx_policies_enabled ON policies(enabled);
CREATE INDEX idx_policies_priority ON policies(priority);

-- =============================================
-- Table: executions
-- =============================================
CREATE TABLE executions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Relations
    intent_id UUID NOT NULL REFERENCES intents(id) ON DELETE CASCADE,

    -- Blockchain data
    tx_hash VARCHAR(66),                        -- 0x + 64 hex chars
    block_number BIGINT,
    block_timestamp BIGINT,                     -- Unix timestamp from block
    gas_used BIGINT,

    -- Execution result
    status VARCHAR(20) NOT NULL,
        CHECK (status IN ('pending', 'success', 'reverted', 'failed')),
    revert_reason TEXT,                         -- Decoded revert reason if failed

    -- Decoded trade data (from events)
    actual_amount_out NUMERIC(78, 0),
    execution_price NUMERIC(36, 18),            -- Calculated price ratio

    -- Metadata
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_executions_intent_id ON executions(intent_id);
CREATE INDEX idx_executions_tx_hash ON executions(tx_hash);
CREATE INDEX idx_executions_status ON executions(status);

-- =============================================
-- Table: audit_artifacts
-- =============================================
CREATE TABLE audit_artifacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Relations
    intent_id UUID NOT NULL REFERENCES intents(id) ON DELETE CASCADE,
    execution_id UUID REFERENCES executions(id) ON DELETE SET NULL,

    -- Artifact classification
    artifact_type VARCHAR(50) NOT NULL,
        CHECK (artifact_type IN ('policy_evaluation', 'transaction_submitted', 'event_decoded', 'error_logged', 'state_change')),

    -- Artifact data
    data JSONB NOT NULL,
    -- Examples:
    -- policy_evaluation: {"policy_id": "uuid", "result": "pass", "reason": null}
    -- event_decoded: {"event_name": "TradeExecuted", "args": {...}}
    -- error_logged: {"error": "Insufficient liquidity", "stack": "..."}

    -- Immutability tracking
    hash VARCHAR(66),                           -- SHA-256 hash of data for verification

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_audit_intent_id ON audit_artifacts(intent_id);
CREATE INDEX idx_audit_execution_id ON audit_artifacts(execution_id);
CREATE INDEX idx_audit_type ON audit_artifacts(artifact_type);
CREATE INDEX idx_audit_created_at ON audit_artifacts(created_at DESC);

-- =============================================
-- Functions & Triggers
-- =============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_intents_updated_at
    BEFORE UPDATE ON intents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_policies_updated_at
    BEFORE UPDATE ON policies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Auto-generate artifact hash
CREATE OR REPLACE FUNCTION generate_artifact_hash()
RETURNS TRIGGER AS $$
BEGIN
    NEW.hash = encode(digest(NEW.data::text, 'sha256'), 'hex');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_audit_artifact_hash
    BEFORE INSERT ON audit_artifacts
    FOR EACH ROW
    EXECUTE FUNCTION generate_artifact_hash();
```

### File: `database/seed.sql`

```sql
-- =============================================
-- Seed Initial Policy Data
-- =============================================

-- Venue allowlist policy
INSERT INTO policies (name, description, policy_type, config, enabled, priority)
VALUES (
    'Approved Venues Only',
    'Restricts trading to approved decentralized exchanges',
    'venue_allowlist',
    '{"allowed_venues": ["uniswap-v3", "curve", "balancer"]}'::jsonb,
    true,
    10
);

-- Asset allowlist policy
INSERT INTO policies (name, description, policy_type, config, enabled, priority)
VALUES (
    'Approved Assets Allowlist',
    'Allows trading only for whitelisted token addresses',
    'allow_deny_list',
    '{
        "mode": "allowlist",
        "addresses": [
            "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
            "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
            "0x6B175474E89094C44Da98b954EedeAC495271d0F"
        ]
    }'::jsonb,
    true,
    20
);

-- Trade limit policy (daily max per asset)
INSERT INTO policies (name, description, policy_type, config, enabled, priority)
VALUES (
    'Daily Trade Limit - WETH',
    'Limits WETH trading to 10 ETH per day',
    'trade_limit',
    '{
        "asset": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        "max_amount": "10000000000000000000",
        "period_seconds": 86400
    }'::jsonb,
    true,
    30
);

-- User denylist policy (example)
INSERT INTO policies (name, description, policy_type, config, enabled, priority)
VALUES (
    'Sanctioned Addresses Blocklist',
    'Prevents trading from sanctioned addresses',
    'allow_deny_list',
    '{
        "mode": "denylist",
        "addresses": [
            "0x0000000000000000000000000000000000000001"
        ]
    }'::jsonb,
    true,
    5
);
```

---

## Smart Contract Architecture

### File: `contracts/src/interfaces/IOMAAccount.sol`

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IOMAAccount {
    struct Intent {
        address user;
        address assetIn;
        address assetOut;
        uint256 amountIn;
        uint256 amountOutMin;
        string venue;
        uint256 deadline;
        uint256 nonce;
    }

    event IntentSubmitted(bytes32 indexed intentId, address indexed user, Intent intent);
    event IntentExecuted(bytes32 indexed intentId, uint256 amountOut);
    event PolicyCheckPassed(bytes32 indexed intentId, string policyName);
    event PolicyCheckFailed(bytes32 indexed intentId, string policyName, string reason);

    function executeIntent(Intent calldata intent, bytes calldata signature) external returns (uint256);
}
```

### Contract Descriptions

#### `contracts/src/OMAAccount.sol`
**Purpose**: Main entry point for intent execution. Enforces policy checks and coordinates with venue adapters.

**Key Functions**:
- `executeIntent(Intent calldata intent, bytes calldata signature)` - Main execution function
- `validatePolicies(Intent calldata intent)` - Internal policy validation
- `_executeOnVenue(Intent calldata intent)` - Delegate to venue adapter

**Events**:
- `IntentSubmitted(bytes32 indexed intentId, address indexed user, Intent intent)`
- `PolicyCheckPassed(bytes32 indexed intentId, string policyName)`
- `PolicyCheckFailed(bytes32 indexed intentId, string policyName, string reason)`
- `IntentExecuted(bytes32 indexed intentId, uint256 amountOut)`

#### `contracts/src/PolicyModule.sol`
**Purpose**: Modular policy enforcement logic that can be called by OMAAccount.

**Key Functions**:
- `checkVenueAllowlist(address venue)` - Returns bool
- `checkAssetAllowlist(address asset)` - Returns bool
- `checkTradeLimit(address user, address asset, uint256 amount)` - Returns bool
- `updatePolicy(PolicyType policyType, bytes calldata config)` - Admin function

**Storage**:
- `mapping(address => bool) public allowedVenues`
- `mapping(address => bool) public allowedAssets`
- `mapping(address => mapping(address => uint256)) public userTradeLimits`

#### `contracts/src/VenueAdapterMock.sol`
**Purpose**: Mock venue adapter that simulates trade execution and emits events.

**Key Functions**:
- `executeTrade(address tokenIn, address tokenOut, uint256 amountIn, uint256 minAmountOut)` - Simulates trade
- `getExpectedOutput(address tokenIn, address tokenOut, uint256 amountIn)` - Mock pricing

**Events**:
- `TradeExecuted(address indexed tokenIn, address indexed tokenOut, uint256 amountIn, uint256 amountOut, uint256 timestamp)`

---

## Environment Variables

### File: `.env.local.example`

```bash
# =============================================
# Database Configuration
# =============================================
DATABASE_URL=postgresql://oma_user:oma_password@localhost:5432/oma_poc
POSTGRES_USER=oma_user
POSTGRES_PASSWORD=oma_password
POSTGRES_DB=oma_poc

# =============================================
# Blockchain Configuration (Anvil)
# =============================================
ANVIL_RPC_URL=http://localhost:8545
CHAIN_ID=31337

# Anvil default account (DO NOT use in production)
PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
DEPLOYER_ADDRESS=0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266

# =============================================
# Contract Addresses (populated after deployment)
# =============================================
OMA_ACCOUNT_ADDRESS=
POLICY_MODULE_ADDRESS=
VENUE_ADAPTER_ADDRESS=

# =============================================
# Application Configuration
# =============================================
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# =============================================
# Security
# =============================================
# In production, this should be a secure random value
SESSION_SECRET=dev-secret-change-in-production

# =============================================
# Logging
# =============================================
LOG_LEVEL=debug
```

---

## Docker Compose Setup

### File: `docker/docker-compose.yml`

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: oma-postgres
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-oma_user}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-oma_password}
      POSTGRES_DB: ${POSTGRES_DB:-oma_poc}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ../database/schema.sql:/docker-entrypoint-initdb.d/01-schema.sql
      - ../database/seed.sql:/docker-entrypoint-initdb.d/02-seed.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-oma_user}"]
      interval: 10s
      timeout: 5s
      retries: 5

  anvil:
    image: ghcr.io/foundry-rs/foundry:latest
    container_name: oma-anvil
    command: >
      anvil
      --host 0.0.0.0
      --port 8545
      --chain-id 31337
      --block-time 2
    ports:
      - "8545:8545"
    healthcheck:
      test: ["CMD", "cast", "client", "--rpc-url", "http://localhost:8545"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
    driver: local

networks:
  default:
    name: oma-network
```

---

## 4-Step Incremental Build Plan

### **STEP 1: Project Setup + Basic UI Scaffold**

#### Objective
Establish the foundational project structure, development environment, and basic UI navigation. After this step, you should have a working Next.js application with a navigable interface (no database or blockchain integration yet).

#### What Will Be Working
- Next.js app running on `localhost:3000`
- Basic UI layout with navigation (Header, Footer)
- Empty placeholder pages for: Dashboard, Intent List, Create Intent, Policies
- Docker containers running (Postgres + Anvil)
- Foundry project initialized with contract stubs
- Basic UI component library (Button, Card, Input, etc.)

#### Tasks & Files to Create

**1.1 Next.js Project Initialization**
```bash
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir --import-alias "@/*"
```

**Files to create:**
- `package.json` - Add dependencies: `viem`, `pg`, `zod`, `clsx`, `tailwind-merge`
- `tsconfig.json` - Configure path aliases
- `next.config.js` - Configure app settings
- `tailwind.config.ts` - Custom theme colors, spacing
- `.gitignore` - Standard Next.js + Foundry ignores

**1.2 Docker Infrastructure**
- `docker/docker-compose.yml` (as specified above)
- `database/schema.sql` (as specified above)
- `database/seed.sql` (as specified above)

**1.3 Foundry Project Setup**
```bash
cd contracts && forge init --no-git
```

**Files to create:**
- `contracts/foundry.toml` - Configure Solidity version, optimizer
- `contracts/src/OMAAccount.sol` - Empty contract stub with interface
- `contracts/src/PolicyModule.sol` - Empty contract stub
- `contracts/src/VenueAdapterMock.sol` - Empty contract stub
- `contracts/script/Deploy.s.sol` - Deployment script stub

**1.4 UI Component Library**
- `src/components/ui/Button.tsx` - Reusable button with variants
- `src/components/ui/Card.tsx` - Card container
- `src/components/ui/Input.tsx` - Form input
- `src/components/ui/Select.tsx` - Dropdown select
- `src/components/ui/Badge.tsx` - Status badges
- `src/components/ui/Timeline.tsx` - Timeline component (for audit view)

**1.5 Page Structure**
- `src/app/layout.tsx` - Root layout with navigation header
- `src/app/page.tsx` - Dashboard landing page (placeholder stats)
- `src/app/intents/page.tsx` - Intent list page (empty state)
- `src/app/intents/new/page.tsx` - Create intent form (UI only)
- `src/app/intents/[id]/page.tsx` - Intent detail page (placeholder)
- `src/app/policies/page.tsx` - Policy list page (placeholder)

**1.6 Type Definitions**
- `src/types/intent.ts` - Intent interface matching DB schema
- `src/types/policy.ts` - Policy interface matching DB schema
- `src/types/execution.ts` - Execution interface
- `src/types/audit.ts` - Audit artifact interface

**1.7 Utilities**
- `src/lib/utils/errors.ts` - Custom error classes
- `src/lib/utils/formatters.ts` - Date, number, address formatters

#### Acceptance Criteria
- [ ] `npm run dev` starts Next.js app on port 3000
- [ ] All pages are accessible via navigation links
- [ ] `docker compose up` starts Postgres + Anvil successfully
- [ ] Database tables are created automatically on Postgres init
- [ ] `forge build` compiles contract stubs without errors
- [ ] UI components render correctly with TailwindCSS styling
- [ ] No console errors in browser or terminal

#### Testing
- **Manual**: Navigate to all pages, verify UI renders
- **Docker**: `docker compose ps` shows healthy containers
- **Foundry**: `cd contracts && forge test` passes (no tests yet)

---

### **STEP 2: Intent CRUD + Database Integration**

#### Objective
Implement full intent CRUD operations with PostgreSQL persistence. After this step, users can create, view, list, and update intents through the UI (no policy validation or execution yet).

#### What Will Be Working
- Create new intents via form submission
- View list of all intents with status badges
- View individual intent details
- Update intent status manually (simulated lifecycle)
- Database connection established
- All intent data persisted in PostgreSQL

#### Tasks & Files to Create

**2.1 Database Connection**
- `src/lib/db/connection.ts`
  - Create PostgreSQL connection pool using `pg`
  - Export `query` function for raw SQL execution
  - Add connection health check

**2.2 Intent Database Layer**
- `src/lib/db/intents.ts`
  - `createIntent(data: IntentInput)` - INSERT query
  - `getIntentById(id: string)` - SELECT by ID
  - `listIntents(filters?: {status?, userAddress?})` - SELECT with filters
  - `updateIntentStatus(id: string, status: IntentStatus)` - UPDATE status
  - `checkNonceUsed(userAddress: string, nonce: number)` - Replay protection check

**2.3 API Routes**
- `src/app/api/intents/route.ts`
  - `GET /api/intents` - List all intents (with query filters)
  - `POST /api/intents` - Create new intent
- `src/app/api/intents/[id]/route.ts`
  - `GET /api/intents/:id` - Get single intent
  - `PATCH /api/intents/:id` - Update intent (status only for now)

**2.4 Frontend Components**
- `src/components/intents/IntentForm.tsx`
  - Form fields: user_address, asset_in, asset_out, amount_in, amount_out_min, venue, deadline
  - Client-side validation with Zod
  - Submit handler calling POST /api/intents
- `src/components/intents/IntentList.tsx`
  - Fetch and display intents from GET /api/intents
  - Filter controls (status, user address)
  - Click to navigate to detail page
- `src/components/intents/IntentCard.tsx`
  - Display intent summary with status badge
- `src/components/intents/IntentStatusBadge.tsx`
  - Color-coded badge based on status

**2.5 Page Implementation**
- `src/app/intents/new/page.tsx`
  - Render IntentForm
  - Handle form submission
  - Redirect to intent detail on success
- `src/app/intents/page.tsx`
  - Render IntentList
  - Add filter controls
- `src/app/intents/[id]/page.tsx`
  - Fetch intent detail from API
  - Display all intent fields
  - Show status and timestamps

**2.6 Input Validation**
- `src/lib/security/validation.ts`
  - Zod schemas for intent creation/update
  - Ethereum address validation
  - Amount validation (positive, within limits)
  - Deadline validation (future timestamp)

**2.7 Error Handling**
- `src/lib/utils/errors.ts`
  - `ValidationError` class
  - `DatabaseError` class
  - `NotFoundError` class
  - Error formatting for API responses

#### Acceptance Criteria
- [ ] User can submit intent form and receive success confirmation
- [ ] New intent appears in intent list immediately
- [ ] Intent detail page displays all fields correctly
- [ ] Database `intents` table contains correct data
- [ ] Duplicate nonce for same user is rejected (409 error)
- [ ] Invalid addresses/amounts show validation errors
- [ ] API returns proper HTTP status codes (200, 201, 400, 404, 500)

#### Testing
- **Unit Tests** (Vitest):
  - `tests/unit/security/validation.test.ts` - Test Zod schemas
  - Test valid/invalid intent data
- **Integration Tests**:
  - `tests/integration/intent-crud.test.ts`
  - Test full CRUD flow: create → read → list → update
  - Test database isolation (each test uses clean DB state)
- **Manual**:
  - Create 5+ intents with varying parameters
  - Verify data in Postgres: `docker exec -it oma-postgres psql -U oma_user -d oma_poc -c "SELECT * FROM intents;"`

---

### **STEP 3: Policy Engine + Validation**

#### Objective
Implement the embedded policy engine and integrate policy validation into the intent lifecycle. After this step, intents are automatically validated against active policies, with clear pass/fail results shown in the UI.

#### What Will Be Working
- Policy CRUD operations (create, list, update, delete policies)
- Policy evaluation engine with 3 rule types: allow/deny lists, trade limits, venue allowlists
- Intent validation API endpoint that returns policy results
- UI showing policy evaluation results (pass/fail with reasons)
- Audit artifacts logged for policy evaluations
- Intent status automatically updated to 'validated' or 'rejected' based on policies

#### Tasks & Files to Create

**3.1 Policy Database Layer**
- `src/lib/db/policies.ts`
  - `createPolicy(data: PolicyInput)` - INSERT
  - `getPolicyById(id: string)` - SELECT by ID
  - `listPolicies(filters?: {enabled?, type?})` - SELECT enabled policies
  - `updatePolicy(id: string, data: Partial<PolicyInput>)` - UPDATE
  - `deletePolicy(id: string)` - DELETE
  - `getActivePolicies()` - SELECT all enabled, ordered by priority

**3.2 Audit Artifacts Database Layer**
- `src/lib/db/audit.ts`
  - `createAuditArtifact(intentId: string, type: ArtifactType, data: any, executionId?: string)` - INSERT
  - `getAuditTrail(intentId: string)` - SELECT all artifacts for intent, ordered by created_at
  - `verifyArtifactHash(id: string)` - Verify data integrity

**3.3 Policy Engine Core**
- `src/lib/policy/engine.ts`
  - `evaluateIntent(intent: Intent, policies: Policy[])` - Main orchestrator
  - Returns: `PolicyEvaluationResult[]` (each policy result)
  - Logs audit artifacts for each evaluation
  - Short-circuits on first failure (configurable)

**3.4 Policy Rule Implementations**
- `src/lib/policy/rules/allowDenyList.ts`
  - `checkAllowDenyList(intent: Intent, config: AllowDenyListConfig)` - Check user/asset against lists
  - Returns: `{passed: boolean, reason?: string}`
- `src/lib/policy/rules/tradeLimits.ts`
  - `checkTradeLimit(intent: Intent, config: TradeLimitConfig)` - Check amount against daily limits
  - Query recent executions from DB to calculate usage
- `src/lib/policy/rules/venueAllowlist.ts`
  - `checkVenueAllowlist(intent: Intent, config: VenueAllowlistConfig)` - Check venue is approved

**3.5 Policy Types**
- `src/lib/policy/types.ts`
  - Interfaces for each policy config type
  - `PolicyEvaluationResult` interface
  - Rule handler registry

**3.6 API Routes**
- `src/app/api/policies/route.ts`
  - `GET /api/policies` - List policies
  - `POST /api/policies` - Create policy
- `src/app/api/policies/[id]/route.ts`
  - `GET /api/policies/:id` - Get policy
  - `PATCH /api/policies/:id` - Update policy
  - `DELETE /api/policies/:id` - Delete policy
- `src/app/api/intents/[id]/validate/route.ts`
  - `POST /api/intents/:id/validate` - Run policy evaluation
  - Updates intent status to 'validated' or 'rejected'
  - Returns full evaluation results

**3.7 Frontend Components**
- `src/components/policies/PolicyList.tsx`
  - Display all policies with type, status, priority
  - Toggle enabled/disabled
  - Edit/delete actions
- `src/components/policies/PolicyForm.tsx`
  - Create/edit policy form
  - Dynamic config fields based on policy_type
- `src/components/policies/PolicyEvaluationResult.tsx`
  - Display policy check results (checkmark/X with reasons)
  - Color-coded (green=pass, red=fail)

**3.8 Update Intent Flow**
- `src/app/intents/[id]/page.tsx`
  - Add "Validate Intent" button
  - Call POST /api/intents/:id/validate
  - Display policy evaluation results
  - Show updated status badge

**3.9 Page Implementation**
- `src/app/policies/page.tsx`
  - Render PolicyList
  - Add "Create Policy" button
  - Modal or separate page for PolicyForm

#### Acceptance Criteria
- [ ] User can create policies via UI
- [ ] Active policies are listed with correct priority order
- [ ] "Validate Intent" button triggers policy evaluation
- [ ] Policy results are clearly displayed (pass/fail with reasons)
- [ ] Intent with passing policies moves to 'validated' status
- [ ] Intent with failing policies moves to 'rejected' status
- [ ] Audit artifacts are created for each policy evaluation
- [ ] Trade limit policy correctly aggregates past executions
- [ ] Disabling a policy excludes it from evaluation
- [ ] Priority order is respected (lower priority evaluated first)

#### Testing
- **Unit Tests**:
  - `tests/unit/policy/engine.test.ts`
    - Test policy orchestration logic
    - Test short-circuit behavior
  - `tests/unit/policy/rules/*.test.ts`
    - Test each rule type with various configs
    - Test allowlist pass/fail
    - Test denylist pass/fail
    - Test trade limit within/over threshold
    - Test venue allowlist pass/fail
- **Integration Tests**:
  - `tests/integration/policy-execution.test.ts`
    - Create intent + policies → validate → check status
    - Test multiple policy interactions
    - Test policy priority ordering
    - Verify audit artifacts created
- **Manual**:
  - Create intent that passes all policies → status should be 'validated'
  - Create intent with sanctioned asset → status should be 'rejected'
  - Create intent exceeding trade limit → status should be 'rejected'
  - Create intent with unapproved venue → status should be 'rejected'

---

### **STEP 4: Blockchain Execution + Complete Audit Trail**

#### Objective
Integrate blockchain execution using Foundry contracts and viem. Complete the full end-to-end flow: intent creation → policy validation → on-chain execution → event decoding → audit trail display. This is the final step that completes the POC.

#### What Will Be Working
- Full smart contract implementation (OMAAccount, PolicyModule, VenueAdapterMock)
- Contract deployment to Anvil local network
- Intent execution triggering on-chain transactions
- Event decoding and persistence to `executions` table
- Complete audit timeline showing: creation → validation → execution → events
- Replay protection enforced on-chain
- Authorization verification (signature checking)
- Success and failure paths with revert reasons
- Full test coverage (Foundry + Vitest)

#### Tasks & Files to Create

**4.1 Smart Contract Implementation**
- `contracts/src/OMAAccount.sol`
  - Implement `executeIntent(Intent calldata intent, bytes calldata signature)`
  - Verify signature (EIP-712 or simple ECDSA)
  - Check nonce for replay protection
  - Call PolicyModule for on-chain policy checks
  - Delegate to VenueAdapterMock
  - Emit IntentSubmitted, PolicyCheckPassed/Failed, IntentExecuted events
- `contracts/src/PolicyModule.sol`
  - Implement venue allowlist storage and check
  - Implement asset allowlist storage and check
  - Admin functions to update policies
  - Emit PolicyUpdated events
- `contracts/src/VenueAdapterMock.sol`
  - Implement mock trade execution logic
  - Simple pricing oracle (fixed rates or random within bounds)
  - Emit TradeExecuted event with actual amounts
  - Revert if minAmountOut not met
- `contracts/src/interfaces/*.sol`
  - Complete all interfaces with full function signatures

**4.2 Contract Tests (Foundry)**
- `contracts/test/OMAAccount.t.sol`
  - **Success path**: Valid intent → all policies pass → execution succeeds
  - **Policy failure path 1**: Asset not in allowlist → revert with reason
  - **Policy failure path 2**: Venue not approved → revert with reason
  - **Replay protection**: Same nonce used twice → revert
  - **Deadline expired**: Intent past deadline → revert
  - Verify all events emitted with correct parameters
- `contracts/test/PolicyModule.t.sol`
  - Test policy update functions
  - Test allowlist/denylist logic
- `contracts/test/IntegrationTest.t.sol`
  - Full flow test: deploy → configure policies → execute intent → verify state

**4.3 Deployment**
- `contracts/script/Deploy.s.sol`
  - Deploy OMAAccount, PolicyModule, VenueAdapterMock
  - Initialize PolicyModule with seed policies
  - Log deployed addresses
- `scripts/deploy-contracts.sh`
  - Run forge script against Anvil
  - Update .env.local with deployed addresses
  - Verify deployment

**4.4 Blockchain Client Setup**
- `src/lib/blockchain/client.ts`
  - Initialize viem publicClient (for reading)
  - Initialize viem walletClient (for writing)
  - Export configured clients
- `src/lib/blockchain/contracts.ts`
  - Load contract ABIs (generated by Foundry)
  - Create contract instances for OMAAccount, PolicyModule, VenueAdapterMock
  - Export contract addresses and instances

**4.5 Execution Logic**
- `src/lib/blockchain/executor.ts`
  - `executeIntentOnChain(intent: Intent)` - Main execution function
    1. Generate signature (EIP-712 structured data)
    2. Call OMAAccount.executeIntent via walletClient
    3. Wait for transaction receipt
    4. Return tx hash and receipt
  - Error handling for reverts (decode revert reason)

**4.6 Event Decoding**
- `src/lib/blockchain/eventDecoder.ts`
  - `decodeTransactionEvents(txHash: string)` - Get logs and decode
  - `parseIntentExecutedEvent(log: Log)` - Extract intent execution data
  - `parseTradeExecutedEvent(log: Log)` - Extract trade data
  - `parsePolicyFailedEvent(log: Log)` - Extract policy failure reason

**4.7 Execution Database Layer**
- `src/lib/db/executions.ts`
  - `createExecution(intentId: string, data: ExecutionInput)` - INSERT
  - `updateExecution(id: string, data: Partial<ExecutionInput>)` - UPDATE
  - `getExecutionByIntentId(intentId: string)` - SELECT
  - `getExecutionsByUser(userAddress: string)` - For trade limit calculation

**4.8 API Routes**
- `src/app/api/intents/[id]/execute/route.ts`
  - `POST /api/intents/:id/execute` - Execute intent on-chain
    1. Verify intent status is 'validated'
    2. Call `executeIntentOnChain()`
    3. Decode events
    4. Create execution record
    5. Create audit artifacts for transaction and events
    6. Update intent status to 'executed' or 'failed'
    7. Return execution result
- `src/app/api/audit/[intentId]/route.ts`
  - `GET /api/audit/:intentId` - Get complete audit trail
  - Returns chronological list of all artifacts

**4.9 Frontend Components**
- `src/components/audit/AuditTimeline.tsx`
  - Display audit trail as timeline
  - Group artifacts by type
  - Format timestamps
  - Expandable details for each artifact
- `src/components/audit/EventDecoder.tsx`
  - Display decoded event data
  - Format addresses, amounts
- `src/components/audit/TransactionLink.tsx`
  - Link to Anvil transaction (local block explorer if available, or raw data)

**4.10 Update Intent Detail Page**
- `src/app/intents/[id]/page.tsx`
  - Add "Execute Intent" button (only shown if status = 'validated')
  - Call POST /api/intents/:id/execute
  - Add AuditTimeline component
  - Show execution details (tx hash, block number, gas used, amounts)
  - Link to transaction

**4.11 Security Implementation**
- `src/lib/security/replayProtection.ts`
  - `generateNonce()` - Generate unique nonce
  - `verifyNonceUnused(userAddress: string, nonce: number)` - Check DB
- `src/lib/security/authorization.ts`
  - `signIntent(intent: Intent, privateKey: string)` - Generate EIP-712 signature
  - `verifyIntentSignature(intent: Intent, signature: string)` - Verify signature

**4.12 Update Trade Limit Policy**
- `src/lib/policy/rules/tradeLimits.ts`
  - Query `executions` table for past successful trades
  - Aggregate amounts within time window
  - Compare against limit

#### Acceptance Criteria
- [ ] `forge test` passes all contract tests (1 success, 2+ policy failures)
- [ ] Contracts deploy successfully to Anvil
- [ ] User can execute validated intent via UI
- [ ] Transaction hash is returned and stored
- [ ] Events are decoded and displayed correctly
- [ ] Execution status updates to 'executed' on success
- [ ] Execution status updates to 'failed' on revert
- [ ] Revert reasons are captured and displayed
- [ ] Audit timeline shows complete intent lifecycle
- [ ] Replay attack (same nonce) is prevented on-chain
- [ ] Trade limit policy aggregates on-chain executions
- [ ] Unauthorized execution (invalid signature) is rejected

#### Testing
- **Foundry Tests**:
  - `contracts/test/OMAAccount.t.sol` - All paths covered
  - `contracts/test/PolicyModule.t.sol` - Policy logic verified
  - `contracts/test/IntegrationTest.t.sol` - Full flow test
- **Vitest Unit Tests**:
  - `tests/unit/blockchain/executor.test.ts` - Mock viem client
  - `tests/unit/blockchain/eventDecoder.test.ts` - Test event parsing
  - `tests/unit/security/authorization.test.ts` - Test signature generation/verification
- **Vitest Integration Tests**:
  - `tests/integration/intent-flow.test.ts` - Full flow: create → validate → execute
  - Test success case
  - Test policy failure case
  - Test execution revert case
  - Verify database state at each step
  - Verify audit artifacts created
- **Manual End-to-End Test**:
  1. Start Docker: `docker compose up`
  2. Deploy contracts: `./scripts/deploy-contracts.sh`
  3. Start Next.js: `npm run dev`
  4. Create intent via UI
  5. Validate intent → verify policies pass
  6. Execute intent → verify transaction succeeds
  7. Check Anvil logs for transaction
  8. Verify execution record in DB
  9. View audit timeline → verify all artifacts present
  10. Create intent that violates policy → verify rejection
  11. Attempt replay with same nonce → verify failure

---

## Security Threat Checklist

### 1. Intent Replay Protection
- [x] Unique nonce per user enforced in DB
- [x] On-chain nonce verification in OMAAccount
- [x] Database constraint: UNIQUE(user_address, nonce)

### 2. Execution Authorization
- [x] EIP-712 signature verification on-chain
- [x] Signature validation before execution
- [x] Only intent creator can execute (via signature)

### 3. Input Validation
- [x] Zod schema validation on all API inputs
- [x] Ethereum address format validation
- [x] Amount bounds checking (positive, non-zero)
- [x] Deadline validation (must be future timestamp)
- [x] SQL injection prevention (parameterized queries)

### 4. Policy Enforcement
- [x] Policies evaluated in priority order
- [x] Deterministic policy evaluation (no randomness)
- [x] Clear audit trail for policy decisions

### 5. Data Integrity
- [x] Audit artifact hashing (SHA-256)
- [x] Immutable audit log (no updates/deletes)
- [x] On-chain event emission for critical actions

### 6. Error Handling
- [x] Sanitized error messages (no sensitive data leakage)
- [x] Proper HTTP status codes
- [x] Revert reasons captured and logged

---

## Development Scripts

### File: `scripts/setup-dev.sh`
```bash
#!/bin/bash
set -e

echo "=== ZKX OMA POC - Development Setup ==="

# Install dependencies
echo "Installing npm dependencies..."
npm install

# Start Docker containers
echo "Starting Docker containers..."
docker compose up -d

# Wait for Postgres to be ready
echo "Waiting for Postgres..."
until docker exec oma-postgres pg_isready -U oma_user; do
  sleep 1
done

# Wait for Anvil to be ready
echo "Waiting for Anvil..."
sleep 3

# Install Foundry dependencies
echo "Installing Foundry dependencies..."
cd contracts && forge install && cd ..

# Deploy contracts
echo "Deploying contracts..."
./scripts/deploy-contracts.sh

echo "=== Setup complete! ==="
echo "Start the Next.js app with: npm run dev"
```

### File: `scripts/deploy-contracts.sh`
```bash
#!/bin/bash
set -e

cd contracts

echo "Deploying contracts to Anvil..."
forge script script/Deploy.s.sol:DeployScript \
  --rpc-url $ANVIL_RPC_URL \
  --private-key $PRIVATE_KEY \
  --broadcast

echo "Deployment complete!"
echo "Update .env.local with deployed addresses"
```

### File: `scripts/reset-db.sh`
```bash
#!/bin/bash
set -e

echo "Resetting database..."
docker exec -i oma-postgres psql -U oma_user -d oma_poc < database/schema.sql
docker exec -i oma-postgres psql -U oma_user -d oma_poc < database/seed.sql
echo "Database reset complete!"
```

---

## Testing Strategy

### Unit Tests (Vitest)
- Policy engine logic
- Validation functions
- Event decoding
- Signature generation/verification
- Formatters and utilities

### Integration Tests (Vitest)
- Full intent lifecycle: create → validate → execute
- Database operations with transaction rollback
- API endpoint behavior
- Error handling

### Contract Tests (Foundry)
- 1 success path (all policies pass, execution succeeds)
- 2+ failure paths (policy violations, reverts)
- Event emission verification
- State changes verification

### Manual Testing
- UI workflow testing
- Cross-browser compatibility
- Error message clarity
- Performance under load (multiple intents)

---

## Development Workflow

### Local Development Loop
1. Start infrastructure: `docker compose up -d`
2. Deploy contracts: `./scripts/deploy-contracts.sh` (only needed once or after contract changes)
3. Start Next.js: `npm run dev`
4. Make changes
5. Run tests: `npm test` (Vitest) or `cd contracts && forge test` (Foundry)
6. Reset DB if needed: `./scripts/reset-db.sh`

### Git Workflow
- Main branch: `main`
- Feature branches: `step-1/*`, `step-2/*`, `step-3/*`, `step-4/*`
- Each step should be merged to main after acceptance criteria met
- Tag releases: `v0.1-step1`, `v0.2-step2`, etc.

---

## Success Metrics

After completing all 4 steps, the POC demonstrates:

1. **Intent Lifecycle Management**
   - User submits intent via form
   - Intent is persisted and tracked through states
   - Status transitions are auditable

2. **Policy Enforcement**
   - Multiple policy types evaluated deterministically
   - Policy failures prevent execution with clear reasons
   - Policies are configurable via UI

3. **Blockchain Execution**
   - Validated intents execute on-chain
   - Events are emitted and decoded
   - Transaction data is persisted

4. **Audit Evidence**
   - Complete timeline of intent lifecycle
   - Policy evaluation results logged
   - On-chain events correlated with off-chain records
   - Immutable audit trail (hashed artifacts)

5. **Security**
   - Replay attacks prevented
   - Authorization enforced
   - Input validation comprehensive

6. **Test Coverage**
   - All contract functions tested
   - Critical API endpoints tested
   - Policy engine logic tested
   - End-to-end flow verified

---

## Next Steps (Post-POC)

If this POC is successful, future work could include:

1. **Multi-chain Support** - Execute on multiple networks (Arbitrum, Optimism, etc.)
2. **Real Venue Integration** - Replace mock adapter with actual DEX aggregators
3. **Advanced Policies** - Time-based restrictions, concentration limits, counterparty risk
4. **User Management** - Role-based access control, multi-user support
5. **Analytics Dashboard** - Execution metrics, policy hit rates, performance tracking
6. **WebSocket Integration** - Real-time intent status updates
7. **Gas Optimization** - Batch execution, gas price strategies
8. **Compliance Reporting** - Export audit trails, regulatory reports

---

## Reference

For detailed project context, coding conventions, and development patterns, see [CLAUDE.md](./CLAUDE.md).

For the original technical requirements, see [TechSpec.md](./TechSpec.md).
