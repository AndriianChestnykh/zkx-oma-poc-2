/**
 * Status badge for intent statuses
 */
import { IntentStatus } from '@/types/intent';
import { Badge } from '@/components/ui/Badge';

interface IntentStatusBadgeProps {
  status: IntentStatus;
}

const statusConfig: Record<IntentStatus, { variant: 'default' | 'success' | 'warning' | 'error' | 'info'; label: string }> = {
  created: {
    variant: 'default',
    label: 'Created',
  },
  validated: {
    variant: 'info',
    label: 'Validated',
  },
  executing: {
    variant: 'warning',
    label: 'Executing',
  },
  executed: {
    variant: 'success',
    label: 'Executed',
  },
  rejected: {
    variant: 'error',
    label: 'Rejected',
  },
  failed: {
    variant: 'error',
    label: 'Failed',
  },
};

export function IntentStatusBadge({ status }: IntentStatusBadgeProps) {
  const config = statusConfig[status];

  return <Badge variant={config.variant}>{config.label}</Badge>;
}
