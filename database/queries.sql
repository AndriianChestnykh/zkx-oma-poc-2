-- =============================================
-- Common Queries for ZKX OMA POC
-- Reference queries for development
-- =============================================

-- =============================================
-- Intent Queries
-- =============================================

-- Get all intents with pagination
-- SELECT * FROM intents
-- ORDER BY created_at DESC
-- LIMIT 20 OFFSET 0;

-- Get intent by ID with all details
-- SELECT * FROM intents
-- WHERE id = $1;

-- Get intents by user address
-- SELECT * FROM intents
-- WHERE user_address = $1
-- ORDER BY created_at DESC;

-- Get intents by status
-- SELECT * FROM intents
-- WHERE status = $1
-- ORDER BY created_at DESC;

-- Get pending intents (for processing)
-- SELECT * FROM intents
-- WHERE status IN ('created', 'validated')
-- ORDER BY created_at ASC;

-- Create new intent
-- INSERT INTO intents (
--   user_address, asset_in, asset_out, amount_in, amount_out_min,
--   venue, deadline, nonce, status
-- ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'created')
-- RETURNING *;

-- Update intent status
-- UPDATE intents
-- SET status = $1, updated_at = CURRENT_TIMESTAMP
-- WHERE id = $2
-- RETURNING *;

-- Update intent with signature
-- UPDATE intents
-- SET signature = $1, updated_at = CURRENT_TIMESTAMP
-- WHERE id = $2
-- RETURNING *;

-- Check if nonce is already used for a user
-- SELECT EXISTS (
--   SELECT 1 FROM intents
--   WHERE user_address = $1 AND nonce = $2
-- );

-- =============================================
-- Policy Queries
-- =============================================

-- Get all active policies ordered by priority
-- SELECT * FROM policies
-- WHERE enabled = true
-- ORDER BY priority DESC;

-- Get policy by ID
-- SELECT * FROM policies
-- WHERE id = $1;

-- Get policies by type
-- SELECT * FROM policies
-- WHERE policy_type = $1 AND enabled = true
-- ORDER BY priority DESC;

-- Create new policy
-- INSERT INTO policies (
--   name, description, policy_type, config, enabled, priority
-- ) VALUES ($1, $2, $3, $4, $5, $6)
-- RETURNING *;

-- Update policy
-- UPDATE policies
-- SET name = $1, description = $2, config = $3,
--     enabled = $4, priority = $5, updated_at = CURRENT_TIMESTAMP
-- WHERE id = $6
-- RETURNING *;

-- Enable/disable policy
-- UPDATE policies
-- SET enabled = $1, updated_at = CURRENT_TIMESTAMP
-- WHERE id = $2
-- RETURNING *;

-- Delete policy
-- DELETE FROM policies
-- WHERE id = $1;

-- =============================================
-- Execution Queries
-- =============================================

-- Get execution by ID
-- SELECT * FROM executions
-- WHERE id = $1;

-- Get executions for an intent
-- SELECT * FROM executions
-- WHERE intent_id = $1
-- ORDER BY executed_at DESC;

-- Get latest execution for an intent
-- SELECT * FROM executions
-- WHERE intent_id = $1
-- ORDER BY executed_at DESC
-- LIMIT 1;

