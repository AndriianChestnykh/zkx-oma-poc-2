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
    success: 'bg-green-500',
    failed: 'bg-red-500',
    reverted: 'bg-orange-500',
    pending: 'bg-yellow-500',
  };

  const statusColor = statusColors[execution.status] || 'bg-gray-500';

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Execution Details</h2>
          <Badge className={statusColor}>{execution.status.toUpperCase()}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {execution.tx_hash && (
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Transaction Hash</dt>
            <dd className="mt-1 text-sm text-foreground flex items-center gap-2">
              <code className="bg-muted px-2 py-1 rounded text-xs">
                {execution.tx_hash}
              </code>
              <a
                href={`https://etherscan.io/tx/${execution.tx_hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:opacity-80"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </dd>
          </div>
        )}

        {execution.block_number && (
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Block Number</dt>
            <dd className="mt-1 text-sm text-foreground">
              {execution.block_number.toLocaleString()}
            </dd>
          </div>
        )}

        {execution.block_timestamp && (
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Block Timestamp</dt>
            <dd className="mt-1 text-sm text-foreground">
              {new Date(execution.block_timestamp * 1000).toLocaleString()}
            </dd>
          </div>
        )}

        {execution.gas_used && (
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Gas Used</dt>
            <dd className="mt-1 text-sm text-foreground">
              {execution.gas_used.toLocaleString()} gas
            </dd>
          </div>
        )}

        {execution.actual_amount_out && (
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Actual Amount Out</dt>
            <dd className="mt-1 text-sm text-foreground font-mono">
              {execution.actual_amount_out}
            </dd>
          </div>
        )}

        {execution.execution_price && (
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Execution Price</dt>
            <dd className="mt-1 text-sm text-foreground font-mono">
              {execution.execution_price}
            </dd>
          </div>
        )}

        {execution.revert_reason && (
          <div>
            <dt className="text-sm font-medium text-status-error">Revert Reason</dt>
            <dd className="mt-1 text-sm text-status-error bg-status-error/10 p-2 rounded">
              {execution.revert_reason}
            </dd>
          </div>
        )}

        <div>
          <dt className="text-sm font-medium text-muted-foreground">Executed At</dt>
          <dd className="mt-1 text-sm text-foreground">
            {new Date(execution.executed_at).toLocaleString()}
          </dd>
        </div>
      </CardContent>
    </Card>
  );
}
