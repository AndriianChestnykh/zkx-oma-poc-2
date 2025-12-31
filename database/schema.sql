-- =============================================
-- ZKX OMA POC Database Schema
-- =============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

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
