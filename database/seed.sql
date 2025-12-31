-- =============================================
-- Seed Initial Policy Data
-- =============================================

-- Venue allowlist policy
INSERT INTO policies (name, description, policy_type, config, enabled, priority)
VALUES (
    'Approved Venues Only',
    'Restricts trading to approved decentralized exchanges',
    'venue_allowlist',
    '{"allowed_venues": ["MockVenue", "Uniswap", "SushiSwap"]}'::jsonb,
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