-- Create new execution record
-- INSERT INTO executions (
--   intent_id, tx_hash, block_number, block_timestamp,
--   gas_used, status, revert_reason, actual_amount_out, execution_price
-- ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
-- RETURNING *;

-- Update execution with on-chain data
-- UPDATE executions
-- SET tx_hash = $1, block_number = $2, block_timestamp = $3,
--     gas_used = $4, status = $5, actual_amount_out = $6,
--     execution_price = $7
-- WHERE id = $8
-- RETURNING *;

-- Get successful executions count
-- SELECT COUNT(*) FROM executions
-- WHERE status = 'success';

-- Get failed executions with reasons
-- SELECT e.*, i.user_address, i.venue
-- FROM executions e
-- JOIN intents i ON e.intent_id = i.id
-- WHERE e.status IN ('failed', 'reverted')
-- ORDER BY e.executed_at DESC;

-- =============================================
-- Audit Artifact Queries
-- =============================================

-- Get audit trail for an intent
-- SELECT * FROM audit_artifacts
-- WHERE intent_id = $1
-- ORDER BY created_at ASC;

-- Get audit artifacts for an execution
-- SELECT * FROM audit_artifacts
-- WHERE execution_id = $1
-- ORDER BY created_at ASC;

-- Create audit artifact
-- INSERT INTO audit_artifacts (
--   intent_id, execution_id, artifact_type, data
-- ) VALUES ($1, $2, $3, $4)
-- RETURNING *;

-- Get policy evaluation artifacts for an intent
-- SELECT * FROM audit_artifacts
-- WHERE intent_id = $1 AND artifact_type = 'policy_evaluation'
-- ORDER BY created_at ASC;

-- Get event logs for an execution
-- SELECT * FROM audit_artifacts
-- WHERE execution_id = $1 AND artifact_type = 'event_decoded'
-- ORDER BY created_at ASC;

-- Get error logs
-- SELECT * FROM audit_artifacts
-- WHERE artifact_type = 'error_logged'
-- ORDER BY created_at DESC
-- LIMIT 50;

-- =============================================
-- Combined Queries (Joins)
-- =============================================

-- Get intent with execution and audit data
-- SELECT
--   i.*,
--   e.tx_hash, e.status as execution_status, e.gas_used,
--   COUNT(a.id) as artifact_count
-- FROM intents i
-- LEFT JOIN executions e ON i.id = e.intent_id
-- LEFT JOIN audit_artifacts a ON i.id = a.intent_id
-- WHERE i.id = $1
-- GROUP BY i.id, e.id;

-- Get dashboard statistics
-- SELECT
--   COUNT(*) FILTER (WHERE status = 'executed') as executed_count,
--   COUNT(*) FILTER (WHERE status IN ('created', 'validated')) as pending_count,
--   COUNT(*) FILTER (WHERE status = 'rejected') as rejected_count,
--   COUNT(*) as total_count
-- FROM intents;

-- Get recent activity (last 24 hours)
-- SELECT
--   i.id, i.user_address, i.status, i.venue,
--   i.asset_in, i.asset_out, i.amount_in,
--   i.created_at,
--   e.status as execution_status, e.tx_hash
-- FROM intents i
-- LEFT JOIN executions e ON i.id = e.intent_id
-- WHERE i.created_at > NOW() - INTERVAL '24 hours'
-- ORDER BY i.created_at DESC;

-- Get policy evaluation results for a specific intent
-- SELECT
--   a.data->>'policy_id' as policy_id,
--   a.data->>'result' as result,
--   a.data->>'reason' as reason,
--   p.name as policy_name,
--   p.policy_type,
--   a.created_at
-- FROM audit_artifacts a
-- LEFT JOIN policies p ON p.id = (a.data->>'policy_id')::uuid
-- WHERE a.intent_id = $1
--   AND a.artifact_type = 'policy_evaluation'
-- ORDER BY a.created_at ASC;

-- =============================================
-- Analytics Queries
-- =============================================

-- Venue usage statistics
-- SELECT
--   venue,
--   COUNT(*) as total_intents,
--   COUNT(*) FILTER (WHERE status = 'executed') as executed,
--   SUM(amount_in::numeric) as total_volume
-- FROM intents
-- GROUP BY venue
-- ORDER BY total_intents DESC;

-- Asset pair statistics
-- SELECT
--   asset_in,
--   asset_out,
--   COUNT(*) as swap_count,
--   AVG(amount_in::numeric) as avg_amount_in
-- FROM intents
-- WHERE status = 'executed'
-- GROUP BY asset_in, asset_out
-- ORDER BY swap_count DESC;

-- Policy rejection statistics
-- SELECT
--   a.data->>'policy_id' as policy_id,
--   p.name as policy_name,
--   COUNT(*) as rejection_count
-- FROM audit_artifacts a
-- LEFT JOIN policies p ON p.id = (a.data->>'policy_id')::uuid
-- WHERE a.artifact_type = 'policy_evaluation'
--   AND a.data->>'result' = 'fail'
-- GROUP BY a.data->>'policy_id', p.name
-- ORDER BY rejection_count DESC;
