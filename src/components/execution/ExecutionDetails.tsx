/**
 * Execution Details Component
 * Displays blockchain execution information for an intent
 */
import { Execution } from '@/types/execution';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ExternalLink } from 'lucide-react';

interface ExecutionDetailsProps {
  execution: Execution;
}

export function ExecutionDetails({ execution }: ExecutionDetailsProps) {
  const statusColors = {
    success: 'bg-status-success/100',
    failed: 'bg-status-error/100',
    reverted: 'bg-orange-500',
    pending: 'bg-status-warning/100',
  };

  const statusColor = statusColors[execution.status] || 'bg-surface0';

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text-primary">Execution Details</h2>
          <Badge className={statusColor}>{execution.status.toUpperCase()}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {execution.tx_hash && (
          <div>
            <dt className="text-sm font-medium text-text-tertiary">Transaction Hash</dt>
            <dd className="mt-1 text-sm text-text-primary flex items-center gap-2">
              <code className="bg-surface px-2 py-1 rounded text-xs">
                {execution.tx_hash}
              </code>
              <a
                href={`https://etherscan.io/tx/${execution.tx_hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-blue-800"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </dd>
          </div>
        )}

        {execution.block_number && (
          <div>
            <dt className="text-sm font-medium text-text-tertiary">Block Number</dt>
            <dd className="mt-1 text-sm text-text-primary">
              {execution.block_number.toLocaleString()}
            </dd>
          </div>
        )}

        {execution.block_timestamp && (
          <div>
            <dt className="text-sm font-medium text-text-tertiary">Block Timestamp</dt>
            <dd className="mt-1 text-sm text-text-primary">
              {new Date(execution.block_timestamp * 1000).toLocaleString()}
            </dd>
          </div>
        )}

        {execution.gas_used && (
          <div>
            <dt className="text-sm font-medium text-text-tertiary">Gas Used</dt>
            <dd className="mt-1 text-sm text-text-primary">
              {execution.gas_used.toLocaleString()} gas
            </dd>
          </div>
        )}

        {execution.actual_amount_out && (
          <div>
            <dt className="text-sm font-medium text-text-tertiary">Actual Amount Out</dt>
            <dd className="mt-1 text-sm text-text-primary font-mono">
              {execution.actual_amount_out}
            </dd>
          </div>
        )}

        {execution.execution_price && (
          <div>
            <dt className="text-sm font-medium text-text-tertiary">Execution Price</dt>
            <dd className="mt-1 text-sm text-text-primary font-mono">
              {execution.execution_price}
            </dd>
          </div>
        )}

        {execution.revert_reason && (
          <div>
            <dt className="text-sm font-medium text-red-500">Revert Reason</dt>
            <dd className="mt-1 text-sm text-status-error bg-status-error/10 p-2 rounded">
              {execution.revert_reason}
            </dd>
          </div>
        )}

        <div>
          <dt className="text-sm font-medium text-text-tertiary">Executed At</dt>
          <dd className="mt-1 text-sm text-text-primary">
            {new Date(execution.executed_at).toLocaleString()}
          </dd>
        </div>
      </CardContent>
    </Card>
  );
}
